/** @jsxImportSource @epubook/xml */

import { describe, it, expect } from 'vitest';

import { XHTMLBuilder } from '../src/index.js';

describe('XHTML Builder', () => {
  it('should build empty', () => {
    const builder = new XHTMLBuilder('a.xhtml');
    const xhtml = builder.build();
    expect(xhtml.content).toMatchInlineSnapshot(
      `"<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="en" xml:lang="en"><head /><body /></html>"`
    );
  });

  it('should build styles', () => {
    const builder = new XHTMLBuilder('a.xhtml');
    builder.setTitle('with style').appendStyleSheet('123').appendStyleSheet('456');
    const xhtml = builder.build();

    expect(xhtml.content).toMatchInlineSnapshot(
      `"<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="en" xml:lang="en"><head><link href="123" rel="stylesheet" type="text/css" /><link href="456" rel="stylesheet" type="text/css" /></head><body /></html>"`
    );
  });

  // it('should build nav toc', () => {
  //   const page1 = new HTML('a.xhtml', '');
  //   const page2 = new HTML('b.xhtml', '');
  //   const page4 = new HTML('d.xhtml', '');
  //   const toc = Toc.generate('nav.xhtml', [
  //     { title: 'page 1', page: page1 },
  //     { title: 'page 2', page: page2 },
  //     { title: 'page 3', list: [{ title: 'page 4', page: page4 }] }
  //   ])
  //     .title('Nav')
  //     .build();

  //   expect(toc.content()).toMatchInlineSnapshot(`
  //     "<html xmlns=\\"http://www.w3.org/1999/xhtml\\" xmlns:epub=\\"http://www.idpf.org/2007/ops\\" lang=\\"en\\" xml:lang=\\"en\\">
  //       <head>
  //         <title>Nav</title>
  //       </head>
  //       <body>
  //         <nav epub:type=\\"toc\\">
  //           <h1>Nav</h1>
  //           <ol>
  //             <li>
  //               <a href=\\"a.xhtml\\">page 1</a>
  //             </li>
  //             <li>
  //               <a href=\\"b.xhtml\\">page 2</a>
  //             </li>
  //             <li>
  //               <span>page 3</span>
  //               <ol>
  //                 <li>
  //                   <a href=\\"d.xhtml\\">page 4</a>
  //                 </li>
  //               </ol>
  //             </li>
  //           </ol>
  //         </nav>
  //       </body>
  //     </html>
  //     "
  //   `);
  // });

  it('should build fragment', () => {
    const builder = new XHTMLBuilder('a.xhtml');
    builder.setTitle('framgent').appendBody(
      <>
        123 <span>456</span>
      </>
    );
    const xhtml = builder.build();

    expect(xhtml.content).toMatchInlineSnapshot(
      `"<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="en" xml:lang="en"><head /><body>123 <span>456</span></body></html>"`
    );
  });

  it('should build transform chars', () => {
    const builder = new XHTMLBuilder('a.xhtml');
    const xhtml = builder.appendBody(<p>{'abc<br>def<br>ghi'}</p>).build();
    expect(xhtml.content).toMatchInlineSnapshot(
      `"<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="en" xml:lang="en"><head /><body><p>abc&#x3C;br>def&#x3C;br>ghi</p></body></html>"`
    );
  });
});
