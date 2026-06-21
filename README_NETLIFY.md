# Como publicar este projeto no Netlify

Passos rápidos (arrastar e soltar):

- Acesse https://app.netlify.com/sites
- Clique em "Add new site" → "Deploy manually"
- Arraste a pasta do projeto (conteúdo com `index.html`, `styles.css`, `script.js`, `assets/`, `foto/`) para a área de deploy.

Passos via Git (recomendado para updates contínuos):

- Crie um repositório Git (GitHub/GitLab/Bitbucket) e faça push do projeto.
- No Netlify, clique em "New site from Git" e conecte seu repositório.
- Em "Build settings" deixe o campo "Build command" vazio e defina "Publish directory" como `.` (raiz do repositório).

Configurações importantes já adicionadas:

- [netlify.toml](netlify.toml) — publica a raiz do projeto e força redirect para `index.html`.
- [_redirects](_redirects) — garante que rotas de SPA resolverão para `index.html` com status 200.

Observações de segurança e testes locais:

- Removi a URL de checkout externo do `script.js` por segurança. Se desejar reativá-la, abra `script.js` e configure `externalCheckoutUrl` manualmente.
- Para testar localmente, use um servidor estático, por exemplo:

```bash
npx serve .
```

ou

```bash
npm install -g live-server
live-server --port=8080
```

Se quiser, eu posso rodar um teste local rápido ou commitar essas alterações para você.
