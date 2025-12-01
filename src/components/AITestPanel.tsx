import { useState } from 'react';
import { insforge, AI_MODELS, type AIModel } from '../lib/insforge';
import { ModelIcon } from './ModelIcon';

type TestResult = {
  model: AIModel;
  status: 'pending' | 'testing' | 'success' | 'error';
  response?: string;
  time?: number;
  error?: string;
};

export function AITestPanel() {
  const [results, setResults] = useState<TestResult[]>(
    AI_MODELS.map((model) => ({
      model,
      status: 'pending',
    }))
  );
  const [testing, setTesting] = useState(false);

  const testSingleAI = async (model: AIModel, index: number) => {
    // Update status to testing
    setResults((prev) => {
      const newResults = [...prev];
      newResults[index] = { ...newResults[index], status: 'testing' };
      return newResults;
    });

    const startTime = Date.now();

    try {
      const response = await insforge.ai.chat.completions.create({
        model: model.id,
        messages: [
          {
            role: 'user',
            content: 'Say "Hello" in one word only.',
          },
        ],
        temperature: 0.1,
        maxTokens: 20,
      });

      const endTime = Date.now();
      const content = response.choices[0]?.message?.content || 'No response';

      setResults((prev) => {
        const newResults = [...prev];
        newResults[index] = {
          ...newResults[index],
          status: 'success',
          response: content,
          time: endTime - startTime,
        };
        return newResults;
      });
    } catch (error) {
      const endTime = Date.now();
      setResults((prev) => {
        const newResults = [...prev];
        newResults[index] = {
          ...newResults[index],
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
          time: endTime - startTime,
        };
        return newResults;
      });
    }
  };

  const testAllAIs = async () => {
    setTesting(true);
    
    // Reset all results
    setResults(
      AI_MODELS.map((model) => ({
        model,
        status: 'pending',
      }))
    );

    // Test all AIs in parallel
    await Promise.all(
      AI_MODELS.map((model, index) => testSingleAI(model, index))
    );

    setTesting(false);
  };

  const successCount = results.filter((r) => r.status === 'success').length;
  const errorCount = results.filter((r) => r.status === 'error').length;

  return (
    <div className="pixel-panel p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="text-sm md:text-base pixel-text text-nes-white">🔌 AI CONNECTION TEST</h3>
        <button
          onClick={testAllAIs}
          disabled={testing}
          className="pixel-button"
          style={{ 
            background: testing ? 'var(--nes-gray)' : 'var(--nes-cyan)',
            fontSize: '12px',
            padding: '8px 16px',
          }}
        >
          {testing ? '⏳ TESTING...' : '🧪 TEST ALL AIS'}
        </button>
      </div>

      {/* Summary */}
      {(successCount > 0 || errorCount > 0) && (
        <div className="mb-4 flex gap-4 text-xs pixel-text flex-wrap">
          <span className="text-nes-green">✅ {successCount} SUCCESS</span>
          <span className="text-nes-red">❌ {errorCount} FAILED</span>
        </div>
      )}

      {/* Results */}
      <div className="space-y-3">
        {results.map((result, index) => (
          <div
            key={result.model.id}
            className="flex items-center justify-between p-3 border-3 flex-wrap gap-2"
            style={{
              borderColor: result.model.color + '80',
              borderWidth: '3px',
              backgroundColor:
                result.status === 'success'
                  ? 'var(--nes-green)' + '20'
                  : result.status === 'error'
                    ? 'var(--nes-red)' + '20'
                    : result.status === 'testing'
                      ? 'var(--nes-blue)' + '20'
                      : 'var(--nes-dark-gray)',
              boxShadow: '0 2px 0 var(--nes-black)',
              imageRendering: 'pixelated',
            }}
          >
            {/* Model info */}
            <div className="flex items-center gap-3">
              <ModelIcon model={result.model} size="lg" />
              <div>
                <div className="pixel-text text-nes-white text-xs md:text-sm font-medium">{result.model.name.toUpperCase()}</div>
                <div className="text-[10px] text-nes-light-gray pixel-text">{result.model.id}</div>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-3 flex-wrap">
              {result.time && (
                <span className="text-xs text-nes-light-gray font-pixel">{result.time}MS</span>
              )}

              {result.status === 'pending' && (
                <span className="text-nes-light-gray text-xs pixel-text">⏸️ PENDING</span>
              )}

              {result.status === 'testing' && (
                <span className="text-nes-blue text-xs pixel-text animate-pixel-glow">
                  🔄 TESTING...
                </span>
              )}

              {result.status === 'success' && (
                <div className="text-right">
                  <span className="text-nes-green text-xs pixel-text">✅ CONNECTED</span>
                  {result.response && (
                    <div className="text-[10px] text-nes-light-gray pixel-text mt-1">
                      RESPONSE: "{result.response.toUpperCase()}"
                    </div>
                  )}
                </div>
              )}

              {result.status === 'error' && (
                <div className="text-right max-w-[200px]">
                  <span className="text-nes-red text-xs pixel-text">❌ ERROR</span>
                  {result.error && (
                    <div className="text-[10px] text-nes-red pixel-text mt-1 truncate">
                      {result.error.toUpperCase()}
                    </div>
                  )}
                </div>
              )}

              {/* Retest button */}
              {(result.status === 'success' || result.status === 'error') && (
                <button
                  onClick={() => testSingleAI(result.model, index)}
                  className="pixel-button"
                  style={{ 
                    background: 'var(--nes-gray)',
                    fontSize: '10px',
                    padding: '4px 8px',
                  }}
                >
                  🔄
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
