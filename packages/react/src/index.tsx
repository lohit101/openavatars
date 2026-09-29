'use client';

import { useId, useMemo, type CSSProperties } from 'react';
import { renderAvatarSvg, type AvatarOptions } from 'openavatars';
export type { Shape, Expression, AvatarOptions } from 'openavatars';

export interface OpenAvatarProps extends AvatarOptions {
  name: string;
  className?: string;
  style?: CSSProperties;
  /** Accessible image description. Defaults to “Avatar for {name}”. */
  label?: string;
  /** Hide redundant avatars from assistive technology. */
  decorative?: boolean;
}

export function OpenAvatar({
  name,
  size = 128,
  animate = true,
  shape,
  expression,
  color,
  className,
  style,
  label,
  decorative = false,
}: OpenAvatarProps) {
  const instance = useId();
  const idPrefix = `oa-r-${Array.from(instance)
    .map((c) => c.codePointAt(0)!.toString(16))
    .join('-')}`;
  const svg = useMemo(
    () =>
      renderAvatarSvg(name, { size, animate, shape, expression, color, idPrefix, title: label }),
    [name, size, animate, shape, expression, color, idPrefix, label],
  );
  return (
    <span
      className={className}
      aria-hidden={decorative || undefined}
      style={{
        display: 'inline-flex',
        width: size,
        height: size,
        flexShrink: 0,
        verticalAlign: 'middle',
        ...style,
      }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
