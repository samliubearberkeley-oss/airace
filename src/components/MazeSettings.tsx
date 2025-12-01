type Props = {
  width: number;
  height: number;
  onWidthChange: (value: number) => void;
  onHeightChange: (value: number) => void;
  disabled?: boolean;
};

export function MazeSettings({
  width,
  height,
  onWidthChange,
  onHeightChange,
  disabled = false,
}: Props) {
  const presets = [
    { name: 'Easy', width: 5, height: 5, emoji: '🌱' },
    { name: 'Medium', width: 8, height: 8, emoji: '🌿' },
    { name: 'Hard', width: 12, height: 12, emoji: '🌳' },
    { name: 'Expert', width: 15, height: 15, emoji: '🏔️' },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Maze Settings</h3>

      {/* Presets */}
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => (
          <button
            key={preset.name}
            onClick={() => {
              onWidthChange(preset.width);
              onHeightChange(preset.height);
            }}
            disabled={disabled}
            className={`
              px-4 py-2 rounded-lg border transition-all duration-200
              ${
                width === preset.width && height === preset.height
                  ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300'
                  : 'border-gray-600 hover:border-gray-500 text-gray-300'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <span className="mr-2">{preset.emoji}</span>
            {preset.name} ({preset.width}×{preset.height})
          </button>
        ))}
      </div>

      {/* Custom size */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <label className="text-gray-400 text-sm">Width:</label>
          <input
            type="range"
            min={3}
            max={20}
            value={width}
            onChange={(e) => onWidthChange(Number(e.target.value))}
            disabled={disabled}
            className="w-24 accent-cyan-500"
          />
          <span className="text-white font-mono w-8">{width}</span>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-gray-400 text-sm">Height:</label>
          <input
            type="range"
            min={3}
            max={20}
            value={height}
            onChange={(e) => onHeightChange(Number(e.target.value))}
            disabled={disabled}
            className="w-24 accent-cyan-500"
          />
          <span className="text-white font-mono w-8">{height}</span>
        </div>
      </div>
    </div>
  );
}
