import { createDefu } from 'defu';

export const defu = createDefu((obj: any, key, value: any) => {
  if (obj[key] instanceof Date && value instanceof Date) {
    obj[key] = value;
    return true;
  }
});
