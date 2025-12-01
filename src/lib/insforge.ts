import { createClient } from '@insforge/sdk';

export const insforge = createClient({
  baseUrl: import.meta.env.VITE_INSFORGE_BASE_URL,
  anonKey: import.meta.env.VITE_INSFORGE_ANON_KEY,
});

// Available AI models for the maze race
export const AI_MODELS = [
  {
    id: 'x-ai/grok-4',
    name: 'Grok 4',
    emoji: '🚀',
    logo: '/logos/grok.png',
    color: '#FF6B35',
    description: 'Latest model from xAI',
  },
  {
    id: 'google/gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    emoji: '🌟',
    logo: '/logos/gemini.png',
    color: '#4285F4',
    description: 'Google flagship model',
  },
  {
    id: 'anthropic/claude-sonnet-4.5',
    name: 'Claude Sonnet 4.5',
    emoji: '🎭',
    logo: '/logos/claude.png',
    color: '#D97706',
    description: 'Anthropic intelligent assistant',
  },
  {
    id: 'openai/gpt-5',
    name: 'GPT-5',
    emoji: '🧠',
    logo: '/logos/openai.png',
    color: '#10A37F',
    description: 'OpenAI most powerful model',
  },
  {
    id: 'openai/gpt-4o',
    name: 'GPT-4o',
    emoji: '💡',
    logo: '/logos/openai.png',
    color: '#AB68FF',
    description: 'OpenAI multimodal model',
  },
] as const;

export type AIModel = {
  id: string;
  name: string;
  emoji: string;
  logo?: string;
  color: string;
  description: string;
};
