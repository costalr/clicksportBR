# 11 — Plano seguro de reconciliação e versionamento
**Data:** 25/10/2026

## Situação de partida
O relatório Git enviado pelo projeto mostrava arquivos de código alterados, migrações SQL 004–015 não rastreadas, `docs/` não rastreado e vários backups locais. **Não assumir que já existe commit de documentação ou de migrações.**

## Sequência recomendada
1. Copiar apenas os documentos atualizados do pacote de reconciliação para `docs/`, preservando os originais e criando backup local se necessário.
2. Revisar `git status --short` e `git diff -- docs/`; preparar exclusivamente documentação com `git add docs/`.
3. Conferir `git diff --cached --stat` e `git diff --cached --name-only`; só então criar commit `docs: reconcilia especificacao com codigo e migracoes`.
4. **Em etapa separada**, revisar as migrações 004–015 e verificar o estado real do banco antes de versionar/aplicar qualquer SQL. Evitar `git add .`.
5. Tratar divergências de produto em commits de código específicos, com testes, sem misturar com documentação.

## Comandos de conferência (somente leitura)
```bash
git status --short
git diff -- docs/
git diff --cached --name-only
find supabase/migrations -maxdepth 1 -name '*.sql' | sort
npm test
npm run build
```

## Limite desta entrega
Os arquivos aqui representam reconciliação **estática do snapshot**; não certificam o banco instalado, a segurança operacional ou a implantação. Não alterar banco da FUNAI.
