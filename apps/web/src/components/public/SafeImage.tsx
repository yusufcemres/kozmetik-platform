'use client';

import { useState } from 'react';
import Image, { ImageProps } from 'next/image';

type SafeImageProps = Omit<ImageProps, 'src' | 'onError'> & {
  src: string | null | undefined;
  fallbackIcon?: string;
  className?: string;
};

export default function SafeImage({
  src,
  alt,
  fallbackIcon = 'image_not_supported',
  className = '',
  ...rest
}: SafeImageProps) {
  const [errored, setErrored] = useState(false);

  if (!src || errored) {
    return (
      <div
        className={`flex items-center justify-center bg-surface-container-low text-outline-variant ${className}`}
        aria-label={typeof alt === 'string' ? alt : 'Görsel yüklenemedi'}
      >
        <span className="material-icon" style={{ fontSize: '32px' }} aria-hidden="true">
          {fallbackIcon}
        </span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      className={className}
      onError={() => setErrored(true)}
      {...rest}
    />
  );
}
