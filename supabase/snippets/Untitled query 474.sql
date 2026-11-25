UPDATE public.ofertas_desafio
SET
  nome = 'Inscrição + Medalha 100 KM',
  descricao = 'Participação no desafio virtual de 100 km em 30 dias, com medalha após a conclusão.'
WHERE desafio_id = (
  SELECT id
  FROM public.desafios
  WHERE slug = 'clicksportbr-100km'
);