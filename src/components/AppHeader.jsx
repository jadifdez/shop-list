import { Link } from 'react-router-dom';
import { FiShoppingCart } from 'react-icons/fi';
import { Button } from './ui/Button';
import { useProfile, useSignOut } from '../features/auth/hooks';

export function AppHeader() {
  const { data: profile } = useProfile();
  const signOut = useSignOut();

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-2 px-4 py-3">
        <Link to="/groups" className="flex shrink-0 items-center gap-1.5 text-lg font-semibold text-slate-900">
          <FiShoppingCart className="text-brand-600" aria-hidden="true" />
          Shop List
        </Link>
        <div className="flex min-w-0 items-center gap-2">
          {profile && (
            <span className="hidden truncate text-sm text-slate-500 sm:inline">
              Hola, {profile.username}
            </span>
          )}
          <Button variant="ghost" onClick={() => signOut.mutate()} disabled={signOut.isPending}>
            Salir
          </Button>
        </div>
      </div>
    </header>
  );
}
