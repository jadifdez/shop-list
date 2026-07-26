import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { AuthFooter } from '../components/AuthFooter';
import { useSignUp } from '../features/auth/hooks';
import { useNotificationStore } from '../store/useNotificationStore';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmationPending, setConfirmationPending] = useState(false);
  const navigate = useNavigate();
  const notify = useNotificationStore((state) => state.notify);
  const signUp = useSignUp();

  function handleSubmit(e) {
    e.preventDefault();
    signUp.mutate(
      { email, password, username },
      {
        onSuccess: (data) => {
          // Si el proyecto Supabase tiene "Confirm email" activado, signUp no
          // devuelve sesión hasta que el usuario confirme desde su correo.
          if (data.session) {
            navigate('/groups', { replace: true });
          } else {
            setConfirmationPending(true);
          }
        },
        onError: (error) => notify(error.message, 'error'),
      }
    );
  }

  if (confirmationPending) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <Card className="w-full max-w-sm text-center">
          <h1 className="mb-2 text-xl font-semibold text-slate-900">Revisa tu email</h1>
          <p className="text-sm text-slate-500">
            Te hemos enviado un enlace de confirmación a <strong>{email}</strong>. Confírmalo y
            luego <Link to="/login" className="text-brand-600 hover:underline">inicia sesión</Link>.
          </p>
        </Card>
        <AuthFooter />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-sm">
        <h1 className="mb-1 text-xl font-semibold text-slate-900">Crear cuenta</h1>
        <p className="mb-6 text-sm text-slate-500">Únete o crea grupos de listas para tu familia.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            id="username"
            label="Nombre de usuario"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
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
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" disabled={signUp.isPending} className="mt-2">
            {signUp.isPending ? 'Creando cuenta...' : 'Crear cuenta'}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-500">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="font-medium text-brand-600 hover:underline">
            Entra
          </Link>
        </p>
      </Card>
      <AuthFooter />
    </div>
  );
}
