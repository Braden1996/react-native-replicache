function invalidType(v: unknown, t: string): string {
  let s = "Invalid type: ";
  if (v === null || v === undefined) {
    s += v;
  } else {
    s += `${typeof v} \`${v}\``;
  }
  return s + `, expected ${t}`;
}

export function throwInvalidType(v: unknown, t: string): never {
  throw new Error(invalidType(v, t));
}
