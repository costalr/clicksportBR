BEGIN;

-- Garante uma única avaliação por versão.
-- Registros legados sem versão permanecem preservados.
CREATE UNIQUE INDEX IF NOT EXISTS
  idx_validacao_unica_por_versao
ON public.validacoes (
  comprovante_id,
  versao_comprovante
)
WHERE versao_comprovante IS NOT NULL;

-- Avaliação administrativa: status e decisão na mesma transação.
CREATE OR REPLACE FUNCTION public.avaliar_comprovante(
  p_comprovante_id uuid,
  p_versao integer,
  p_decisao text,
  p_justificativa text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_comprovante public.comprovantes%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL
     OR NOT public.eh_administrador() THEN
    RAISE EXCEPTION 'Acesso restrito à administração';
  END IF;

  IF p_decisao NOT IN ('aprovado', 'rejeitado') THEN
    RAISE EXCEPTION 'Decisão inválida';
  END IF;

  IF p_decisao = 'rejeitado'
     AND NULLIF(btrim(p_justificativa), '') IS NULL THEN
    RAISE EXCEPTION 'Informe o motivo da rejeição';
  END IF;

  SELECT *
  INTO v_comprovante
  FROM public.comprovantes
  WHERE id = p_comprovante_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Comprovante não encontrado';
  END IF;

  IF v_comprovante.versao_atual <> p_versao THEN
    RAISE EXCEPTION 'A versão foi alterada. Atualize a página.';
  END IF;

  IF v_comprovante.status NOT IN ('pendente', 'em_analise') THEN
    RAISE EXCEPTION 'Comprovante já avaliado';
  END IF;

  INSERT INTO public.validacoes (
    comprovante_id,
    gestor_id,
    decisao,
    justificativa,
    versao_comprovante
  )
  VALUES (
    p_comprovante_id,
    auth.uid(),
    p_decisao,
    NULLIF(btrim(p_justificativa), ''),
    p_versao
  );

  UPDATE public.comprovantes
  SET
    status = p_decisao,
    atualizado_em = now()
  WHERE id = p_comprovante_id;
END;
$$;

REVOKE ALL ON FUNCTION public.avaliar_comprovante(
  uuid, integer, text, text
) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.avaliar_comprovante(
  uuid, integer, text, text
) TO authenticated;

-- A edição usa a mesma linha bloqueada pela avaliação.
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
  v_rejeicao_em timestamptz;
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
    IF v_comprovante.reenvios_utilizados >= 3 THEN
      RAISE EXCEPTION 'Limite de três reenvios atingido';
    END IF;

    SELECT criado_em
    INTO v_rejeicao_em
    FROM public.validacoes
    WHERE comprovante_id = p_comprovante_id
      AND versao_comprovante = v_comprovante.versao_atual
      AND decisao = 'rejeitado'
    ORDER BY criado_em DESC
    LIMIT 1;

    IF v_rejeicao_em IS NULL
       OR now() > v_rejeicao_em + interval '7 days' THEN
      RAISE EXCEPTION
        'Prazo de reenvio encerrado. Contate a administração.';
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
    RAISE EXCEPTION 'Caminho inválido';
  END IF;

  IF p_nome_original_arquivo IS NOT NULL
     AND char_length(p_nome_original_arquivo) > 255 THEN
    RAISE EXCEPTION 'Nome do arquivo muito longo';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM storage.objects
    WHERE bucket_id = 'comprovantes-atividades'
      AND name = p_caminho_arquivo
  ) THEN
    RAISE EXCEPTION 'Arquivo não encontrado';
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
    versao_atual = versao_atual + 1,
    reenvios_utilizados =
      reenvios_utilizados + CASE WHEN v_reenvio THEN 1 ELSE 0 END,
    atualizado_em = now()
  WHERE id = p_comprovante_id;
END;
$$;

REVOKE ALL ON FUNCTION public.alterar_comprovante(
  uuid, text, text, numeric, date
) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.alterar_comprovante(
  uuid, text, text, numeric, date
) TO authenticated;

-- A leitura das justificativas é permitida ao proprietário
-- e aos administradores. A escrita continua via função.
DROP POLICY IF EXISTS
  "Participante le suas validacoes"
ON public.validacoes;

CREATE POLICY "Participante le suas validacoes"
ON public.validacoes
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.comprovantes c
    JOIN public.inscricoes i
      ON i.id = c.inscricao_id
    WHERE c.id = comprovante_id
      AND i.perfil_id = (SELECT auth.uid())
  )
);

COMMIT;
