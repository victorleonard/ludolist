---
name: Listes génériques famille
overview: "Transformer la page \"Liste de courses\" en un module \"Listes\" générique : plusieurs listes par famille (avec nom), chaque liste contient des éléments ; APIs et front utilisent uniquement documentId ; accès réservé à la famille."
todos: []
isProject: false
---

# Plan : Listes génériques (ex liste de courses)

## Contexte actuel

- **Une seule liste par famille** : `[family.shopping_list](@back/src/api/family/content-types/family/schema.json)` est en relation oneToOne avec `shopping-list`. La route `[GET /api/shopping-lists/family](@back/src/api/shopping-list/controllers/shopping-list.js)` retourne cette liste unique (créée à la volée si besoin). Les éléments (grocery-item) sont déjà sécurisés par famille et le backend accepte déjà le **documentId** pour toggle/update/delete ([grocery-item.js](@back/src/api/grocery-item/controllers/grocery-item.js)).
- **Front** : une seule page `[/courses](@front/app/pages/courses/index.vue)` qui charge cette liste et affiche les items ; le composable `[useShoppingList](@front/app/composables/useShoppingList.ts)` et les composants utilisent déjà `documentId` pour les items.

## Objectif

- **Plusieurs listes** par famille (ex. "Courses", "Vacances", "Anniversaire").
- L’utilisateur **crée une liste** (avec un nom) et y **associe des éléments**.
- **Création** : choix entre liste **pour soi** (personnelle, visible uniquement par le créateur) ou **pour toute la famille** (visible par tous les membres).
- **Toujours utiliser documentId** en API et en front (pas d’exposition d’id numérique).
- **Sécurité** : seuls les membres de la famille peuvent voir/modifier les listes (vérification famille sur chaque endpoint) ; les listes personnelles ne sont visibles que par leur propriétaire.

---

## 1. Backend – Modèle de données (Strapi)

**Option retenue : recréer des content-types** avec des noms clairs (`list`, `list-item`) plutôt que de modifier/renommer `shopping-list` et `grocery-item`. Plus simple (schéma propre dès le départ, pas de migration de structure), et l’ancien module peut être déprécié ou supprimé après bascule.

### 1.1 Nouveau content-type `list`

- **Créer** : `@back/src/api/list/` (content-types/list/schema.json, controllers, services, routes).
- **Schéma** :
  - `name` (string, required) – titre de la liste.
  - `family` (relation manyToOne vers `api::family.family`, inversedBy `lists`).
  - `items` (relation oneToMany vers `api::list-item.list-item`, mappedBy `list`).
  - `**scope**` (enumeration, required) : `'personal'` | `'family'` – liste pour soi uniquement ou accessible à toute la famille.
  - `**owner**` (relation manyToOne vers `api::member.member`, optionnel) – membre propriétaire ; utilisé quand `scope === 'personal'` pour filtrer qui voit la liste.
- Collection : `lists` ; displayName : "List".

### 1.2 Nouveau content-type `list-item`

- **Créer** : `@back/src/api/list-item/` (content-types/list-item/schema.json, controllers, services, routes).
- **Schéma** :
  - `name` (string, required).
  - `is_checked` (boolean, default false).
  - `list` (relation manyToOne vers `api::list.list`, inversedBy `items`).
  - `family` (relation manyToOne vers `api::family.family`, pour la sécurité côté contrôleur).
  - `created_by` (relation manyToOne vers `api::member.member`, optionnel).
- Collection : `list_items` ; displayName : "List Item".

### 1.3 Schéma `family`

- **Fichier** : `[@back/src/api/family/content-types/family/schema.json](@back/src/api/family/content-types/family/schema.json)`
- **Ajouter** une relation `**lists**` (oneToMany vers `api::list.list`, mappedBy `family`).
- **Optionnel** : garder temporairement `shopping_list` / `grocery_items` pour l’ancienne feature, ou les retirer et faire pointer le front uniquement vers les nouvelles APIs (`/api/lists`, `/api/list-items`). En « recréer si plus simple », on bascule tout vers `list` / `list-item` et on peut supprimer ou laisser en place l’ancien code shopping-list (à ne plus appeler depuis le front).

---

## 2. Backend – API listes (documentId + famille)

### 2.1 Routes `list`

- **Fichier** : `@back/src/api/list/routes/` – utiliser des **routes custom uniquement** (pas le coreRouter Strapi avec id numérique), par exemple `list/routes/custom.js` :
  - `GET /lists/family` → toutes les listes de la famille (populate `items` optionnel).
  - `GET /lists/:documentId` → une liste + ses items (vérif famille).
  - `POST /lists` → body `{ name, scope: 'personal' | 'family' }`, créer une liste (pour soi ou pour la famille).
  - `PUT /lists/:documentId` → mettre à jour le nom (vérif famille).
  - `DELETE /lists/:documentId` → supprimer la liste (vérif famille ; suppression en cascade des list-items selon config Strapi ou à gérer dans le contrôleur).

### 2.2 Contrôleur `list`

- **Fichier** : `@back/src/api/list/controllers/list.js`
- **getByFamily** : retourner les listes où `family` correspond ET (`scope === 'family'` OU (`scope === 'personal'` ET `owner` === membre de l’utilisateur)). Populate `items` optionnel. Chaque liste avec `documentId`, `name`, `scope`, `owner?`.
- **findOne(documentId)** : trouver par `documentId`, populate `items` ; vérifier `list.family` === famille de l’utilisateur ET (liste family ou liste personnelle du membre courant) ; sinon 403.
- **create** : body `{ name, scope: 'personal' | 'family' }` ; si `scope === 'personal'`, lier `owner` au membre de l’utilisateur connecté (récupérer le member depuis la famille). Créer avec `family: userFamily.id`, retourner la liste (avec `documentId`).
- **update(documentId)** : résoudre par `documentId`, vérif famille, mettre à jour `name`.
- **delete(documentId)** : résoudre par `documentId`, vérif famille, supprimer la liste (et ses list-items si souhaité).

Toujours utiliser **documentId** en paramètre et en réponse.

---

## 3. Backend – API éléments (list-item, documentId + famille)

### 3.1 Routes `list-item`

- **Fichier** : `@back/src/api/list-item/routes/custom.js` (pas de coreRouter avec id numérique, ou le surcharger).
  - `POST /list-items/add-to-list` : body `{ listDocumentId, name, memberId? }` – ajouter un élément à une liste (vérif liste appartient à la famille).
  - `PUT /list-items/:documentId/toggle-checked` – cocher / décocher (vérif famille).
  - `PUT /list-items/:documentId` – modifier le nom (vérif famille).
  - `DELETE /list-items/:documentId` – supprimer (vérif famille).
- Paramètre d’URL : **documentId** uniquement (pas d’id numérique exposé).

### 3.2 Contrôleur `list-item`

- **Fichier** : `@back/src/api/list-item/controllers/list-item.js`
- **addToList** : récupérer la famille de l’utilisateur ; résoudre la liste par **listDocumentId** ; vérifier que la liste appartient à la famille ; si `memberId` fourni, vérifier qu’il appartient à la famille ; créer le list-item avec `list`, `family`, `name`, `is_checked: false`, `created_by` optionnel.
- **toggleChecked(documentId)** : résoudre l’item par **documentId** ; vérifier `item.family` === famille de l’utilisateur ; inverser `is_checked`.
- **update(documentId)** : résoudre par documentId, vérif famille, mettre à jour `name`.
- **delete(documentId)** : résoudre par documentId, vérif famille, supprimer.

---

## 4. Frontend – Renommage et cohérence des noms

Renommer **côté front** pour aligner avec le module « Listes » (plus de « courses » / « grocery » dans le code).

- **Routes** : `/courses` → `**/listes**` (page index et détail : `/listes`, `/listes/[documentId]`). Déplacer/renommer `@front/app/pages/courses/` en `**@front/app/pages/listes/**`.
- **Navigation** : dans le bottom nav (ex. `stores/bottomNav.ts`, `layouts/default.vue`), remplacer l’entrée "Courses" / `/courses` par **"Listes"** / `**/listes**`.
- **Composable** : `**useLists.ts**` (supprimer ou ne plus utiliser `useShoppingList.ts`). Types **List** (avec `scope`, `owner?`), **ListItem**.
- **Composants** : déplacer/renommer `components/courses/` en `**components/listes/**` ; **GroceryItemCard** → **ListItemCard**, **AddGroceryItemModal** → **AddListItemModal** (ou noms équivalents). Adapter les props/events (item → listItem, listDocumentId, etc.).
- **Imports et références** : mettre à jour toutes les références vers `courses`, `useShoppingList`, `GroceryItem`, etc., pour pointer vers `listes`, `useLists`, `ListItem`.

---

## 5. Frontend – Données et appels

### 5.1 Composable `useLists.ts`

- Types : **List** (`documentId`, `name`, `scope`, `owner?`, `items?`), **ListItem** (`documentId`, `name`, `is_checked`, `created_by?`, etc.).
- **fetchLists()** : `GET /api/lists/family`.
- **fetchList(documentId)** : `GET /api/lists/:documentId`.
- **createList(name, scope)** : `POST /api/lists` avec `{ name, scope: 'personal' | 'family' }`.
- **updateList(documentId, name)** : `PUT /api/lists/:documentId`.
- **deleteList(documentId)** : `DELETE /api/lists/:documentId`.
- **addItem(listDocumentId, name, memberId?)** : `POST /api/list-items/add-to-list`.
- **toggleListItem(documentId)**, **updateListItem(documentId, name)**, **deleteListItem(documentId)**.

Tous les appels utilisent **documentId** ; pas d’id numérique exposé.

---

## 6. Frontend – Pages et interface

### 6.1 Page « Mes listes » (vue d’ensemble)

- **Fichier** : `@front/app/pages/listes/index.vue`
- **Interface** : une **seule page** qui affiche **l’ensemble des listes** (famille + personnelles de l’utilisateur). Chaque liste est affichée sous forme de carte ou de ligne (nom, éventuellement nombre d’items, indicateur « personnelle » / « famille »).
- **Clic sur une liste** → navigation vers la **page détail** de cette liste (`/listes/[documentId]`).
- **Bouton « Créer une liste »** : ouvrir un modal (ou drawer) avec :
  - Champ **nom** de la liste.
  - Choix **« Pour moi »** (scope `personal`) ou **« Pour toute la famille »** (scope `family`).
  - Soumission → `createList(name, scope)` puis redirection vers `/listes/[documentId]` de la liste créée (ou rafraîchir la liste des listes).
- Gestion des états : chargement, erreur, liste vide (inviter à créer une première liste).

### 6.2 Page détail d’une liste

- **Fichier** : `@front/app/pages/listes/[documentId].vue`
- Récupérer **documentId** depuis la route, appeler **fetchList(documentId)**.
- Si liste absente ou 403, afficher erreur ou redirection.
- Afficher le **nom de la liste** en titre ; optionnel : afficher un badge « Personnelle » ou « Famille » selon `scope`.
- Sections « À faire » / « Fait » pour les items ; **ListItemCard** et **AddListItemModal** (ajout avec `listDocumentId` de la liste courante).
- **Retour** vers `/listes`. Options : modifier le nom (updateList), supprimer la liste (deleteList), avec **documentId**.

---

## 7. Sécurité (résumé)

- **Listes** (`/api/lists/*`) : chaque endpoint vérifie que l’utilisateur est authentifié et que la liste appartient à la famille de l’utilisateur. Pour les listes **personnelles** (`scope === 'personal'`), seules les listes dont `owner` est le membre de l’utilisateur connecté sont retournées/modifiables (getByFamily et findOne).
- **List-items** (`/api/list-items/*`) : addToList vérifie que la liste cible appartient à la famille (et droits sur la liste) ; toggle/update/delete vérifient que l’item appartient à la famille. **documentId** uniquement.
- Aucune route ne doit exposer listes ou éléments d’une autre famille ni une liste personnelle d’un autre membre.

---

## 8. Points d’attention

- **Ancien module** : après bascule vers `/listes` et APIs `lists` / `list-items`, les content-types `shopping-list` et `grocery-item` peuvent rester en base ou être supprimés.
- **Renommage front** : tout le module est renommé (routes `/listes`, composants `listes/`, composable `useLists`, nav "Listes").
- **Suppression d’une liste** : définir si les list-items sont supprimés en cascade (Strapi ou contrôleur) ou orphelins.

---

## Ordre de mise en œuvre suggéré

1. Backend : créer content-types **list** (avec `scope`, `owner`) et **list-item** ; ajouter relation **lists** dans **family**.
2. Backend : routes et contrôleur **list** (getByFamily avec filtre scope/owner, findOne, create avec scope, update, delete).
3. Backend : routes et contrôleur **list-item** (add-to-list, toggle-checked, update, delete par documentId).
4. Front : renommer routes `/courses` → `**/listes**`, pages **listes/** ; nav "Listes" ; composants **listes/ListItemCard**, **AddListItemModal** ; composable **useLists.ts** (dont createList(name, scope)).
5. Front : page **listes/index.vue** (ensemble des listes, clic → détail ; modal création avec choix « Pour moi » / « Pour toute la famille ») et **listes/[documentId].vue** (détail d’une liste).
6. Tests et vérification : documentId uniquement, famille + scope vérifiés.

