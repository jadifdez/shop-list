import { createBrowserRouter, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import GroupsPage from '../pages/GroupsPage';
import GroupDetailPage from '../pages/GroupDetailPage';
import ListPage from '../pages/ListPage';
import NotFoundPage from '../pages/NotFoundPage';

export const router = createBrowserRouter([
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
]);
