async function generateTextWithAI(
  mode: 'time' | 'words' | 'quote',
  count: number
): Promise<string> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY
  
  if (!apiKey) {
    throw new Error('OpenAI API key not found')
  }
  
  let prompt = ''
  
  if (mode === 'quote') {
    prompt = 'Сгенерируй одну короткую мотивирующую цитату о программировании на русском языке. Только цитату, без кавычек и дополнительных слов.'
  } else if (mode === 'words') {
    prompt = `Сгенерируй список из ${count} случайных русских слов, связанных с программированием и разработкой. Слова должны быть разделены пробелами, без нумерации и дополнительных символов.`
  } else {
    prompt = `Сгенерируй текст из примерно ${count} слов на русском языке, связанный с программированием. Только текст, без заголовков и дополнительных слов.`
  }
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Ты помощник для генерации текста для тренировки печати. Отвечай только запрошенным текстом, без дополнительных объяснений.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: mode === 'quote' ? 50 : count * 10,
        temperature: 0.8,
      }),
    })
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }
    
    const data = await response.json()
    const generatedText = data.choices[0]?.message?.content?.trim()
    
    if (!generatedText) {
      throw new Error('No text generated')
    }
    
    return generatedText
  } catch (error) {
    console.error('AI generation error:', error)
    throw error
  }
}

export { generateTextWithAI }
