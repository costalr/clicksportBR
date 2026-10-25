-- Guarda o nome original sem alterar o caminho privado do arquivo.
ALTER TABLE public.comprovantes
ADD COLUMN IF NOT EXISTS nome_original_arquivo text;

-- Evita nomes excessivamente longos.
ALTER TABLE public.comprovantes
ADD CONSTRAINT comprovantes_nome_original_tamanho
CHECK (
  nome_original_arquivo IS NULL
  OR char_length(nome_original_arquivo) <= 255
);
