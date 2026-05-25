# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v56.0.0/ before writing any code.

# UI

Privilégier les composants **Gluestack UI** (`components/ui/*` via `npx gluestack-ui add …`). Wrappers métier (ex. `MemberAvatar`) s’appuient sur Gluestack, pas sur `View`/`Text` RN seuls, sauf contrainte technique documentée.

Pour générer ou refactorer des écrans UI, utiliser le MCP **gluestack-ui** (voir `STACK_UI.md` et `tools/gluestack-mcp/`) : `get_all_components_metadata` → `select_components` → `get_selected_components_docs`.
