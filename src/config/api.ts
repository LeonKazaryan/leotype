const apiBaseUrl = import.meta.env.VITE_API_URL ||
    (import.meta.env.PROD ? '' : 'http://localhost:3001')

const apiRoutes = {
    generateText: '/api/generate-text',
    dictionaryWords: '/api/dictionary/words',
    userStats: '/api/user/stats',
}

export { apiBaseUrl, apiRoutes }
