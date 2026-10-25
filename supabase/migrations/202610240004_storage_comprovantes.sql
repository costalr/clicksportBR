-- ClicksportBR: armazenamento privado de comprovantes.

INSERT INTO storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
VALUES (
  'comprovantes-atividades',
  'comprovantes-atividades',
  false,
  10485760,
  ARRAY[
    'image/jpeg',
    'image/png',
    'application/pdf'
  ]
)
ON CONFLICT (id) DO UPDATE
SET
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- O primeiro segmento do caminho deve ser o ID
-- de uma inscrição pertencente ao usuário.

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
      AND now() >= i.inicio_prazo_em
      AND now() <= i.fim_prazo_em
  )
);

-- O participante pode ler somente os arquivos
-- vinculados às próprias inscrições.

CREATE POLICY "Participante le arquivos de sua inscricao"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'comprovantes-atividades'
  AND (
    EXISTS (
      SELECT 1
      FROM public.inscricoes i
      WHERE i.id::text = (storage.foldername(name))[1]
        AND i.perfil_id = (SELECT auth.uid())
    )
    OR (SELECT public.eh_administrador())
  )
);
