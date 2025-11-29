// xjsx.ts
import type { Element, Text, ElementContent } from 'xast';

import { x as xast } from 'xastscript';

// 1) JSX Element 工厂（单节点版）
export function jsx(type: any, props: Record<string, any> | null): Element[] {
  return createElement(type, props);
}

// 2) JSX Element 工厂（多 children 的优化版）
// React 17+ 的 jsx-runtime 会用 jsxs，这里你也可以简单复用 jsx。
export function jsxs(type: any, props: Record<string, any> | null): Element[] {
  return createElement(type, props);
}

// 3) Fragment 支持：<></> 或 <Fragment>...</Fragment>
export const Fragment = (props: { children?: any }): ElementContent[] => {
  if (props && props.children != null) {
    return normalizeChildren(props.children) as ElementContent[];
  }
  return [];
};

function createElement(type: any, props: Record<string, any> | null): Element[] {
  const { children: childProp, ...attrs } = props ?? {};

  // attrs 转成 xast 的 attributes（注意不要放 children 进去）
  const properties: Record<string, string> = {};
  for (const [key, value] of Object.entries(attrs)) {
    if (value == null || value === false) continue;
    // boolean true → 没有值的属性也可以根据自己需求处理
    properties[key] = String(value);
  }

  const nodeChildren = [...normalizeChildren(childProp)];

  // 使用 xastscript 来构造 Element
  if (typeof type === 'function') {
    // children 可能在 props.children 或额外参数里
    const mergedProps = {
      ...(props || {}),
      children: props?.children
    };
    return type(mergedProps);
  } else {
    return [xast(type, properties, nodeChildren) as Element];
  }
}

export function normalizeChildren(input: any): ElementContent[] {
  const out: ElementContent[] = [];

  function pushChild(value: any) {
    if (value == null || value === false || value === true) return;

    // 已经是 xast 节点了，直接用
    if (typeof value === 'object' && value.type) {
      out.push(value as ElementContent);
      return;
    }

    // 数组递归展开
    if (Array.isArray(value)) {
      for (const v of value) pushChild(v);
      return;
    }

    // 其他情况按文本节点处理（number / string / etc）
    out.push({
      type: 'text',
      value: String(value)
    } as Text);
  }

  if (Array.isArray(input)) {
    for (const v of input) pushChild(v);
  } else if (input !== undefined) {
    pushChild(input);
  }

  return out;
}
