import { useState } from 'react';
import { insforge, AI_MODELS, type AIModel } from '../lib/insforge';

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
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">🔌 AI Connection Test</h3>
        <button
          onClick={testAllAIs}
          disabled={testing}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            testing
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-cyan-500 hover:bg-cyan-600'
          } text-white`}
        >
          {testing ? '⏳ Testing...' : '🧪 Test All AIs'}
        </button>
      </div>

      {/* Summary */}
      {(successCount > 0 || errorCount > 0) && (
        <div className="mb-4 flex gap-4 text-sm">
          <span className="text-green-400">✅ {successCount} Success</span>
          <span className="text-red-400">❌ {errorCount} Failed</span>
        </div>
      )}

      {/* Results */}
      <div className="space-y-3">
        {results.map((result, index) => (
          <div
            key={result.model.id}
            className="flex items-center justify-between p-3 rounded-lg border"
            style={{
              borderColor: result.model.color + '50',
              backgroundColor:
                result.status === 'success'
                  ? 'rgba(34, 197, 94, 0.1)'
                  : result.status === 'error'
                    ? 'rgba(239, 68, 68, 0.1)'
                    : result.status === 'testing'
                      ? 'rgba(59, 130, 246, 0.1)'
                      : 'transparent',
            }}
          >
            {/* Model info */}
            <div className="flex items-center gap-3">
              <span className="text-2xl">{result.model.emoji}</span>
              <div>
                <div className="font-medium text-white">{result.model.name}</div>
                <div className="text-xs text-gray-400">{result.model.id}</div>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-3">
              {result.time && (
                <span className="text-sm text-gray-400">{result.time}ms</span>
              )}

              {result.status === 'pending' && (
                <span className="text-gray-400 text-sm">⏸️ Pending</span>
              )}

              {result.status === 'testing' && (
                <span className="text-blue-400 text-sm animate-pulse">
                  🔄 Testing...
                </span>
              )}

              {result.status === 'success' && (
                <div className="text-right">
                  <span className="text-green-400 text-sm">✅ Connected</span>
                  {result.response && (
                    <div className="text-xs text-gray-400 mt-1">
                      Response: "{result.response}"
                    </div>
                  )}
                </div>
              )}

              {result.status === 'error' && (
                <div className="text-right max-w-[200px]">
                  <span className="text-red-400 text-sm">❌ Error</span>
                  {result.error && (
                    <div className="text-xs text-red-300 mt-1 truncate">
                      {result.error}
                    </div>
                  )}
                </div>
              )}

              {/* Retest button */}
              {(result.status === 'success' || result.status === 'error') && (
                <button
                  onClick={() => testSingleAI(result.model, index)}
                  className="text-xs px-2 py-1 bg-slate-600 hover:bg-slate-500 rounded text-white"
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
