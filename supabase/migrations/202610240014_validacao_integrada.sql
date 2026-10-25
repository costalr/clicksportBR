BEGIN;

-- Substitui a validação auxiliar para aceitar:
-- 1. O arquivo atual, quando não houver substituição;
-- 2. Um novo arquivo na pasta exclusiva do comprovante.

CREATE OR REPLACE FUNCTION public.arquivo_valido_para_alteracao(
  p_comprovante_id uuid,
  p_caminho text
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
    JOIN storage.objects o
      ON o.bucket_id = 'comprovantes-atividades'
     AND o.name = p_caminho
    WHERE c.id = p_comprovante_id
      AND i.perfil_id = auth.uid()
      AND i.status = 'ativa'
      AND (
        p_caminho = c.caminho_arquivo
        OR p_caminho LIKE
          i.id::text || '/' || c.id::text || '/%'
      )
      AND NOT EXISTS (
        SELECT 1
        FROM public.comprovantes outro
        WHERE outro.id <> c.id
          AND outro.caminho_arquivo = p_caminho
      )
  );
$$;

-- Integra a validação à função existente.
-- A substituição tolera diferenças de espaçamento,
-- mas exige uma correspondência única.

DO $migration$
DECLARE
  v_definicao text;
  v_nova_definicao text;
  v_padrao text;
BEGIN
  SELECT pg_get_functiondef(
    'public.alterar_comprovante(
      uuid,text,text,numeric,date
    )'::regprocedure
  )
  INTO v_definicao;

  v_padrao :=
    'IF\s+NOT\s+EXISTS\s*\(\s*'
    || 'SELECT\s+1\s+FROM\s+storage\.objects\s+'
    || 'WHERE\s+bucket_id\s*=\s*'
    || '''comprovantes-atividades''\s+'
    || 'AND\s+name\s*=\s*p_caminho_arquivo\s*'
    || '\)\s+THEN';

  v_nova_definicao := regexp_replace(
    v_definicao,
    v_padrao,
    'IF NOT public.arquivo_valido_para_alteracao('
      || E'\n      p_comprovante_id,'
      || E'\n      p_caminho_arquivo'
      || E'\n    ) THEN',
    'i'
  );

  IF v_nova_definicao = v_definicao THEN
    RAISE EXCEPTION
      'Trecho de validação não encontrado; operação cancelada';
  END IF;

  IF position(
    'FROM storage.objects' IN v_nova_definicao
  ) > 0 THEN
    RAISE EXCEPTION
      'Validação antiga ainda presente; operação cancelada';
  END IF;

  EXECUTE v_nova_definicao;
END;
$migration$;

COMMIT;
