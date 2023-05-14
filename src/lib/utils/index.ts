export function omit<
  T extends Record<string, unknown>,
  R extends Record<string, unknown> = T
>(target: T, keys: (keyof T)[]): R {
  return Object.entries(target).reduce((acc, [key, value]) => {
    if (keys.includes(key)) {
      return acc;
    }

    return { ...acc, [key]: value };
  }, {} as R);
}
