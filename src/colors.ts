const useColor = Boolean(process.stdout.isTTY);

const wrap = (code: number, text: string): string =>
  useColor ? `\x1b[${code}m${text}\x1b[0m` : text;

export const cyan = (text: string): string => wrap(36, text);
export const yellow = (text: string): string => wrap(33, text);
export const green = (text: string): string => wrap(32, text);
export const red = (text: string): string => wrap(31, text);
