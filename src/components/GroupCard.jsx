import { Link } from 'react-router-dom';
import { Card } from './ui/Card';

export function GroupCard({ group }) {
  return (
    <Link to={`/groups/${group.id}`} className="block">
      <Card className="transition-shadow hover:shadow-md">
        <h3 className="text-base font-semibold text-slate-900">{group.name}</h3>
        <p className="mt-1 text-xs text-slate-500">
          Código de invitación: <span className="font-mono">{group.invite_code}</span>
        </p>
      </Card>
    </Link>
  );
}
