/**
 * Algorithm Marketplace Component
 * Integrates with existing HOOTNER frontend
 */

import React, { useState, useEffect } from 'react';
import { useStripe } from '@stripe/react-stripe-js';

interface ExecutionResult {
  success: boolean;
  result?: any;
  error?: string;
}

export const AlgorithmMarketplace: React.FC = () => {
  const [algorithms, setAlgorithms] = useState<string[]>([]);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string | null>(null);
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const stripe = useStripe();
  const API_BASE = (import.meta as any)?.env?.VITE_API_BASE_URL || '';

  useEffect(() => {
    fetch(`${API_BASE}/api/algorithms`)
      .then((res) => res.json())
      .then((data) => setAlgorithms(data.available_algorithms || []))
      .catch(() => setAlgorithms([]));
  }, []);

  const executeAlgorithm = async () => {
    if (!selectedAlgorithm || !input.trim()) return;

    try {
      const response = await fetch(`${API_BASE}/api/algorithms/${selectedAlgorithm}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: JSON.parse(input),
          user_id: 'current_user',
          tier: 'free',
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ success: false, error: 'Invalid JSON input or network error' });
    }
  };

  return (
    <div className="algorithm-marketplace p-6">
      <h2 className="text-2xl font-bold mb-4">Algorithm Marketplace</h2>
      <p className="text-gray-600 mb-6">500+ Production-Ready Algorithms</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="algorithm-list">
          <h3 className="font-semibold mb-2">Available Algorithms</h3>
          {algorithms.map((algo) => (
            <button
              key={algo}
              onClick={() => setSelectedAlgorithm(algo)}
              className={`block w-full text-left p-2 hover:bg-gray-100 rounded ${
                selectedAlgorithm === algo ? 'bg-blue-100' : ''
              }`}
            >
              {algo}
            </button>
          ))}
        </div>

        <div className="algorithm-input">
          <h3 className="font-semibold mb-2">Input Data</h3>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter input (JSON format)"
            className="w-full h-32 p-2 border rounded"
          />
          <button
            onClick={executeAlgorithm}
            disabled={!selectedAlgorithm || !input.trim()}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            Execute Algorithm
          </button>
        </div>

        <div className="algorithm-result">
          <h3 className="font-semibold mb-2">Result</h3>
          {result && (
            <div className="p-4 bg-gray-50 rounded">
              <pre>{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>

      <div className="pricing-tiers mt-8 grid grid-cols-3 gap-4">
        <div className="tier p-4 border rounded">
          <h4 className="font-semibold">Free</h4>
          <p>10 executions/day</p>
          <p className="text-2xl font-bold">$0</p>
        </div>
        <div className="tier p-4 border rounded bg-blue-50">
          <h4 className="font-semibold">Pro</h4>
          <p>1000 executions/month</p>
          <p className="text-2xl font-bold">$10</p>
        </div>
        <div className="tier p-4 border rounded">
          <h4 className="font-semibold">Enterprise</h4>
          <p>Unlimited executions</p>
          <p className="text-2xl font-bold">$100</p>
        </div>
      </div>
    </div>
  );
};

export default AlgorithmMarketplace;
