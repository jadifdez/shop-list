import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCurrentUser } from '../../store/useAuthStore';
import { fetchProfile, signIn, signOut, signUp } from './api';

// Query key centralizada: si cambia la forma de la key, solo se toca aquí.
export const profileKey = (userId) => ['profile', userId];

/** El profile (username, display_name...) es server state -> TanStack Query. */
export function useProfile() {
  const user = useCurrentUser();
  return useQuery({
    queryKey: profileKey(user?.id),
    queryFn: () => fetchProfile(user.id),
    enabled: !!user, // no dispares la query hasta que exista sesión
  });
}

export function useSignUp() {
  return useMutation({ mutationFn: signUp });
}

export function useSignIn() {
  return useMutation({ mutationFn: signIn });
}

export function useSignOut() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: signOut,
    onSuccess: () => {
      // Al cerrar sesión, fuera todo lo cacheado: el próximo usuario no debe
      // ver ni un parpadeo de los datos del anterior.
      queryClient.clear();
    },
  });
}
