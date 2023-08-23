import { describe, it, expect } from 'vitest';

import { Toc, HTML, XHTMLBuilder, Fragment } from '../src';

describe('XHTML Builder', () => {
  it('should build empty', () => {
    const builder = new XHTMLBuilder('a.xhtml');
    const xhtml = builder.build();
    expect(xhtml.content()).toMatchInlineSnapshot(`
      "<html xmlns=\\"http://www.w3.org/1999/xhtml\\" xmlns:epub=\\"http://www.idpf.org/2007/ops\\" lang=\\"en\\" xml:lang=\\"en\\">
        <head>
          <title>a.xhtml</title>
        </head>
        <body></body>
      </html>
      "
    `);
  });

  it('should build styles', () => {
    const builder = new XHTMLBuilder('a.xhtml');
    const xhtml = builder.title('with style').style('123').style('456').build();

    expect(xhtml.content()).toMatchInlineSnapshot(`
      "<html xmlns=\\"http://www.w3.org/1999/xhtml\\" xmlns:epub=\\"http://www.idpf.org/2007/ops\\" lang=\\"en\\" xml:lang=\\"en\\">
        <head>
          <title>with style</title>
          <link href=\\"123\\" rel=\\"stylesheet\\" type=\\"text/css\\"/>
          <link href=\\"456\\" rel=\\"stylesheet\\" type=\\"text/css\\"/>
        </head>
        <body></body>
      </html>
      "
    `);
  });

  it('should build nav toc', () => {
    const page1 = new HTML('a.xhtml', '');
    const page2 = new HTML('b.xhtml', '');
    const page4 = new HTML('d.xhtml', '');
    const toc = Toc.generate('nav.xhtml', [
      { title: 'page 1', page: page1 },
      { title: 'page 2', page: page2 },
      { title: 'page 3', list: [{ title: 'page 4', page: page4 }] }
    ])
      .title('Nav')
      .build();

    expect(toc.content()).toMatchInlineSnapshot(`
      "<html xmlns=\\"http://www.w3.org/1999/xhtml\\" xmlns:epub=\\"http://www.idpf.org/2007/ops\\" lang=\\"en\\" xml:lang=\\"en\\">
        <head>
          <title>Nav</title>
        </head>
        <body>
          <nav epub:type=\\"toc\\">
            <h1>Nav</h1>
            <ol>
              <li>
                <a href=\\"a.xhtml\\">page 1</a>
              </li>
              <li>
                <a href=\\"b.xhtml\\">page 2</a>
              </li>
              <li>
                <span>page 3</span>
                <ol>
                  <li>
                    <a href=\\"d.xhtml\\">page 4</a>
                  </li>
                </ol>
              </li>
            </ol>
          </nav>
        </body>
      </html>
      "
    `);
  });

  it('should build fragment', () => {
    const builder = new XHTMLBuilder('a.xhtml');
    const xhtml = builder
      .title('fragment')
      .body({ tag: Fragment, children: ['123', { tag: 'span', children: ['456'] }] })
      .build();
    expect(xhtml.content()).toMatchInlineSnapshot(`
      "<html xmlns=\\"http://www.w3.org/1999/xhtml\\" xmlns:epub=\\"http://www.idpf.org/2007/ops\\" lang=\\"en\\" xml:lang=\\"en\\">
        <head>
          <title>fragment</title>
        </head>
        <body>
      123    <span>456</span>
        </body>
      </html>
      "
    `);
  });

  it('should build transform chars', () => {
    const builder = new XHTMLBuilder('a.xhtml');
    const xhtml = builder.body({ tag: 'p', children: ['abc<br>def<br>ghi'] }).build();
    expect(xhtml.content()).toMatchInlineSnapshot(`
      "<html xmlns=\\"http://www.w3.org/1999/xhtml\\" xmlns:epub=\\"http://www.idpf.org/2007/ops\\" lang=\\"en\\" xml:lang=\\"en\\">
        <head>
          <title>a.xhtml</title>
        </head>
        <body>
          <p>abc&lt;br&gt;def&lt;br&gt;ghi</p>
        </body>
      </html>
      "
    `);
  });

  it('should build inner html', () => {
    const builder = new XHTMLBuilder('a.xhtml');
    const xhtml = builder.body({ tag: 'p', attrs: { html: 'abc<br>def<br>ghi' } }).build();
    expect(xhtml.content()).toMatchInlineSnapshot(`
      "<html xmlns=\\"http://www.w3.org/1999/xhtml\\" xmlns:epub=\\"http://www.idpf.org/2007/ops\\" lang=\\"en\\" xml:lang=\\"en\\">
        <head>
          <title>a.xhtml</title>
        </head>
        <body>
          <p>abc<br>def<br>ghi</p>
        </body>
      </html>
      "
    `);
  });
});
