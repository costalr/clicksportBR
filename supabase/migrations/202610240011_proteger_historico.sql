BEGIN;

-- O histórico só pode ser escrito pelas funções
-- controladas do banco, nunca diretamente pelo cliente.

REVOKE ALL PRIVILEGES
ON TABLE public.comprovante_versoes
FROM PUBLIC, anon, authenticated;

GRANT SELECT
ON TABLE public.comprovante_versoes
TO authenticated;

-- A escrita direta das avaliações também permanece bloqueada.

REVOKE INSERT, UPDATE, DELETE, TRUNCATE
ON TABLE public.validacoes
FROM PUBLIC, anon, authenticated;

-- Impede alterações diretas no comprovante.
-- Edição e reenvio devem usar a função controlada.

REVOKE UPDATE, DELETE, TRUNCATE
ON TABLE public.comprovantes
FROM PUBLIC, anon, authenticated;

COMMIT;
