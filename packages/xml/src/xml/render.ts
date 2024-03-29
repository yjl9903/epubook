import type { XMLNode } from './types';

export const Fragment = 'Fragment';

export function h(
  tag: string,
  attrs: Record<string, string> = {},
  ...children: Array<string | XMLNode | Array<string | XMLNode>>
) {
  const sub = children
    .flatMap((c) =>
      typeof c === 'object' && !Array.isArray(c) && c.tag === Fragment ? c.children ?? [] : c
    )
    .filter((c: any) => c !== undefined && c !== null && c !== false);

  const o = {
    tag,
    attrs: attrs ?? {},
    children: sub
  } satisfies XMLNode;

  return o;
}
