# Docs

Mintlify documentation for Jack's second brain, served at https://learn.jack-luo.com/docs.

## Edit

Pages are `.mdx` files; navigation is in `docs.json`.

```
npx mint dev            # preview at http://localhost:3000
npx mint broken-links   # check links
```

## Deploy

The `Dockerfile` runs `mint export --base-path /docs` and serves the static site with `server.js`. Coolify builds it from `main` and routes `learn.jack-luo.com/docs` to it; redeploy the `docs` app in Coolify after a merge.

```
docker build -t docs . && docker run -p 3000:3000 docs   # http://localhost:3000/docs/
```
