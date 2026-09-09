import { GoogleGenAI } from '@google/genai';

type Provider = 'gemini' | 'openai' | 'grok';
export type Role = 'user' | 'ai';
export type AIMessage = { role: Role; text: string };

const SYSTEM_PROMPT = `You are SmritiSaathi, a friendly and empathetic AI companion for an elderly person who might be experiencing early memory loss or dementia. 
Keep your answers brief, simple, warm, and encouraging. Never be clinical or cold. 
Respond in the language the user speaks to you (English, Hindi, Bengali, etc.).`;

class AIService {
  private geminiClient: GoogleGenAI | null = null;
  private apiKeys: Record<Provider, string[]> = {
    gemini: [],
    openai: [],
    grok: []
  };
  
  // Define the order in which providers should be tried
  private providerFallbackChain: Provider[] = ['gemini', 'openai', 'grok'];
  private currentProviderIndex = 0;
  
  // Track current key index for each provider
  private providerKeyIndex: Record<Provider, number> = {
    gemini: 0,
    openai: 0,
    grok: 0
  };

  private history: AIMessage[] = [];

  constructor() {
    this.loadKeys('gemini', process.env.EXPO_PUBLIC_GEMINI_API_KEY);
    this.loadKeys('openai', process.env.EXPO_PUBLIC_OPENAI_API_KEY);
    this.loadKeys('grok', process.env.EXPO_PUBLIC_GROK_API_KEY);

    this.initGeminiClient();
  }

  private loadKeys(provider: Provider, rawEnv?: string) {
    if (rawEnv) {
      this.apiKeys[provider] = rawEnv.split(',').map(k => k.trim()).filter(k => k.length > 0);
    }
  }

  private initGeminiClient() {
    const geminiKeys = this.apiKeys['gemini'];
    const idx = this.providerKeyIndex['gemini'];
    if (geminiKeys.length > 0 && idx < geminiKeys.length) {
      this.geminiClient = new GoogleGenAI({ apiKey: geminiKeys[idx] });
    }
  }

  public async startChat() {
    this.history = [];
  }

  public async sendMessage(text: string): Promise<string> {
    this.history.push({ role: 'user', text });
    
    const responseText = await this.trySendMessage();
    
    this.history.push({ role: 'ai', text: responseText });
    return responseText;
  }

  private async trySendMessage(retries = 3, backoff = 1000): Promise<string> {
    if (this.currentProviderIndex >= this.providerFallbackChain.length) {
      return "I'm having a lot of trouble connecting to my cloud services right now. Let's try again in a moment.";
    }

    const currentProvider = this.providerFallbackChain[this.currentProviderIndex];
    const keys = this.apiKeys[currentProvider];
    const keyIdx = this.providerKeyIndex[currentProvider];

    if (keys.length === 0 || keyIdx >= keys.length) {
      // Current provider has no more valid keys, failover to next provider
      console.warn(`No valid keys left for provider ${currentProvider}. Failing over to next provider.`);
      this.currentProviderIndex++;
      return this.trySendMessage(3, 1000); // reset retries for new provider
    }

    const apiKey = keys[keyIdx];

    try {
      if (currentProvider === 'gemini') {
        return await this.callGemini();
      } else if (currentProvider === 'openai') {
        return await this.callOpenAI(apiKey);
      } else if (currentProvider === 'grok') {
        return await this.callGrok(apiKey);
      }
    } catch (error: any) {
      const status = error?.status || error?.response?.status;
      
      console.warn(`Error with ${currentProvider} (Key index ${keyIdx}): Status ${status}`, error);

      // Rate limit or server error -> try next key for SAME provider
      if (status === 429 || status === 503 || status === 401 || status === 404) {
        if (keyIdx < keys.length - 1) {
          console.warn(`Switching to next key for ${currentProvider}`);
          this.providerKeyIndex[currentProvider]++;
          if (currentProvider === 'gemini') this.initGeminiClient();
          return this.trySendMessage(retries, backoff);
        } else {
          // No more keys for this provider, switch to NEXT provider
          console.warn(`No more keys for ${currentProvider}, failing over to next provider.`);
          this.currentProviderIndex++;
          return this.trySendMessage(3, 1000);
        }
      }

      // If it's a 503 and we have retries left before giving up on the key
      if (status === 503 && retries > 0) {
        console.warn(`${currentProvider} API 503 error. Retrying in ${backoff}ms... (${retries} retries left)`);
        await new Promise(resolve => setTimeout(resolve, backoff));
        return this.trySendMessage(retries - 1, backoff * 2);
      }
    }
    
    return "I'm sorry, I'm having trouble processing that request right now.";
  }

  // --- Provider Implementations ---

  private async callGemini(): Promise<string> {
    if (!this.geminiClient) throw new Error("Gemini client not initialized");
    
    // Convert generic history to Gemini history format
    const contents = this.history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    const response = await this.geminiClient.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: contents,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.7,
      }
    });

    if (!response.text) throw new Error("Empty response from Gemini");
    return response.text;
  }

  private async callOpenAI(apiKey: string): Promise<string> {
    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...this.history.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.text
      }))
    ];

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        temperature: 0.7
      })
    });

    if (!res.ok) {
      throw { status: res.status, message: await res.text() };
    }

    const data = await res.json();
    return data.choices[0].message.content;
  }

  private async callGrok(apiKey: string): Promise<string> {
    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...this.history.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.text
      }))
    ];

    const res = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'grok-2', // or whatever their current active model is
        messages: messages,
        temperature: 0.7
      })
    });

    if (!res.ok) {
      throw { status: res.status, message: await res.text() };
    }

    const data = await res.json();
    return data.choices[0].message.content;
  }
}

export const aiService = new AIService();
