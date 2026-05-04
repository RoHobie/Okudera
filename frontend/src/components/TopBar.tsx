import { RoomCodeBadge } from './RoomCodeBadge';
import { UserAvatars } from './UserAvatars';
import type { SessionUser } from '../hooks/useSession';
import './TopBar.css';

interface Props {
  ownerName: string;
  code: string;
  users: SessionUser[];
  reconnecting: boolean;
}

export function TopBar({ ownerName, code, users, reconnecting }: Props) {
  return (
    <>
      {reconnecting && <div className="reconnecting-bar" aria-label="Reconnecting…" />}
      <header className="topbar">
        <div className="topbar-left">
          <span className="topbar-owner-label">
            {ownerName ? `${ownerName}'s room` : 'Okudera'}
          </span>
        </div>
        <div className="topbar-center">
          <RoomCodeBadge code={code} />
        </div>
        <div className="topbar-right">
          <UserAvatars users={users} max={5} />
        </div>
      </header>
    </>
  );
}
