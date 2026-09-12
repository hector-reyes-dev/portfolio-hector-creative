export type PathToken = string | number;

export function tokenizePath(d: string | null): PathToken[] {
  const matches = (d || '').match(/[MLQCZ]|-?\d*\.?\d+/g) || [];
  return matches.map((token) => (/^[MLQCZ]$/.test(token) ? token : Number(token)));
}

export function tokensCompatible(a: PathToken[], b: PathToken[]): boolean {
  if (a.length !== b.length || a.length === 0) return false;
  return a.every((token, index) => typeof token === typeof b[index]);
}

export function interpolatePath(a: PathToken[], b: PathToken[], progress: number): string {
  const eased = 1 - Math.pow(1 - progress, 3);
  return a
    .map((token, index) => {
      if (typeof token !== 'number') return token;
      const target = b[index] as number;
      return Math.round((token + (target - token) * eased) * 100) / 100;
    })
    .join(' ');
}
