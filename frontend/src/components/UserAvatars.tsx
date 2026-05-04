import type { SessionUser } from '../hooks/useSession';
import './UserAvatars.css';

interface Props {
  users: SessionUser[];
  max?: number;
}

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();
}

// Deterministic hue from name string
function nameHue(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) % 360;
  }
  return hash;
}

export function UserAvatars({ users, max = 5 }: Props) {
  const visible = users.slice(0, max);
  const overflow = users.length - max;

  return (
    <div className="user-avatars" aria-label={`${users.length} participant${users.length !== 1 ? 's' : ''}`}>
      {visible.map((u) => {
        const hue = nameHue(u.name);
        return (
          <div
            key={u.user_id}
            className="avatar"
            title={u.name}
            style={{
              background: `hsl(${hue} 35% 88%)`,
              color: `hsl(${hue} 40% 28%)`,
            }}
          >
            {initials(u.name)}
          </div>
        );
      })}
      {overflow > 0 && (
        <div className="avatar avatar--overflow" title={`+${overflow} more`}>
          +{overflow}
        </div>
      )}
    </div>
  );
}
