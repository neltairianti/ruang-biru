'use client';

import { useState } from 'react';

export function TrackCover({ src, className }: {
  src?: string | null;
  className: string;
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  return (
    <div aria-hidden="true" className={`relative grid shrink-0 place-items-center overflow-hidden bg-white/10 text-sm ${className}`}>
      <span>♪</span>
      {src && src !== failedSrc && (
        // The cover is decorative and the track title sits next to it.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="absolute inset-0 h-full w-full object-cover" onError={() => setFailedSrc(src)} />
      )}
    </div>
  );
}
