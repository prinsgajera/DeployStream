const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_HOUR = 60;
const HOURS_PER_DAY = 24;
const MS_PER_SECOND = 1000;

export function formatDuration(seconds: number | null): string {
  if (seconds === null) return "--";
  if (seconds < SECONDS_PER_MINUTE) return `${seconds}s`;
  const minutes = Math.floor(seconds / SECONDS_PER_MINUTE);
  return `${minutes}m ${seconds % SECONDS_PER_MINUTE}s`;
}

export function formatRelativeTime(isoDate: string | null, now: number = Date.now()): string {
  if (!isoDate) return "never";
  const elapsedSeconds = Math.max(0, Math.round((now - new Date(isoDate).getTime()) / MS_PER_SECOND));
  if (elapsedSeconds < SECONDS_PER_MINUTE) return "just now";
  const minutes = Math.floor(elapsedSeconds / SECONDS_PER_MINUTE);
  if (minutes < MINUTES_PER_HOUR) return `${minutes}m ago`;
  const hours = Math.floor(minutes / MINUTES_PER_HOUR);
  if (hours < HOURS_PER_DAY) return `${hours}h ago`;
  return `${Math.floor(hours / HOURS_PER_DAY)}d ago`;
}

export function shortCommit(commitHash: string | null): string {
  return commitHash ? commitHash.slice(0, 7) : "latest";
}
