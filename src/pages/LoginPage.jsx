import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { AuthFooter } from '../components/AuthFooter';
import { useSignIn } from '../features/auth/hooks';
import { useNotificationStore } from '../store/useNotificationStore';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const notify = useNotificationStore((state) => state.notify);
  const signIn = useSignIn();

  function handleSubmit(e) {
    e.preventDefault();
    signIn.mutate(
      { email, password },
      {
        onSuccess: () => navigate('/groups', { replace: true }),
        onError: (error) => notify(error.message, 'error'),
      }
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-sm">
        <h1 className="mb-1 text-xl font-semibold text-slate-900">Shop List</h1>
        <p className="mb-6 text-sm text-slate-500">Tus listas de la compra, simples y compartidas.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            id="email"
            type="email"
            label="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            id="password"
            type="password"
            label="Contraseña"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" disabled={signIn.isPending} className="mt-2">
            {signIn.isPending ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-500">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="font-medium text-brand-600 hover:underline">
            Regístrate
          </Link>
        </p>
      </Card>
      <AuthFooter />
    </div>
  );
}
