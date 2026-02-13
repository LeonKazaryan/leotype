export const aiConfig = {
  provider: {
    apiBaseUrl: 'https://api.x.ai/v1',
    modelsEndpoint: '/models',
    chatEndpoint: '/chat/completions',
  },
  model: 'grok-3',
  temperature: 0.8,
  maxTokens: {
    quote: 50,
    perWord: 10,
  },
  request: {
    minIntervalMs: 3000,
  },
}
