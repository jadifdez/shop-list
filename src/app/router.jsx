import { createBrowserRouter, Navigate, Outlet, ScrollRestoration } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import GroupsPage from '../pages/GroupsPage';
import GroupDetailPage from '../pages/GroupDetailPage';
import ListPage from '../pages/ListPage';
import NotFoundPage from '../pages/NotFoundPage';

// ScrollRestoration necesita vivir dentro del árbol de rutas (usa hooks del
// data router). Al ponerlo en un layout raíz: sube al top en cada navegación
// nueva (push) y restaura la posición al ir hacia atrás/adelante (pop).
function RootLayout() {
  return (
    <>
      <Outlet />
      <ScrollRestoration />
    </>
  );
}

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: <Navigate to="/groups" replace /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: '/groups', element: <GroupsPage /> },
          { path: '/groups/:groupId', element: <GroupDetailPage /> },
          { path: '/groups/:groupId/lists/:listId', element: <ListPage /> },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
