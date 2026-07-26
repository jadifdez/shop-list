import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { ScrollManager } from './ScrollManager';
import ProtectedRoute from './ProtectedRoute';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import GroupsPage from '../pages/GroupsPage';
import GroupDetailPage from '../pages/GroupDetailPage';
import ListPage from '../pages/ListPage';
import NotFoundPage from '../pages/NotFoundPage';

function RootLayout() {
  return (
    <>
      <ScrollManager />
      <Outlet />
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
