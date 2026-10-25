-- Exige inscrição ativa, dentro do prazo, e caminho coerente.

DROP POLICY IF EXISTS "Participante registra comprovante"
ON public.comprovantes;

CREATE POLICY "Participante registra comprovante"
ON public.comprovantes
FOR INSERT
TO authenticated
WITH CHECK (
  status = 'pendente'
  AND EXISTS (
    SELECT 1
    FROM public.inscricoes i
    WHERE i.id = inscricao_id
      AND i.perfil_id = (SELECT auth.uid())
      AND i.status = 'ativa'
      AND now() BETWEEN i.inicio_prazo_em AND i.fim_prazo_em
      AND caminho_arquivo LIKE i.id::text || '/%'
  )
);
