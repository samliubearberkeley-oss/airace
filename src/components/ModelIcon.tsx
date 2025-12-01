import type { AIModel } from '../lib/insforge';

type Props = {
  model: AIModel;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
};

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8 md:w-10 md:h-10',
  xl: 'w-14 h-14 md:w-20 md:h-20',
};

const emojiSizes = {
  sm: 'text-base',
  md: 'text-xl',
  lg: 'text-2xl md:text-3xl',
  xl: 'text-3xl md:text-4xl',
};

export function ModelIcon({ model, size = 'md', className = '' }: Props) {
  if (model.logo) {
    // Invert OpenAI logo to black for light background
    const isOpenAI = model.logo.includes('openai');
    return (
      <img
        src={model.logo}
        alt={model.name}
        className={`${sizeClasses[size]} ${className}`}
        style={{ 
          imageRendering: 'pixelated',
          filter: isOpenAI ? 'invert(1)' : 'none'
        }}
      />
    );
  }

  return (
    <span className={`${emojiSizes[size]} ${className}`} style={{ imageRendering: 'pixelated' }}>
      {model.emoji}
    </span>
  );
}

