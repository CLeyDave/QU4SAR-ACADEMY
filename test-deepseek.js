import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY // ¡Nunca pongas tu key directamente en el código!
});

async function main() {
  try {
    const response = await client.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: 'Eres un asistente útil.' },
        { role: 'user', content: '¡Hola! ¿Cómo estás?' }
      ]
    });
    
    console.log(response.choices[0].message.content);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();