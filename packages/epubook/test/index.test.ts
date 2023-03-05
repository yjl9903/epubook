import { describe, it, expect } from 'vitest';

import { Epubook } from '../src';

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
});
