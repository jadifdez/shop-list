# Shop List 🛒

App de listas de la compra compartidas por grupos (familia, evento...). Cada
usuario se registra, crea o se une a un grupo con un código de invitación, y
dentro del grupo puede crear varias listas (Compra semanal, Barbacoa...) con
sus productos, marcados como comprados o no en tiempo real entre todos los
miembros.

Este proyecto está pensado sobre todo para **aprender la stack**, así que
cada pieza (Vite, Supabase, TanStack Query, Zustand, Tailwind, Jest,
Storybook) está usada de forma explícita y comentada donde la decisión no es
obvia. Lo que sigue es el mapa completo.

## Stack y por qué cada pieza está ahí

| Herramienta | Para qué | Dónde se ve |
|---|---|---|
| **Vite + React (JSX)** | Bundler + UI | todo `src/` |
| **Supabase** | Base de datos Postgres + Auth + Realtime, sin backend propio | `src/lib/supabaseClient.js`, `supabase/schema.sql` |
| **TanStack Query** | Cache de *server state* (todo lo que viene de Supabase) | `src/features/*/hooks.js` |
| **Zustand** | *Client state* global (sesión de auth, notificaciones) | `src/store/` |
| **React Router** | Navegación entre pantallas | `src/app/router.jsx` |
| **Tailwind CSS v4** | Estilos | `src/index.css`, clases en cada componente |
| **Jest + Testing Library** | Tests unitarios | archivos `*.test.jsx` junto al código que prueban |
| **Storybook** | Documentar y ver los componentes aislados | archivos `*.stories.jsx` |

### La regla de oro: server state vs. client state

Es la decisión de arquitectura más importante del proyecto y la que más
confusión suele generar cuando se aprende TanStack Query + Zustand a la vez:

- **Server state** (cualquier dato que "vive" en Supabase: perfil, grupos,
  listas, items) → **TanStack Query**. Nunca se copia a Zustand. Query se
  encarga de cachear, refrescar, des-duplicar peticiones e invalidar.
- **Client state** (cosas que solo existen en el navegador y no vienen de
  ninguna tabla: la sesión de auth *en memoria*, toasts de notificación) →
  **Zustand**.

La sesión de auth es la excepción que confirma la regla: técnicamente viene
de Supabase, pero se guarda en Zustand (`src/store/useAuthStore.js`) porque
hace falta **de forma síncrona y en muchos sitios a la vez** (guards de
rutas, cabecera...) antes de que ninguna query pueda siquiera ejecutarse. El
resto del perfil del usuario (username, etc.) sí es una query normal
(`useProfile` en `src/features/auth/hooks.js`).

## Estructura de carpetas

```
src/
  app/                 # arranque de la app: router y configuración de Query
    router.jsx         # árbol de rutas (createBrowserRouter)
    ProtectedRoute.jsx # guard: sin sesión -> redirige a /login
    queryClient.js      # configuración única de TanStack Query
  pages/               # una pantalla = un archivo. Componen hooks + componentes de UI
  features/            # lógica de negocio por dominio, sin JSX
    auth/    api.js (llamadas a supabase.auth) + hooks.js (useProfile, useSignIn...)
    groups/  api.js + hooks.js (useGroups, useCreateGroup, useJoinGroup...)
    lists/   api.js + hooks.js (useListItems, useAddListItem, realtime...)
  components/          # componentes de React reutilizables
    ui/                # componentes "tontos" sin lógica de negocio (Button, Input, Card)
  store/               # Zustand: useAuthStore, useNotificationStore
  lib/                 # supabaseClient.js: única instancia del cliente de Supabase
  test/                # setup de Jest y utilidades para tests
supabase/
  schema.sql           # tablas + Row Level Security + funciones, listo para pegar en Supabase
```

Patrón repetido en cada `features/<dominio>/`:
- `api.js` — funciones "planas" `async function algo(args)` que solo hablan
  con Supabase (o el módulo mockeable). No importan React ni Zustand.
- `hooks.js` — envuelve cada función de `api.js` en un `useQuery` o
  `useMutation` de TanStack Query, define las `queryKey` y decide qué
  invalidar cuando algo cambia.

Esta separación es la que hace testeable `hooks.js` sin red real: en los
tests se mockea `api.js` entero (ver `src/features/lists/hooks.test.jsx`).

## Puesta en marcha

### 1. Instalar dependencias

```bash
npm install
```

### 2. Crear el proyecto de Supabase

1. Ve a [supabase.com/dashboard](https://supabase.com/dashboard) y crea un proyecto nuevo (gratis).
2. En **Project Settings → API**, copia la **Project URL** y la clave **anon public**.
3. Copia `.env.example` a `.env` y rellena esos dos valores:

   ```bash
   cp .env.example .env
   ```

   ```
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-anon-key
   ```

   `.env` está en `.gitignore`: nunca se sube. La clave `service_role` **jamás** va en el frontend.

4. En el **SQL Editor** del dashboard, pega y ejecuta todo el contenido de
   [`supabase/schema.sql`](./supabase/schema.sql). Esto crea:
   - Las tablas `profiles`, `groups`, `group_members`, `shopping_lists`, `list_items`.
   - Las políticas de **Row Level Security**: cada usuario solo ve/edita datos de sus propios grupos.
   - Un trigger que crea automáticamente un `profile` cuando alguien se registra.
   - La función `join_group_by_invite_code(code)`, que es el mecanismo para
     unirse a un grupo (nadie puede insertarse a sí mismo directamente en
     `group_members`; solo esta función, que valida el código, puede hacerlo).
   - El alta de `list_items` en la publicación de Realtime, para que los
     cambios lleguen en vivo a todos los miembros del grupo.

5. (Opcional, para probar más rápido) en **Authentication → Providers → Email**,
   puedes desactivar "Confirm email" mientras desarrollas, así el registro
   deja sesión iniciada al instante en vez de esperar a un correo.

### 3. Arrancar

```bash
npm run dev             # app en http://localhost:5173
npm run storybook       # catálogo de componentes en http://localhost:6006
npm test                # tests unitarios (una vez)
npm run test:watch      # tests en modo watch
npm run build           # build de producción
```

## Cómo encajan las piezas: el flujo de "añadir un producto a una lista"

1. `ListPage.jsx` llama a `useAddListItem(listId)` (`src/features/lists/hooks.js`).
2. Ese hook es un `useMutation` de TanStack Query cuyo `mutationFn` llama a
   `addListItem(...)` en `api.js`, que hace un `insert` en Supabase.
3. Supabase comprueba las políticas RLS de `list_items`: solo se permite si
   el usuario pertenece al grupo dueño de la lista.
4. Al tener éxito, la mutación invalida la query `['lists', listId, 'items']`,
   así que TanStack Query vuelve a pedir los items y la lista se actualiza.
5. Además, `useListItemsRealtime(listId)` está suscrito a un canal de
   Supabase Realtime sobre la tabla `list_items` filtrado por esa lista: si
   **otro** miembro de la familia añade o marca un producto desde su móvil,
   ese evento llega por WebSocket y también invalida la misma query. Realtime
   decide *cuándo* refrescar; TanStack Query decide *qué* pedir y lo cachea.

## Autenticación

- `src/lib/supabaseClient.js` crea el cliente único de Supabase.
- `src/store/useAuthStore.js` se suscribe una vez (`initAuthListener`, llamado
  desde `App.jsx`) a `supabase.auth.onAuthStateChange` y guarda la sesión.
- `src/app/ProtectedRoute.jsx` lee esa sesión y redirige a `/login` si no hay
  usuario.
- Al registrarse (`RegisterPage.jsx`), el `username` viaja en
  `options.data.username` de `supabase.auth.signUp`, y un trigger SQL
  (`handle_new_user` en `schema.sql`) crea la fila en `profiles` en el
  servidor — así el perfil existe pase lo que pase con la confirmación de
  email.

## Permisos: admin de grupo

Quien crea un grupo queda como `role = 'admin'` en `group_members` (trigger
`handle_new_group`). Solo el admin puede:
- **Expulsar miembros** (`useKickMember` en `features/groups/hooks.js`, botón
  "Expulsar" en `GroupDetailPage`).
- **Borrar listas** (`useDeleteList` en `features/lists/hooks.js`, icono 🗑️
  junto a cada lista).

Ambos se aplican en el servidor, no solo ocultando el botón en el frontend:
`supabase/schema.sql` tiene una función `is_group_admin(group_id)` (mismo
patrón `SECURITY DEFINER` que `is_group_member`) y las policies de
`group_members` (DELETE) y `shopping_lists` (DELETE) la usan. Un usuario que
manipule la app o llame a la API directamente sigue sin poder expulsar ni
borrar si no es admin.

Cualquier miembro (admin o no) puede salir de un grupo por su cuenta
("Salir del grupo" en `GroupDetailPage`).

## Tests

Jest no puede ejecutar `import.meta.env` (es sintaxis de Vite/ESM), así que
cualquier test cuyo código importe, directa o indirectamente,
`src/lib/supabaseClient.js` lo mockea explícitamente con `jest.mock(...)` en
vez de dejar que se cargue el archivo real. Ejemplos:

- `src/components/ui/Button.test.jsx` — componente puro, sin mocks: render + interacción de usuario.
- `src/components/ListItemRow.test.jsx` — lo mismo, con `userEvent` para simular clicks.
- `src/store/useAuthStore.test.js` — mockea `supabaseClient` para probar el store de Zustand y `initAuthListener` de forma aislada.
- `src/features/lists/hooks.test.jsx` — mockea `api.js` entero (`jest.mock('./api')`) para probar que los hooks de TanStack Query llaman a la API con los argumentos correctos y gestionan la cache, sin tocar red real.

## Storybook

Cada componente de `src/components/ui/` y los componentes de dominio
(`GroupCard`, `ListItemRow`) tienen su `.stories.jsx` con varios estados
(variantes de `Button`, error de `Input`, item marcado/sin marcar...).
`.storybook/preview.jsx` importa `src/index.css` para que Tailwind se vea
igual que en la app real. Los componentes que usan `<Link>` de React Router
(como `GroupCard`) llevan un decorator con `<MemoryRouter>` para poder
renderizarse fuera de la app.

## Modelo de datos (resumen)

```
profiles ──┐
           │ created_by / user_id
groups ────┼── group_members ── profiles
  │
  └── shopping_lists ── list_items
```

Ver `supabase/schema.sql` para las columnas, políticas RLS y funciones
completas, todo comentado línea a línea.
