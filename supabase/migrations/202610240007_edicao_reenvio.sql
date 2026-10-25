-- ClicksportBR: edição e reenvio controlados.
-- Aplicar primeiro em ambiente local de desenvolvimento.

BEGIN;

ALTER TABLE public.comprovantes
ADD COLUMN IF NOT EXISTS reenvios_utilizados integer
NOT NULL DEFAULT 0;

ALTER TABLE public.comprovantes
ADD COLUMN IF NOT EXISTS atualizado_em timestamptz
NOT NULL DEFAULT now();

ALTER TABLE public.comprovantes
ADD CONSTRAINT comprovantes_limite_reenvios
CHECK (reenvios_utilizados BETWEEN 0 AND 3);

ALTER TABLE public.comprovantes
DROP CONSTRAINT IF EXISTS comprovantes_status_check;

ALTER TABLE public.comprovantes
ADD CONSTRAINT comprovantes_status_check
CHECK (
  status IN (
    'pendente',
    'em_analise',
    'aprovado',
    'rejeitado'
  )
);

CREATE TABLE IF NOT EXISTS public.comprovante_versoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comprovante_id uuid NOT NULL
    REFERENCES public.comprovantes(id),
  caminho_arquivo text NOT NULL,
  nome_original_arquivo text,
  distancia_informada_km numeric(8,2),
  data_atividade date,
  status_anterior text NOT NULL,
  reenvios_anteriores integer NOT NULL,
  alterado_por uuid NOT NULL
    REFERENCES public.perfis(id),
  motivo text NOT NULL,
  criado_em timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_comprovante_versoes_comprovante
ON public.comprovante_versoes(comprovante_id, criado_em);

ALTER TABLE public.comprovante_versoes
ENABLE ROW LEVEL SECURITY;

-- O participante pode consultar seu histórico.
-- Administradores também podem consultar.
CREATE POLICY "Leitura do historico de comprovantes"
ON public.comprovante_versoes
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
  OR (SELECT public.eh_administrador())
);

GRANT SELECT ON public.comprovante_versoes
TO authenticated;

-- Não conceder UPDATE direto ao participante.
-- A alteração será feita exclusivamente pela função.
REVOKE UPDATE, DELETE
ON public.comprovantes
FROM authenticated;

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

  IF v_inscricao.perfil_id <> auth.uid() THEN
    RAISE EXCEPTION 'Acesso não autorizado';
  END IF;

  IF v_inscricao.status <> 'ativa' THEN
    RAISE EXCEPTION 'Inscrição não está ativa';
  END IF;

  IF v_comprovante.status NOT IN ('pendente', 'rejeitado') THEN
    RAISE EXCEPTION 'Comprovante não pode ser alterado';
  END IF;

  v_reenvio := v_comprovante.status = 'rejeitado';

  IF v_reenvio AND v_comprovante.reenvios_utilizados >= 3 THEN
    RAISE EXCEPTION
      'Limite de três reenvios atingido. Contate a administração.';
  END IF;

  IF p_distancia_km IS NULL OR p_distancia_km <= 0 THEN
    RAISE EXCEPTION 'Distância inválida';
  END IF;

  IF p_data_atividade IS NULL OR p_data_atividade > CURRENT_DATE THEN
    RAISE EXCEPTION 'Data da atividade inválida';
  END IF;

  IF p_nome_original_arquivo IS NOT NULL
     AND char_length(p_nome_original_arquivo) > 255 THEN
    RAISE EXCEPTION 'Nome de arquivo muito longo';
  END IF;

  IF p_caminho_arquivo IS NULL
     OR p_caminho_arquivo NOT LIKE
        v_inscricao.id::text || '/%' THEN
    RAISE EXCEPTION 'Caminho de arquivo inválido';
  END IF;

  -- O envio original precisa estar no prazo.
  -- Para reenvios, o prazo de correção será
  -- configurado em uma etapa posterior.
  IF NOT v_reenvio AND (
    now() < v_inscricao.inicio_prazo_em
    OR now() > v_inscricao.fim_prazo_em
  ) THEN
    RAISE EXCEPTION 'Prazo de edição encerrado';
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
