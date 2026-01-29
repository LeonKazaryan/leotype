-- CreateIndex
CREATE INDEX "DictionaryEntry_difficulty_language_idx" ON "DictionaryEntry"("difficulty", "language");

-- CreateIndex
CREATE UNIQUE INDEX "DictionaryEntry_word_language_difficulty_key" ON "DictionaryEntry"("word", "language", "difficulty");
