BEGIN;

-- A rejeição precisa pertencer à versão atual.
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
    JOIN public.validacoes v
      ON v.comprovante_id = c.id
     AND v.versao_comprovante = c.versao_atual
     AND v.decisao = 'rejeitado'
    WHERE c.id = p_comprovante_id
      AND i.perfil_id = (SELECT auth.uid())
      AND i.status = 'ativa'
      AND c.status = 'rejeitado'
      AND c.reenvios_utilizados < 3
      AND now() <= v.criado_em + interval '7 days'
  );
$$;

REVOKE ALL
ON FUNCTION public.pode_reenviar_comprovante(uuid)
FROM PUBLIC;

GRANT EXECUTE
ON FUNCTION public.pode_reenviar_comprovante(uuid)
TO authenticated;

-- Verifica se um caminho de arquivo pode ser usado
-- em uma alteração específica.
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
      AND i.perfil_id = (SELECT auth.uid())
      AND i.status = 'ativa'
      AND p_caminho LIKE
        i.id::text || '/' || c.id::text || '/%'
      AND NOT EXISTS (
        SELECT 1
        FROM public.comprovantes outro
        WHERE outro.id <> c.id
          AND outro.caminho_arquivo = p_caminho
      )
  );
$$;

REVOKE ALL
ON FUNCTION public.arquivo_valido_para_alteracao(uuid, text)
FROM PUBLIC;

GRANT EXECUTE
ON FUNCTION public.arquivo_valido_para_alteracao(uuid, text)
TO authenticated;

-- O participante pode enviar arquivos:
-- 1. No prazo original, para novos comprovantes;
-- 2. Durante o prazo de correção, no diretório do
--    comprovante rejeitado.
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
        (
          now() BETWEEN
            i.inicio_prazo_em AND i.fim_prazo_em
          AND array_length(storage.foldername(name), 1) = 1
        )
        OR EXISTS (
          SELECT 1
          FROM public.comprovantes c
          WHERE c.inscricao_id = i.id
            AND (storage.foldername(name))[2] = c.id::text
            AND public.pode_reenviar_comprovante(c.id)
        )
      )
  )
);

-- Restringe o caminho usado pela função de alteração.
-- Mantemos a implementação anterior e acrescentamos
-- uma verificação obrigatória antes da atualização.

CREATE OR REPLACE FUNCTION public.validar_arquivo_alteracao(
  p_comprovante_id uuid,
  p_caminho text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT public.arquivo_valido_para_alteracao(
    p_comprovante_id,
    p_caminho
  ) THEN
    RAISE EXCEPTION
      'Arquivo inválido para este comprovante';
  END IF;
END;
$$;

REVOKE ALL
ON FUNCTION public.validar_arquivo_alteracao(uuid, text)
FROM PUBLIC;

GRANT EXECUTE
ON FUNCTION public.validar_arquivo_alteracao(uuid, text)
TO authenticated;

COMMIT;
