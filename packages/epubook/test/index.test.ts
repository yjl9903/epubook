import { describe, it, expect } from 'vitest';

import { Epubook } from '../src';

describe('epubook', () => {
  it('should write epub with cover', async () => {
    const book = await Epubook.create({
      title: 'cover'
    });

    await book.cover('../../assets/cover.jpg');

    await book.writeFile('../../.output/test-cover.epub');
  });
});
