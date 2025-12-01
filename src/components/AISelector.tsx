import { AI_MODELS, type AIModel } from '../lib/insforge';
import { ModelIcon } from './ModelIcon';

type Props = {
  selectedModels: AIModel[];
  onToggle: (model: AIModel) => void;
  disabled?: boolean;
  maxSelection?: number;
};

export function AISelector({
  selectedModels,
  onToggle,
  disabled = false,
  maxSelection = 5,
}: Props) {
  const isSelected = (model: AIModel) =>
    selectedModels.some((m) => m.id === model.id);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm md:text-base text-[#000000] font-semibold">Select AI Racers</h3>
        <span className="text-xs md:text-sm text-[#666666] font-normal">
          {selectedModels.length}/{maxSelection} selected
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {AI_MODELS.map((model) => {
          const selected = isSelected(model);
          const canSelect = selected || selectedModels.length < maxSelection;

          return (
            <button
              key={model.id}
              onClick={() => canSelect && onToggle(model)}
              disabled={disabled || (!selected && !canSelect)}
              className={`
                relative p-4 border-3 transition-none
                ${selected ? 'scale-[1.05]' : ''}
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                ${!canSelect && !selected ? 'opacity-30' : ''}
              `}
              style={{
                borderColor: '#000000',
                borderWidth: '2px',
                backgroundColor: selected ? model.color + '30' : 'var(--nes-dark-gray)',
                boxShadow: selected 
                  ? `0 2px 4px rgba(0, 0, 0, 0.1), inset 0 0 10px ${model.color}20`
                  : '0 2px 4px rgba(0, 0, 0, 0.1)',
                imageRendering: 'pixelated',
              }}
            >
              {/* Selection indicator */}
              {selected && (
                <div
                  className="absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center text-white text-xs pixel-text border-2"
                  style={{ 
                    backgroundColor: model.color,
                    borderColor: '#000000',
                    boxShadow: '2px 2px 0 rgba(0, 0, 0, 0.2)',
                  }}
                >
                  ✓
                </div>
              )}

              {/* Model info */}
              <div className="flex flex-col items-center gap-2">
                <ModelIcon model={model} size="lg" />
                <span className="text-[#000000] text-xs md:text-sm font-semibold">
                  {model.name}
                </span>
                <span className="text-xs md:text-sm text-[#666666] text-center leading-tight font-normal">
                  {model.description}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {selectedModels.length < 2 && (
        <p className="text-nes-yellow text-xs md:text-sm text-center font-normal">
          ⚠️ Select at least 2 AI models for the race
        </p>
      )}
    </div>
  );
}
