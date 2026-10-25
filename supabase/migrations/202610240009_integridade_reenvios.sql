BEGIN;

-- Relaciona cada validação à versão do comprovante
-- que foi efetivamente avaliada.
ALTER TABLE public.comprovantes
ADD COLUMN IF NOT EXISTS versao_atual integer
NOT NULL DEFAULT 1;

ALTER TABLE public.validacoes
ADD COLUMN IF NOT EXISTS versao_comprovante integer;

-- Preserva as validações antigas, associando-as à versão
-- atual apenas quando ainda não há histórico de alterações.
UPDATE public.validacoes v
SET versao_comprovante = 1
FROM public.comprovantes c
WHERE c.id = v.comprovante_id
  AND v.versao_comprovante IS NULL
  AND NOT EXISTS (
    SELECT 1
    FROM public.comprovante_versoes cv
    WHERE cv.comprovante_id = c.id
  );

-- A ausência de versão nas validações antigas que já
-- possuem histórico exige reconciliação manual.
-- Não inventamos uma correspondência.

CREATE INDEX IF NOT EXISTS idx_validacoes_versao
ON public.validacoes (
  comprovante_id,
  versao_comprovante,
  criado_em DESC
);

-- A função de alteração existente é mantida.
-- Antes de disponibilizá-la, precisaremos atualizá-la
-- para incrementar versao_atual e conferir as avaliações.

COMMIT;
