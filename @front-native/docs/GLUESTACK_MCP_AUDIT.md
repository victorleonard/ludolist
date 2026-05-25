# Audit conformité MCP Gluestack — inventaire complet

Référence : [gluestack/mcp](https://github.com/gluestack/mcp)

Dernière revue : tous les fichiers `app/`, `components/` (hors `ui/` généré), `constants/`.

---

## Fichiers par dossier

### `app/`

| Fichier | MCP | Notes |
|---------|-----|-------|
| `_layout.tsx` | ✅ | Center, Spinner, Text, VStack, GluestackUIProvider |
| `login.tsx` | ✅ | FormControl, Input, Button, ScrollView UI, VStack |
| `(drawer)/(tabs)/index.tsx` | ✅ | ScrollView, Spinner, VStack, Alert, home Gluestack |
| `(drawer)/_layout.tsx` | ✅ | Config Expo Router uniquement (pas d’UI custom) |
| `(drawer)/(tabs)/_layout.tsx` | ✅ | Config tabs + icône Lucide (navigation) |
| `+not-found.tsx` | ✅ | Center, VStack, Heading, Text, Pressable |
| `+html.tsx` | ⚠️ | **Web-only** Expo : `<html>`, `<body>`, CSS inline — hors scope mobile |

### `components/home/`

| Fichier | MCP | Notes |
|---------|-----|-------|
| `HomeScreenHeader.tsx` | ✅ | HStack, VStack, Heading |
| `HomeSectionHeader.tsx` | ✅ | HStack, Heading, Link, LinkText |
| `HomeCarouselCard.tsx` | ✅ | Pressable, Image, Box, VStack, HStack, Heading, Text |
| `HomeCarouselSection.tsx` | ✅ | VStack, Box + `FlatList` (exception perf) |
| `HomeEmptyBlock.tsx` | ✅ | Center, VStack, Button, Heading, Text |

### `components/layout/`

| Fichier | MCP | Notes |
|---------|-----|-------|
| `DrawerMenuButton.tsx` | ✅ | Pressable |
| `UserAvatarButton.tsx` | ✅ | Pressable + MemberAvatar |
| `AppDrawerContent.tsx` | ✅ | Box, VStack, Heading, Text + `DrawerItem` (React Navigation) |

### `components/ui/`

| Fichier | MCP | Notes |
|---------|-----|-------|
| `MemberAvatar.tsx` | ✅ | Avatar, AvatarFallbackText, Box |
| `index.ts` | ✅ | Barrel exports Gluestack |
| `*/index.tsx` | — | **Générés CLI** — encapsulent RN en interne |
| `*/index.web.tsx` | — | Variante build **web** uniquement |
| `gluestack-ui-provider/` | — | Provider + tokens (`config.ts`) |

### Hors UI (OK, pas concernés)

| Dossier | Rôle |
|---------|------|
| `hooks/`, `lib/`, `stores/`, `types/` | Logique, API, pas de rendu |
| `constants/theme.ts` | Tokens couleurs (icônes Lucide, tabs) |

---

## Exceptions acceptées (tout le projet)

| Primitive / lib | Fichiers | Raison |
|-----------------|----------|--------|
| `FlatList` | `HomeCarouselSection` | Carrousel horizontal performant |
| `RefreshControl` | `index.tsx` | Pull-to-refresh |
| `KeyboardAvoidingView` | `login.tsx` | Clavier |
| `SafeAreaView` | `login`, `index` | Safe area |
| `GestureHandlerRootView` | `_layout.tsx` | Gestes (style `flex:1` requis) |
| `DrawerContentScrollView`, `DrawerItem` | `AppDrawerContent` | Menu drawer natif |
| `expo-linear-gradient` | `HomeCarouselCard` | Overlay (style inline) |
| `style` width/height dynamique | `HomeCarouselCard` | Taille carte selon écran |
| `contentContainerStyle` | `FlatList`, drawer scroll | API RN / React Navigation |
| `lucide-react-native` | Plusieurs | Icônes (couleurs via `theme.colors.icon`) |
| `Platform` | `login.tsx` | Comportement clavier iOS/Android |

---

## Règles MCP — checklist nouveau fichier

- [ ] Imports depuis `@/components/ui/*`
- [ ] Layout : `VStack` / `HStack` plutôt que `Box` seul
- [ ] Pas de `StyleSheet.create`
- [ ] Chargement : `Spinner` + `Text`
- [ ] Scroll : `ScrollView` de `@/components/ui/scroll-view`
- [ ] Consulter le MCP avant un nouvel écran : metadata → select → docs
