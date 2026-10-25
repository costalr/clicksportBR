BEGIN;

-- Determina se um comprovante rejeitado ainda pode ser reenviado.
-- A última rejeição abre uma janela de 7 dias corridos.

CREATE OR REPLACE FUNCTION public.pode_reenviar_comprovante(
  p_comprovante_id uuid
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.comprovantes c
    JOIN public.inscricoes i
      ON i.id = c.inscricao_id
    JOIN LATERAL (
      SELECT v.criado_em
      FROM public.validacoes v
      WHERE v.comprovante_id = c.id
        AND v.decisao = 'rejeitado'
      ORDER BY v.criado_em DESC, v.id DESC
      LIMIT 1
    ) ultima_rejeicao ON true
    WHERE c.id = p_comprovante_id
      AND i.perfil_id = auth.uid()
      AND i.status = 'ativa'
      AND c.status = 'rejeitado'
      AND c.reenvios_utilizados < 3
      AND now() <= ultima_rejeicao.criado_em + interval '7 days'
  );
$$;

REVOKE ALL
ON FUNCTION public.pode_reenviar_comprovante(uuid)
FROM PUBLIC;

GRANT EXECUTE
ON FUNCTION public.pode_reenviar_comprovante(uuid)
TO authenticated;

-- Upload permitido no prazo original ou durante correção.
DROP POLICY IF EXISTS
"Participante envia arquivo de sua inscricao"
ON storage.objects;

CREATE POLICY "Participante envia arquivo de sua inscricao"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'comprovantes-atividades'
  AND EXISTS (
    SELECT 1
    FROM public.inscricoes i
    WHERE i.id::text = (storage.foldername(name))[1]
      AND i.perfil_id = (SELECT auth.uid())
      AND i.status = 'ativa'
      AND (
        now() BETWEEN i.inicio_prazo_em AND i.fim_prazo_em
        OR EXISTS (
          SELECT 1
          FROM public.comprovantes c
          WHERE c.inscricao_id = i.id
            AND public.pode_reenviar_comprovante(c.id)
        )
      )
  )
);

-- Substitui a função anterior para validar o prazo e o arquivo.
CREATE OR REPLACE FUNCTION public.alterar_comprovante(
  p_comprovante_id uuid,
  p_caminho_arquivo text,
  p_nome_original_arquivo text,
  p_distancia_km numeric,
  p_data_atividade date
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_comprovante public.comprovantes%ROWTYPE;
  v_inscricao public.inscricoes%ROWTYPE;
  v_reenvio boolean;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;

  SELECT *
  INTO v_comprovante
  FROM public.comprovantes
  WHERE id = p_comprovante_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Comprovante não encontrado';
  END IF;

  SELECT *
  INTO v_inscricao
  FROM public.inscricoes
  WHERE id = v_comprovante.inscricao_id;

  IF v_inscricao.perfil_id <> auth.uid()
     OR v_inscricao.status <> 'ativa' THEN
    RAISE EXCEPTION 'Operação não autorizada';
  END IF;

  IF v_comprovante.status NOT IN ('pendente', 'rejeitado') THEN
    RAISE EXCEPTION 'Comprovante não pode ser alterado';
  END IF;

  v_reenvio := v_comprovante.status = 'rejeitado';

  IF v_reenvio THEN
    IF NOT public.pode_reenviar_comprovante(p_comprovante_id) THEN
      RAISE EXCEPTION
        'Prazo ou limite de reenvios esgotado. Contate a administração.';
    END IF;
  ELSIF now() NOT BETWEEN
      v_inscricao.inicio_prazo_em AND v_inscricao.fim_prazo_em THEN
    RAISE EXCEPTION 'Prazo de edição encerrado';
  END IF;

  IF p_distancia_km IS NULL OR p_distancia_km <= 0 THEN
    RAISE EXCEPTION 'Distância inválida';
  END IF;

  IF p_data_atividade IS NULL
     OR p_data_atividade > CURRENT_DATE
     OR p_data_atividade < v_inscricao.inicio_prazo_em::date
     OR p_data_atividade > v_inscricao.fim_prazo_em::date THEN
    RAISE EXCEPTION 'Data fora do período do desafio';
  END IF;

  IF p_caminho_arquivo IS NULL
     OR p_caminho_arquivo NOT LIKE
        v_inscricao.id::text || '/%' THEN
    RAISE EXCEPTION 'Caminho de arquivo inválido';
  END IF;

  IF p_nome_original_arquivo IS NOT NULL
     AND char_length(p_nome_original_arquivo) > 255 THEN
    RAISE EXCEPTION 'Nome de arquivo muito longo';
  END IF;

  -- O arquivo deve existir no bucket privado.
  IF NOT EXISTS (
    SELECT 1
    FROM storage.objects o
    WHERE o.bucket_id = 'comprovantes-atividades'
      AND o.name = p_caminho_arquivo
  ) THEN
    RAISE EXCEPTION 'Arquivo não encontrado no armazenamento';
  END IF;

  INSERT INTO public.comprovante_versoes (
    comprovante_id,
    caminho_arquivo,
    nome_original_arquivo,
    distancia_informada_km,
    data_atividade,
    status_anterior,
    reenvios_anteriores,
    alterado_por,
    motivo
  )
  VALUES (
    v_comprovante.id,
    v_comprovante.caminho_arquivo,
    v_comprovante.nome_original_arquivo,
    v_comprovante.distancia_informada_km,
    v_comprovante.data_atividade,
    v_comprovante.status,
    v_comprovante.reenvios_utilizados,
    auth.uid(),
    CASE
      WHEN v_reenvio THEN 'reenvio_apos_rejeicao'
      ELSE 'edicao_pendente'
    END
  );

  UPDATE public.comprovantes
  SET
    caminho_arquivo = p_caminho_arquivo,
    nome_original_arquivo = p_nome_original_arquivo,
    distancia_informada_km = p_distancia_km,
    data_atividade = p_data_atividade,
    status = 'pendente',
    reenvios_utilizados =
      reenvios_utilizados + CASE WHEN v_reenvio THEN 1 ELSE 0 END,
    atualizado_em = now()
  WHERE id = v_comprovante.id;
END;
$$;

REVOKE ALL
ON FUNCTION public.alterar_comprovante(
  uuid, text, text, numeric, date
)
FROM PUBLIC;

GRANT EXECUTE
ON FUNCTION public.alterar_comprovante(
  uuid, text, text, numeric, date
)
TO authenticated;

COMMIT;
