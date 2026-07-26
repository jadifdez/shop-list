import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 text-center">
      <h1 className="text-2xl font-semibold text-slate-900">Página no encontrada</h1>
      <Link to="/groups" className="text-brand-600 hover:underline">
        Volver a mis grupos
      </Link>
    </div>
  );
}
