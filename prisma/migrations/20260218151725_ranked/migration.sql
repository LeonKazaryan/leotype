-- CreateEnum
CREATE TYPE "RankedResult" AS ENUM ('WIN', 'LOSS', 'DRAW');

-- CreateTable
CREATE TABLE "RankedProfile" (
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 1000,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "racesPlayed" INTEGER NOT NULL DEFAULT 0,
    "sumWpm" INTEGER NOT NULL DEFAULT 0,
    "sumAccuracy" INTEGER NOT NULL DEFAULT 0,
    "lastPlayedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RankedProfile_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "RankedMatch" (
    "id" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "language" TEXT NOT NULL,
    "wordCount" INTEGER NOT NULL,
    "difficulty" TEXT NOT NULL,

    CONSTRAINT "RankedMatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RankedParticipant" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "userId" TEXT,
    "opponentId" TEXT,
    "isBot" BOOLEAN NOT NULL DEFAULT false,
    "nickname" TEXT NOT NULL,
    "ratingBefore" INTEGER NOT NULL,
    "ratingAfter" INTEGER NOT NULL,
    "delta" INTEGER NOT NULL,
    "result" "RankedResult" NOT NULL,
    "wpm" INTEGER NOT NULL,
    "accuracy" INTEGER NOT NULL,
    "errors" INTEGER NOT NULL,
    "timeSec" INTEGER NOT NULL,
    "words" INTEGER NOT NULL,
    "characters" INTEGER NOT NULL,

    CONSTRAINT "RankedParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RankedParticipant_userId_idx" ON "RankedParticipant"("userId");

-- AddForeignKey
ALTER TABLE "RankedProfile" ADD CONSTRAINT "RankedProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RankedParticipant" ADD CONSTRAINT "RankedParticipant_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "RankedMatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RankedParticipant" ADD CONSTRAINT "RankedParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
