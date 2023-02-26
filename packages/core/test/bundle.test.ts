import { describe, it, expect } from 'vitest';

import { Epubook } from '../src/epub';
import { makeContainer } from '../src/bundle';

describe('Bundle Epub', () => {
  it('generate container.xml', () => {
    const res = makeContainer(new Epubook());
    console.log(res);
  });
});
