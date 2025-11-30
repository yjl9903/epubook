import { describe, it, expect } from 'vitest';

import { parseHTML, serializeXML } from '../src/index.js';

describe('xhtml utils', () => {
  it('should parse xhtml', () => {
    const value =
      parseHTML(`<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="en" xml:lang="en">
        <head>
          <title>a.xhtml</title>
        </head>
        <body></body>
      </html>`);
    expect(value).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "attributes": {
              "lang": "en",
              "xml:lang": "en",
              "xmlns": "http://www.w3.org/1999/xhtml",
              "xmlns:epub": "http://www.idpf.org/2007/ops",
            },
            "children": [
              {
                "attributes": {},
                "children": [
                  {
                    "data": undefined,
                    "type": "text",
                    "value": "
                ",
                  },
                  {
                    "attributes": {},
                    "children": [
                      {
                        "data": undefined,
                        "type": "text",
                        "value": "a.xhtml",
                      },
                    ],
                    "data": undefined,
                    "name": "title",
                    "type": "element",
                  },
                  {
                    "data": undefined,
                    "type": "text",
                    "value": "
              ",
                  },
                ],
                "data": undefined,
                "name": "head",
                "type": "element",
              },
              {
                "data": undefined,
                "type": "text",
                "value": "
              ",
              },
              {
                "attributes": {},
                "children": [
                  {
                    "data": undefined,
                    "type": "text",
                    "value": "
            ",
                  },
                ],
                "data": undefined,
                "name": "body",
                "type": "element",
              },
            ],
            "data": undefined,
            "name": "html",
            "type": "element",
          },
        ],
        "data": {
          "quirksMode": true,
        },
        "type": "root",
      }
    `);
  });

  it('should parse fragment', () => {
    const hast = parseHTML(`<p>123</p><p>456</p><p>789</p>`, { fragment: true });
    expect(hast).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "attributes": {},
            "children": [
              {
                "data": undefined,
                "type": "text",
                "value": "123",
              },
            ],
            "data": undefined,
            "name": "p",
            "type": "element",
          },
          {
            "attributes": {},
            "children": [
              {
                "data": undefined,
                "type": "text",
                "value": "456",
              },
            ],
            "data": undefined,
            "name": "p",
            "type": "element",
          },
          {
            "attributes": {},
            "children": [
              {
                "data": undefined,
                "type": "text",
                "value": "789",
              },
            ],
            "data": undefined,
            "name": "p",
            "type": "element",
          },
        ],
        "data": {
          "quirksMode": false,
        },
        "type": "root",
      }
    `);
  });

  it('should serialize and parse xhtml', () => {
    const value = serializeXML(
      parseHTML(`<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="en" xml:lang="en">
        <head>
          <title>a.xhtml</title>
        </head>
        <body></body>
      </html>`)
    );
    expect(value).toMatchInlineSnapshot(`
      "<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="en" xml:lang="en"><head>
                <title>a.xhtml</title>
              </head>
              <body>
            </body></html>"
    `);
  });

  it('should serialize and parse xhtml fragment', () => {
    const value = serializeXML(
      parseHTML(`<p>123</p><p>456</p><p>789</p><br><img src="test.jpg">`, { fragment: true })
    );
    expect(value).toMatchInlineSnapshot(
      `"<p>123</p><p>456</p><p>789</p><br /><img src="test.jpg" />"`
    );
  });
});
