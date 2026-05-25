# Gluestack MCP — Ludolist

Wrapper pour le serveur officiel [gluestack/mcp](https://github.com/gluestack/mcp).

## Installation

```bash
cd tools/gluestack-mcp
npm install
chmod +x run.sh
```

## Cursor

Configuration projet : `/.cursor/mcp.json` (racine monorepo).

Ouvrir **ludolist** dans Cursor et activer le serveur **gluestack-ui** dans Settings → MCP.

## Mise à jour (depuis upstream)

```bash
cd tools/gluestack-mcp
# Remplacer les fichiers par la dernière version officielle
rm -rf src index.js package.json package-lock.json
curl -sL https://github.com/gluestack/mcp/archive/refs/heads/main.tar.gz | tar xz --strip-components=1
npm install
chmod +x run.sh
```

Ou re-cloner : `rm -rf tools/gluestack-mcp && git clone --depth 1 https://github.com/gluestack/mcp.git tools/gluestack-mcp` puis `npm install`.
