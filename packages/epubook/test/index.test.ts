import * as fs from 'node:fs';
import { describe, it, expect } from 'vitest';

import { Epubook, XHTML } from '../src';

describe('epubook', () => {
  it('should write epub with cover', async () => {
    const book = await Epubook.create({
      title: 'epubook test',
      description: 'This is generated for testing cover image',
      language: 'zh-CN',
      author: [{ name: 'XLor', fileAs: 'xlor' }],
      date: new Date('2023-02-28'),
      lastModified: new Date('2023-03-05'),
      subject: 'novel',
      publisher: 'XLor Books'
    });

    const cover = await book.cover('../../assets/cover.jpg');
    const p1 = book.page('chapter', { title: '第一章', content: '你好，这是第一章。' });
    const p2 = book.page('chapter', { title: '第二章', content: '你好，这是第二章。' });
    book.toc(cover, p1, p2);

    await book.writeFile('../../.output/test-cover.epub');
  });

  it('should genreate', async () => {
    const book = await Epubook.create({
      title: '关于邻家的天使大人不知不觉把我惯成了废人这档子事 01 [test]',
      description: `藤宫周所住公寓的隔壁，住着学校第一的美少女椎名真昼。两人原本并没有什么瓜葛。有一天，周看到她淋在雨中，把伞借给了她。此后，两人开始了不可思议的交流。
      真昼看不下去周自甘堕落的独居生活，帮忙做饭、打扫房间，在各个方面都照顾着周。
      真昼渴望家庭间的关系，逐渐敞开心扉开始撒娇，而周却不能完全带着自信接受她的好意。两人尽管不坦率，但还是一点一点缩短着距离……
      这个恋爱故事，在「成为小说家吧」获得了大量的支持，发生在周与冷淡可爱的邻居之间，甜蜜而让人焦急。`,
      language: 'zh-CN',
      author: [{ name: '佐伯さん', fileAs: '佐伯さん' }],
      subject: '轻小说',
      source: '轻之国度ePub工作组',
      publisher: 'GA文庫',
      date: new Date('2019-06-12T16:00:00+00:00')
    });

    const cover = await book.cover('../../assets/cover.jpg');

    const content = fs.readFileSync('../../assets/content.txt', 'utf-8').split('\n');
    const chapters: XHTML[] = [];
    {
      let i = -1;
      for (let i = 0; i < content.length; ) {
        const RE = /第一卷 第(\d+)话/;
        const l = content[i];
        if (RE.test(l)) {
          const st = i;
          i++;
          while (i < content.length && !RE.test(content[i])) {
            i++;
          }
          const c = content.slice(st + 1, i);
          const page = book.page('chapter', {
            title: content[st].replace('第一卷 ', ''),
            content: c.join('\n')
          });
          chapters.push(page);
        } else {
          i++;
        }
      }
    }

    book.toc(cover, ...chapters);

    await book.writeFile('../../.output/test-book.epub');
  });
});
