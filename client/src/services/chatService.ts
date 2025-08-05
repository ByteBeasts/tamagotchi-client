const API_BASE_URL = 'https://babybeasts.up.railway.app';

const FALLBACK_RESPONSES = [
  "Lo siento, tengo problemas de conexión. ¿Puedes intentar de nuevo? 🔄",
  "Disculpa, no pude procesar tu mensaje en este momento. 😅",
  "¡Ups! Algo salió mal. ¿Podrías repetir tu pregunta? 🤔"
];

const AGENT_MAP = {
  wolf: 'WolfPup',
  dragon: 'Solarius',
  snake: 'Foxling'
} as const;

export type ChatAgent = 'Solarius' | 'Foxling' | 'WolfPup';

interface ChatResponse {
  text: string;
}

export class ChatService {
  static async sendMessage(message: string, userId: string, agent: ChatAgent): Promise<string> {
    try {
      const response = await fetch(`${API_BASE_URL}/${agent}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: message,
          userId,
          userName: "User"
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data: ChatResponse[] = await response.json();
      const responseText = data[0]?.text;
      
      if (!responseText) {
        throw new Error('No response text');
      }

      return responseText;
      
    } catch (error) {
      console.error('Chat API error:', error);
      return FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
    }
  }

  static getAgentForBeastType(beastType?: string): ChatAgent {
    const normalizedType = beastType?.toLowerCase() as keyof typeof AGENT_MAP;
    return AGENT_MAP[normalizedType] || 'Solarius';
  }
} 