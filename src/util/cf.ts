export async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(() => resolve(0), ms));
}

export async function sleep(ms: number) {
  return await delay(ms);
}

export function enumName(
  enumObj: any,
  value: number
): string | undefined {
  return Object.keys(enumObj).find(key => enumObj[key] === value);
}
