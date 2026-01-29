export function normalizeRussianCharForCompare(char: string): string {
  switch (char) {
    case 'ё':
    case 'е':
      return 'е'
    case 'Ё':
    case 'Е':
      return 'Е'
    default:
      return char
  }
}

export function areCharsEquivalent(a: string, b: string): boolean {
  return normalizeRussianCharForCompare(a) === normalizeRussianCharForCompare(b)
}

export function normalizeCharForKey(char: string): string {
  const lower = char.toLowerCase()
  return lower === 'ё' ? 'е' : lower
}
