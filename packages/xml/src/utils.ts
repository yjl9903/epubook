import { fromHtml } from 'hast-util-from-html';
import { find, html as htmlSchema, type Info } from 'property-information';
import { toXml } from 'xast-util-to-xml';
import type {
  Element as HastElement,
  ElementContent as HastElementContent,
  Properties,
  Root as HastRoot,
  RootContent as HastRootContent
} from 'hast';
import type {
  Attributes,
  Element as XastElement,
  ElementContent as XastElementContent,
  Root as XastRoot,
  RootContent as XastRootContent,
  Nodes as XastNodes
} from 'xast';

export interface ParseHTMLOptions {
  fullPath?: string;

  fragment?: boolean;
}

export function parseHTML(html: string, options: ParseHTMLOptions = {}): XastRoot {
  const hast = fromHtml(html, { fragment: options.fragment });
  return hastToXast(hast);
}

export function hastToXast(root: HastRoot): XastRoot {
  return {
    type: 'root',
    data: root.data,
    // position: root.position,
    children: root.children.map(toRootContent)
  };

  function toRootContent(node: HastRootContent): XastRootContent {
    switch (node.type) {
      case 'element':
        return toElement(node);
      case 'text':
        return {
          type: 'text',
          value: node.value,
          data: node.data
          // position: node.position
        };
      case 'comment':
        return {
          type: 'comment',
          value: node.value,
          data: node.data
          // position: node.position
        };
      case 'doctype':
        return {
          type: 'doctype',
          name: 'html',
          data: node.data
          // position: node.position
        };
      default:
        // hast nodes are exhaustively handled above.
        return node;
    }
  }
}

export function serializeXML(xast: XastNodes): string {
  const root: XastRoot =
    xast.type === 'root' ? (xast as XastRoot) : { type: 'root', children: [xast] };
  return toXml(root, { closeEmptyElements: true });
}

function toElement(node: HastElement): XastElement {
  return {
    type: 'element',
    name: node.tagName,
    attributes: toAttributes(node.properties),
    children: node.children.map(toElementContent),
    data: node.data
    // position: node.position
  };
}

function toElementContent(node: HastElementContent): XastElementContent {
  switch (node.type) {
    case 'element':
      return toElement(node);
    case 'text':
      return {
        type: 'text',
        value: node.value,
        data: node.data
        // position: node.position
      };
    case 'comment':
      return {
        type: 'comment',
        value: node.value,
        data: node.data
        // position: node.position
      };
    default:
      // hast nodes are exhaustively handled above.
      return node;
  }
}

function toAttributes(properties: Properties = {}): Attributes {
  const attributes: Attributes = {};
  for (const [key, value] of Object.entries(properties)) {
    const info = find(htmlSchema, key);
    const attrValue = toAttributeValue(value, info);
    if (attrValue === undefined || attrValue === null) continue;
    attributes[info.attribute] = attrValue;
  }
  return attributes;
}

function toAttributeValue(value: Properties[string], info: Info): string | null | undefined {
  if (value === undefined || value === null) return undefined;

  if (Array.isArray(value)) {
    const list = value.map((item) => String(item));
    if (info.commaSeparated) return list.join(',');
    if (info.spaceSeparated || info.commaOrSpaceSeparated) return list.join(' ');
    return list.join(' ');
  }

  if (typeof value === 'boolean') {
    if (info.boolean || info.overloadedBoolean || info.booleanish) {
      return value ? '' : undefined;
    }
    return value ? 'true' : undefined;
  }

  return String(value);
}
