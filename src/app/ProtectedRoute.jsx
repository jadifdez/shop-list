import { Navigate, Outlet } from 'react-router-dom';
import { useCurrentUser } from '../store/useAuthStore';

// Para cuando esto se monta, App.jsx ya esperó a que la sesión estuviera
// resuelta (status !== 'loading'), así que aquí solo queda decidir:
// ¿hay usuario? -> deja pasar. ¿no? -> a /login.
export default function ProtectedRoute() {
  const user = useCurrentUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
