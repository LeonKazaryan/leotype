import type { PrismaClient, Prisma } from '@prisma/client'

export type DictionaryDbClient = PrismaClient | Prisma.TransactionClient

export const dictionaryRepository = {
    findByDifficulty: (
        db: DictionaryDbClient,
        difficulty: string,
        language: string
    ) => db.dictionaryEntry.findMany({
        where: { difficulty, language },
        select: { id: true, word: true },
    }),
    createMany: (
        db: DictionaryDbClient,
        words: string[],
        difficulty: string,
        language: string,
        source: string
    ) => db.dictionaryEntry.createMany({
        data: words.map((word) => ({
            word,
            difficulty,
            language,
            source,
        })),
        skipDuplicates: true,
    }),
    deleteByIds: (db: DictionaryDbClient, ids: string[]) => db.dictionaryEntry.deleteMany({
        where: { id: { in: ids } },
    }),
}
