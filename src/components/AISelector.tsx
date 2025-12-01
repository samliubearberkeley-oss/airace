import { AI_MODELS, type AIModel } from '../lib/insforge';

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
        <h3 className="text-lg font-semibold text-white">Select AI Racers</h3>
        <span className="text-sm text-gray-400">
          Selected {selectedModels.length}/{maxSelection}
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
                relative p-4 rounded-xl border-2 transition-all duration-300
                ${
                  selected
                    ? 'border-opacity-100 bg-opacity-20 scale-[1.02]'
                    : 'border-opacity-30 hover:border-opacity-60 bg-opacity-5'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                ${!canSelect && !selected ? 'opacity-30' : ''}
              `}
              style={{
                borderColor: model.color,
                backgroundColor: selected ? model.color + '20' : 'transparent',
              }}
            >
              {/* Selection indicator */}
              {selected && (
                <div
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: model.color }}
                >
                  ✓
                </div>
              )}

              {/* Model info */}
              <div className="flex flex-col items-center gap-2">
                <span className="text-3xl">{model.emoji}</span>
                <span className="font-semibold text-white text-sm">
                  {model.name}
                </span>
                <span className="text-xs text-gray-400 text-center">
                  {model.description}
                </span>
              </div>

              {/* Glow effect when selected */}
              {selected && (
                <div
                  className="absolute inset-0 rounded-xl pointer-events-none"
                  style={{
                    boxShadow: `0 0 20px ${model.color}40, inset 0 0 20px ${model.color}10`,
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {selectedModels.length < 2 && (
        <p className="text-amber-400 text-sm text-center">
          ⚠️ Please select at least 2 AI models for the race
        </p>
      )}
    </div>
  );
}
