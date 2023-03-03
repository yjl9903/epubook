export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export function toISO8601String(date: Date) {
  function pad(n: number) {
    if (n < 10) {
      return '0' + n;
    }
    return n;
  }
  return (
    date.getUTCFullYear() +
    '-' +
    pad(date.getUTCMonth() + 1) +
    '-' +
    pad(date.getUTCDate()) +
    'T' +
    pad(date.getUTCHours()) +
    ':' +
    pad(date.getUTCMinutes()) +
    ':' +
    pad(date.getUTCSeconds()) +
    'Z'
  );
}
