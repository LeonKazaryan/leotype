const apiBaseUrl = import.meta.env.VITE_API_URL ||
    (import.meta.env.PROD ? '' : 'http://localhost:3001')

const apiRoutes = {
    generateText: '/api/generate-text',
    dictionaryWords: '/api/dictionary/words',
}

export { apiBaseUrl, apiRoutes }
