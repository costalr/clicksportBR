
BEGIN;

ALTER TABLE public.validacoes
  ADD COLUMN motivo_codigo text,
  ADD COLUMN observacao_administrador text;

ALTER TABLE public.validacoes
  ADD CONSTRAINT validacoes_motivo_codigo_check
  CHECK (
    motivo_codigo IS NULL OR motivo_codigo IN (
      'ilegivel', 'distancia', 'data',
      'incompleto', 'duplicado', 'outro'
    )
  );

CREATE OR REPLACE FUNCTION public.avaliar_comprovante_detalhado(
  p_comprovante_id uuid,
  p_versao integer,
  p_decisao text,
  p_motivo_codigo text,
  p_observacao_administrador text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  v_comprovante public.comprovantes%ROWTYPE;
  v_descricao text;
  v_observacao text;
  v_justificativa text;
BEGIN
  IF auth.uid() IS NULL OR NOT public.eh_administrador() THEN
    RAISE EXCEPTION 'Acesso restrito à administração';
  END IF;

  IF p_decisao IS NULL
     OR p_decisao NOT IN ('aprovado', 'rejeitado') THEN
    RAISE EXCEPTION 'Decisão inválida';
  END IF;

  IF p_decisao = 'rejeitado' THEN
    v_descricao := CASE p_motivo_codigo
      WHEN 'ilegivel' THEN
        'A imagem ou documento não permite conferir as informações da atividade.'
      WHEN 'distancia' THEN
        'A distância informada não corresponde à distância apresentada no comprovante.'
      WHEN 'data' THEN
        'A data apresentada não corresponde à atividade informada ou ao período permitido.'
      WHEN 'incompleto' THEN
        'O comprovante não apresenta dados suficientes para validar a atividade.'
      WHEN 'duplicado' THEN
        'O documento já foi utilizado em outro registro.'
      WHEN 'outro' THEN NULL
      ELSE
        'MOTIVO_INVALIDO'
    END;

    IF v_descricao = 'MOTIVO_INVALIDO'
       OR p_motivo_codigo IS NULL THEN
      RAISE EXCEPTION 'Motivo de rejeição inválido';
    END IF;

    v_observacao := NULLIF(btrim(p_observacao_administrador), '');

    IF p_motivo_codigo = 'outro' AND v_observacao IS NULL THEN
      RAISE EXCEPTION 'Informe a justificativa específica';
    END IF;

    v_justificativa := concat_ws(
      E'\n\n',
      v_descricao,
      v_observacao
    );
  ELSE
    IF p_motivo_codigo IS NOT NULL
       OR NULLIF(btrim(p_observacao_administrador), '') IS NOT NULL THEN
      RAISE EXCEPTION 'Aprovação não deve conter motivo de rejeição';
    END IF;
    v_observacao := NULL;
    v_justificativa := NULL;
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
    versao_comprovante,
    motivo_codigo,
    observacao_administrador
  ) VALUES (
    p_comprovante_id,
    auth.uid(),
    p_decisao,
    v_justificativa,
    p_versao,
    CASE WHEN p_decisao = 'rejeitado'
      THEN p_motivo_codigo ELSE NULL END,
    v_observacao
  );

  UPDATE public.comprovantes
  SET status = p_decisao,
      atualizado_em = now()
  WHERE id = p_comprovante_id;
END;
$function$;

REVOKE ALL ON FUNCTION public.avaliar_comprovante_detalhado(
  uuid, integer, text, text, text
) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.avaliar_comprovante_detalhado(
  uuid, integer, text, text, text
) TO authenticated;

COMMIT;
