import { AirsMark } from './Icon';

export function AirsLinkTrigger({ onClick, unreadCount }: { onClick: () => void; unreadCount: number }) {
  return (
    <button
      className="al-trigger"
      onClick={onClick}
      aria-label={`Open AIRS IRIS${unreadCount > 0 ? `, ${unreadCount} areas uncharted` : ''}`}
    >
      <span className="al-trigger-icon" aria-hidden="true">
        <AirsMark />
      </span>
      <span className="al-trigger-label">IRIS</span>
      {unreadCount > 0 && (
        <span className="al-trigger-pip" aria-hidden="true" />
      )}
    </button>
  );
}
