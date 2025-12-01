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
    { name: 'Easy', width: 5, height: 5 },
    { name: 'Medium', width: 8, height: 8 },
    { name: 'Hard', width: 12, height: 12 },
    { name: 'Expert', width: 15, height: 15 },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-sm md:text-base text-[#000000] font-semibold">Maze Settings</h3>

      {/* Presets */}
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => {
          const isActive = width === preset.width && height === preset.height;
          return (
            <button
              key={preset.name}
              onClick={() => {
                onWidthChange(preset.width);
                onHeightChange(preset.height);
              }}
              disabled={disabled}
              className="px-3 py-2 border-3 pixel-text text-xs transition-none"
              style={{
                borderColor: '#000000',
                borderWidth: '2px',
                backgroundColor: isActive ? 'var(--nes-cyan)' + '30' : 'var(--nes-dark-gray)',
                color: isActive ? 'var(--nes-cyan)' : '#000000',
                boxShadow: isActive 
                  ? '0 3px 0 rgba(0, 0, 0, 0.2)'
                  : '0 2px 0 rgba(0, 0, 0, 0.1)',
                opacity: disabled ? 0.5 : 1,
                cursor: disabled ? 'not-allowed' : 'pointer',
                imageRendering: 'pixelated',
              }}
            >
              {preset.name.toUpperCase()} ({preset.width}×{preset.height})
            </button>
          );
        })}
      </div>

      {/* Custom size */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <label className="text-[#666666] text-xs font-normal">Width:</label>
          <input
            type="range"
            min={3}
            max={20}
            value={width}
            onChange={(e) => onWidthChange(Number(e.target.value))}
            disabled={disabled}
            className="w-32 md:w-40"
            style={{ minWidth: '128px' }}
          />
          <span className="text-[#000000] font-normal text-sm w-8 font-semibold">{width}</span>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-[#666666] text-xs font-normal">Height:</label>
          <input
            type="range"
            min={3}
            max={20}
            value={height}
            onChange={(e) => onHeightChange(Number(e.target.value))}
            disabled={disabled}
            className="w-32 md:w-40"
            style={{ minWidth: '128px' }}
          />
          <span className="text-[#000000] font-normal text-sm w-8 font-semibold">{height}</span>
        </div>
      </div>
    </div>
  );
}
