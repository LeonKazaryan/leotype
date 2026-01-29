export function extractNormalizedWords(text: string): string[] {
    const matches = text.match(/[A-Za-zА-Яа-яЁё]+/g)
    if (!matches) {
        return []
    }

    return matches.map((word) => word.toLowerCase())
}

export function uniqueWords(words: string[]): string[] {
    return Array.from(new Set(words))
}

export function sampleArray<T>(items: T[], count: number): T[] {
    if (count <= 0 || items.length === 0) {
        return []
    }

    const copy = items.slice()
    for (let i = copy.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1))
        const temp = copy[i]
        copy[i] = copy[j]
        copy[j] = temp
    }

    return copy.slice(0, Math.min(count, copy.length))
}
