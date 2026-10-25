BEGIN;

-- Upload de novos comprovantes no prazo original:
-- inscricao_id/nome-do-arquivo
--
-- Edição ou reenvio:
-- inscricao_id/comprovante_id/nome-do-arquivo

DROP POLICY IF EXISTS
  "Participante envia arquivo de sua inscricao"
ON storage.objects;

CREATE POLICY "Participante envia arquivo de sua inscricao"
ON storage.objects
FOR INSERT TO authenticated
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
          now() BETWEEN i.inicio_prazo_em AND i.fim_prazo_em
          AND array_length(storage.foldername(name), 1) = 1
        )
        OR EXISTS (
          SELECT 1
          FROM public.comprovantes c
          WHERE c.inscricao_id = i.id
            AND (storage.foldername(name))[2] = c.id::text
            AND (
              (
                c.status = 'pendente'
                AND now() BETWEEN
                  i.inicio_prazo_em AND i.fim_prazo_em
              )
              OR public.pode_reenviar_comprovante(c.id)
            )
        )
      )
  )
);

COMMIT;
