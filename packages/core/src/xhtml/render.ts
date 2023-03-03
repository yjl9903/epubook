import type { XHTMLNode } from './types';

export const Fragment = 'Fragment';

export function h(
  tag: string,
  attrs: Record<string, string> = {},
  ...children: Array<string | XHTMLNode | Array<string | XHTMLNode>>
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
  } satisfies XHTMLNode;

  return o;
}
