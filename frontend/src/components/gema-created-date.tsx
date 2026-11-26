const dateFormatter = new Intl.DateTimeFormat('id-ID', {
  dateStyle: 'long',
  timeZone: 'Asia/Bangkok',
});

export function GemaCreatedDate({ createdAt }: { createdAt?: string | null }) {
  if (!createdAt) return null;

  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return null;

  return (
    <time dateTime={createdAt} className="block text-xs text-[var(--text-muted)]">
      Dibuat {dateFormatter.format(date)}
    </time>
  );
}
