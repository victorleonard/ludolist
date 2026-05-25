# Stack UI React Native — Ludolist

Document de référence pour créer le front mobile dans `@front-native`.

> **Philosophie :** le mobile n'est pas une copie du web. Il **s'inspire** du front web (`@front`) pour la marque, les fonctionnalités et les tokens de design, mais **évolue librement** pour exploiter les patterns natifs (gestes, haptics, tab bar, sheets, swipe back…).

> **Phase 1 — priorité absolue :** l'application doit **ressembler et se comporter comme une app native** iOS/Android. Ce critère prime sur la ressemblance avec le web. Tant que cette phase n'est pas validée, on ne cherche pas à reproduire fidèlement l'interface PWA : on choisit les patterns, composants et navigation qui font « app du Store », même si le rendu diffère du site.

---

## Phase 1 — Ressembler à une application native

Objectif du premier jet : qu'un utilisateur **n'ait pas l'impression** d'utiliser une PWA encapsulée, mais une vraie app mobile.

### Critères de validation phase 1

| Critère | Attendu |
|---|---|
| **Navigation** | Tab bar système, stack avec swipe back iOS, drawers/sheets gestuels |
| **Gestes** | Swipe pour ouvrir le menu, glisser pour fermer un sheet, retour par geste |
| **Feedback** | Haptics sur les actions clés, états pressed/disabled natifs |
| **Safe areas** | Respect encoches, Dynamic Island, barre home iOS |
| **Typographie & espacement** | Densité et tailles adaptées au mobile, pas un layout web rétréci |
| **Animations** | Transitions fluides (Reanimated, UI thread), pas de saccades JS |
| **Composants** | Lists, headers, modales au format mobile — pas des modales web centrées |

### Ce qu'on ne vise **pas** en phase 1

- Copier écran par écran le layout Nuxt UI / PWA
- Tab bar ou header « custom web » fixés en CSS
- Modales centrées type desktop
- Parité pixel-perfect avec `@front`

### Ce qu'on vise **en plus** (phase 2+)

- Parité fonctionnelle complète avec le web
- Affinage de la cohérence visuelle marque Ludolist
- Features spécifiques mobile (widgets, raccourcis, etc.)

---

## Objectifs (ordre de priorité)

| Priorité | Description | Phase |
|---|---|---|
| 1. **Look & feel natif** | L'app doit être indistinguable d'une app Store au comportement près | **Phase 1** |
| 2. **Parité fonctionnelle** | Mêmes features que le web (jeux, livres, listes, membres…) | Phase 1 → 2 |
| 3. **Cohérence de marque** | Palette et identité Ludolist reconnaissables | Phase 1 → 2 |
| 4. **Liberté d'UI** | Layouts et flows adaptés au mobile, pas calqués sur le web | Phase 1+ |

### Ce qui peut évoluer librement

- Structure de navigation (ex. regrouper des sections, simplifier la tab bar)
- Type de drawer (latéral vs bottom sheet vs modal natif)
- Densité des écrans, grilles, cartes
- Headers, animations, micro-interactions
- Flows multi-étapes (ex. saisie code membre en sheet natif plutôt qu'en drawer web)

### Ce qui reste aligné avec le web

- Palette `primary` et tokens de couleur
- Logique métier et endpoints API (Strapi)
- Nommage des entités et parcours utilisateur principaux

---

## Contexte — référence web (inspiration, pas spec)

| | Web (`@front`) — référence |
|---|---|
| Framework | Nuxt 4 + Vue 3 |
| UI | @nuxt/ui (Tailwind CSS 4) |
| État | Pinia |
| Icônes | Lucide + Ion |
| Navigation | Tab bar basse + drawers + stack |
| Police | Public Sans |

Le web sert de **carte des fonctionnalités** et de **base de tokens**, pas de maquette figée.

---

## Stack recommandée

### Cœur

| Bibliothèque | Rôle |
|---|---|
| **[Expo SDK 54+](https://docs.expo.dev/)** | Toolchain, build, APIs natives |
| **[Expo Router](https://docs.expo.dev/router/introduction/)** | Navigation file-based (tabs, stack, drawer) |
| **[Gluestack UI v3](https://gluestack.io/ui/docs/home/overview/introduction)** ⭐ | **UI kit principal** — composants + Drawer personnalisable |
| **[NativeWind v4](https://www.nativewind.dev/)** | Tailwind CSS (utilisé par Gluestack) |
| **[React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)** | Animations UI thread |
| **[React Native Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler/)** | Gestes natifs |
| **[Zustand](https://zustand.docs.pmnd.rs/)** | État global |
| **[TanStack Query](https://tanstack.com/query/latest/docs/framework/react/react-native)** | Cache API Strapi |

### UI kit — Gluestack UI ⭐

Choix retenu pour sa combinaison **drawer très personnalisable + composants + NativeWind** :

| Atout | Détail |
|---|---|
| **Drawer 4 directions** | `anchor`: `left` \| `right` \| `top` \| `bottom` |
| **Tailles flexibles** | `sm` \| `md` \| `lg` \| `full` |
| **Structure modulaire** | `DrawerBackdrop`, `DrawerContent`, `DrawerHeader`, `DrawerBody`, `DrawerFooter` |
| **Copy-paste** | Code dans le projet → personnalisation totale sans surcharger un package |
| **NativeWind** | Classes Tailwind familières, tokens partagés avec le web |
| **Catalogue complet** | Button, Card, Badge, Input, Modal, Actionsheet, Avatar… |

Installation :

```bash
npx gluestack-ui init
npx gluestack-ui add drawer button card badge input modal actionsheet avatar
```

> **Expo 54 :** utiliser les dernières versions de `@gluestack-ui/core`, `react-native-reanimated`, `react-native-worklets` et `nativewind@4.2.1+`.

### MCP Gluestack (Cursor) — assistant UI

Serveur [gluestack/mcp](https://github.com/gluestack/mcp) : expose la doc des composants à l’IA dans Cursor (génération d’écrans conformes au design system).

| Outil MCP | Rôle |
|---|---|
| `get_all_components_metadata` | Liste des composants disponibles |
| `select_components` | Choisir les composants pour un écran |
| `get_selected_components_docs` | Doc complète (props, exemples) |

**Emplacement monorepo :** `tools/gluestack-mcp/` (clone du dépôt officiel).

**Première installation (une fois par machine) :**

```bash
# Si le dossier n’existe pas encore
git clone --depth 1 https://github.com/gluestack/mcp.git tools/gluestack-mcp
cd tools/gluestack-mcp && npm install && chmod +x run.sh
```

**Cursor :** le projet inclut `.cursor/mcp.json` à la racine du monorepo :

```json
{
  "mcpServers": {
    "gluestack-ui": {
      "command": "bash",
      "args": ["tools/gluestack-mcp/run.sh"]
    }
  }
}
```

1. Ouvrir le dossier **`ludolist`** (racine monorepo) dans Cursor, pas seulement `@front-native`.
2. **Settings → MCP** : vérifier que `gluestack-ui` est actif (recharger si besoin).
3. L’assistant peut alors consulter la doc Gluestack avant de coder un écran.

> Le MCP **guide** l’IA ; `npx gluestack-ui add` **installe** encore les fichiers dans `components/ui/`.

### Navigation & drawers — architecture hybride

Aucun UI kit ne remplace seul la navigation native. Approche en **deux couches** :

```
┌─────────────────────────────────────────────────┐
│  Couche 1 — Navigation structurelle             │
│  Expo Router (tabs + stack + drawer)            │
│  Gestes natifs, swipe back, tab bar système     │
├─────────────────────────────────────────────────┤
│  Couche 2 — Contenu visuel des panneaux         │
│  Gluestack Drawer / Actionsheet / Modal         │
│  Entièrement personnalisable (copy-paste)       │
└─────────────────────────────────────────────────┘
```

| Besoin | Solution | Ressenti natif |
|---|---|---|
| **Tab bar principale** | Expo Router `(tabs)` | Tab bar iOS / Material Android |
| **Écrans détail** | Expo Router `Stack` | Push/pop + swipe back iOS |
| **Menu latéral** | Expo Router Drawer + contenu Gluestack | Swipe depuis le bord, `drawerType: 'slide'` |
| **Panneaux bas** (membre, actions, filtres) | Gluestack `Drawer anchor="bottom"` ou `Actionsheet` | Sheet glissant, snap points |
| **Alertes / confirmations** | Gluestack `Modal` / `AlertDialog` | Overlay modal |

#### Pourquoi pas Reusables pour la navigation ?

React Native Reusables n'a **pas de drawer de navigation** ni de tab bar. Ses `Tabs` servent aux filtres *in-page*. Gluestack couvre drawer + composants UI dans un seul écosystème.

#### Option avancée — panneaux bas ultra-natifs iOS

Si certains écrans le justifient (ex. choix membre), **Tamagui Sheet `native`** ou **`@gorhom/bottom-sheet`** peuvent compléter Gluestack pour un rendu encore plus proche du sheet iOS natif. Ce n'est pas obligatoire dès le départ.

### UX native complémentaire

| Bibliothèque | Rôle |
|---|---|
| **[expo-haptics](https://docs.expo.dev/versions/latest/sdk/haptics/)** | Feedback tactile (notation, tirage, actions) |
| **[lucide-react-native](https://lucide.dev/guide/packages/lucide-react-native)** | Icônes (pack Lucide du web) |
| **[expo-font](https://docs.expo.dev/versions/latest/sdk/font/)** | Public Sans ou police système selon la plateforme |
| **[react-native-safe-area-context](https://github.com/th3rdwave/react-native-safe-area-context)** | Encoches, Dynamic Island |

---

## Structure de navigation suggérée

```
app/
├── _layout.tsx                 # Stack racine (auth guard)
├── (drawer)/                   # Drawer latéral (menu principal)
│   ├── _layout.tsx             # Expo Router Drawer + drawerContent Gluestack
│   └── (tabs)/                 # Tab bar native
│       ├── _layout.tsx
│       ├── index.tsx           # Accueil
│       ├── jeux.tsx
│       ├── plats.tsx
│       └── …
├── game/[id].tsx               # Stack — détail avec swipe back
├── livres/[id].tsx
├── login.tsx
└── …
```

**Évolutions possibles par rapport au web :**

- Remplacer le menu hamburger web par un **drawer swipe** plus natif
- Réduire les 5 onglets web à **4 onglets + menu drawer** si plus lisible
- Mettre le choix de membre en **bottom sheet** plutôt qu'en drawer web
- Utiliser le **header natif du Stack** sur les écrans détail (titre + retour automatique)

---

## Exemple — Drawer Gluestack personnalisable

```tsx
import {
  Drawer, DrawerBackdrop, DrawerContent,
  DrawerHeader, DrawerBody, DrawerCloseButton,
} from '@/components/ui/drawer';

<Drawer
  isOpen={open}
  onClose={() => setOpen(false)}
  size="lg"           // sm | md | lg | full
  anchor="left"       // left | right | top | bottom
>
  <DrawerBackdrop />
  <DrawerContent className="bg-background-0">
    <DrawerHeader>
      <Heading>Menu</Heading>
      <DrawerCloseButton />
    </DrawerHeader>
    <DrawerBody>
      {/* Navigation items, avatar membre, réglages… */}
    </DrawerBody>
  </DrawerContent>
</Drawer>
```

Le contenu est **100 % custom** — Gluestack fournit le shell animé, vous définissez le design.

---

## Correspondance web → mobile (indicative)

| Web | Mobile Gluestack / natif | Peut évoluer ? |
|---|---|---|
| `BottomTabNavigation` | Expo Router `(tabs)` | ✅ Oui — nombre et ordre des onglets |
| `UDrawer left` (menu) | Expo Drawer + Gluestack `anchor="left"` | ✅ Oui — layout du menu |
| `UDrawer bottom` | Gluestack `anchor="bottom"` ou Actionsheet | ✅ Oui — sheet vs drawer |
| `UCard`, `UButton`, `UBadge` | Gluestack Card, Button, Badge | ✅ Oui — style des cartes |
| `UHeader` + retour | Stack header natif ou header custom | ✅ Oui — header natif recommandé |
| `UModal` | Gluestack Modal | ✅ Oui |
| Filtres in-page | Gluestack Tabs ou segmented control | ✅ Oui |

---

## Tokens de design (base commune)

Reprendre la palette du web comme **point de départ**, pas comme contrainte pixel-perfect :

```js
// tailwind.config.js — tokens Gluestack / NativeWind
theme: {
  extend: {
    colors: {
      primary: {
        50:  '#f0f9ff',
        100: '#e0f2fe',
        200: '#bae6fd',
        300: '#7dd3fc',
        400: '#4facfe',
        500: '#38bdf8',
        600: '#0ea5e9',
        700: '#0284c7',
        800: '#0369a1',
        900: '#0c4a6e',
        950: '#082f49',
      },
    },
  },
}
```

| Token | Valeur web | Mobile — flexible |
|---|---|---|
| Couleur primaire | palette ci-dessus | ✅ Conserver |
| Fond page | `#f9fafb` | Peut devenir fond système en dark mode |
| Touch target | 44px min | ✅ Respecter (accessibilité native) |
| Police | Public Sans | Peut utiliser SF Pro / Roboto si plus natif |

---

## Structure de projet

```
@front-native/
├── app/                        # Expo Router
│   ├── (drawer)/
│   │   ├── _layout.tsx
│   │   └── (tabs)/
│   ├── game/[id].tsx
│   └── _layout.tsx
├── components/
│   ├── ui/                     # Composants Gluestack (copy-paste)
│   ├── layout/                 # AppDrawer, MemberSheet, AppHeader
│   └── …                       # Composants métier
├── constants/
│   └── theme.ts
├── stores/                     # Zustand
├── lib/
│   ├── api.ts
│   └── query-client.ts
├── global.css
├── tailwind.config.js
└── package.json
```

---

## Dépendances initiales

```json
{
  "dependencies": {
    "expo": "~54.0.0",
    "expo-router": "~6.0.0",
    "expo-font": "~14.0.0",
    "expo-haptics": "~15.0.0",
    "@gluestack-ui/core": "latest",
    "@gluestack-ui/utils": "latest",
    "nativewind": "^4.2.1",
    "tailwindcss": "^3.4.0",
    "react-native-reanimated": "~4.1.0",
    "react-native-worklets": "~0.5.0",
    "react-native-gesture-handler": "~2.28.0",
    "react-native-safe-area-context": "~5.6.0",
    "react-native-screens": "~4.16.0",
    "react-native-drawer-layout": "^4.0.0",
    "lucide-react-native": "^0.500.0",
    "react-native-svg": "^15.0.0",
    "zustand": "^5.0.0",
    "@tanstack/react-query": "^5.0.0"
  }
}
```

---

## Workflow de conception mobile-first (phase 1)

1. **Choisir le pattern natif** le plus adapté à la feature — pas celui du web par défaut.
2. **Composer avec Expo Router + Gluestack** (navigation système + drawer/sheet personnalisable).
3. **Valider le ressenti natif** : gestes, haptics, safe areas, animations — avant le polish visuel.
4. **Appliquer les tokens de marque** (couleurs Ludolist) une fois le shell natif en place.
5. **Lister la feature** depuis le web pour la parité fonctionnelle, pas pour le layout.
6. **Tester sur iOS et Android** — ajuster jusqu'à ce que l'app ressemble à une app Store.

---

## Alternatives évaluées

| Bibliothèque | Drawer | Ressenti natif | Retenu ? |
|---|---|---|---|
| **Gluestack UI v3** ⭐ | ✅ 4 directions, très custom | ★★★★☆ | **UI kit principal** |
| **Expo Router Drawer** | ✅ Navigation structurelle | ★★★★★ | **Navigation principale** |
| **Tamagui Sheet `native`** | Bottom only | ★★★★★ | Option complémentaire |
| **@gorhom/bottom-sheet** | Bottom only | ★★★★★ | Option complémentaire |
| **React Native Reusables** | ❌ | ★★★☆☆ | Non retenu (pas de drawer) |
| **React Native Paper** | Material drawer | ★★★☆☆ | Non retenu (look Material) |

---

## Prochaines étapes

1. Initialiser Expo dans `@front-native`.
2. `npx gluestack-ui init` + ajouter drawer, button, card, badge, input.
3. Configurer Expo Router : drawer → tabs → stack.
4. Prototyper le menu drawer latéral (contenu Gluestack custom).
5. Prototyper un bottom sheet membre (Gluestack Drawer `anchor="bottom"`).
6. Créer les stores Zustand et le client API Strapi.
7. Porter les écrans un par un en **mobile-first**, pas en copie web.

---

## Ressources

- [Gluestack UI — Drawer](https://gluestack.io/ui/docs/components/drawer)
- [Gluestack UI — Getting Started](https://gluestack.io/ui/docs/home/overview/introduction)
- [Expo Router — Tabs](https://docs.expo.dev/router/advanced/tabs/)
- [Expo Router — Drawer](https://docs.expo.dev/router/advanced/drawer/)
- [NativeWind v4](https://www.nativewind.dev/v4/overview)
- [Lucide — React Native](https://lucide.dev/guide/packages/lucide-react-native)
