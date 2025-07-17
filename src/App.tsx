import React, { useState } from 'react';
import { AlertTriangle, FileText, Shield, Send, RefreshCw, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface ApiResponse {
  summary?: string;
  risk?: string;
  error?: string;
}

function App() {
  const [crisisInput, setCrisisInput] = useState('');
  const [summary, setSummary] = useState<string>('');
  const [riskLevel, setRiskLevel] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [riskLoading, setRiskLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const callSummarisationAPI = async () => {
    setSummaryLoading(true);
    try {
      const response = await fetch('https://6c8b7c166779.ngrok-free.app/summarise', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: crisisInput
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();
      setSummary(data.summary || 'No summary available');
    } catch (err) {
      setSummary('Error: Unable to generate summary. Please check API connection.');
      console.error('Summarisation API Error:', err);
    } finally {
      setSummaryLoading(false);
    }
  };

  const callRiskPredictionAPI = async () => {
    setRiskLoading(true);
    try {
      const response = await fetch('https://6c8b7c166779.ngrok-free.app/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: crisisInput
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();
      setRiskLevel(data.risk || 'Risk level unavailable');
    } catch (err) {
      setRiskLevel('Error: Unable to predict risk level. Please check API connection.');
      console.error('Risk Prediction API Error:', err);
    } finally {
      setRiskLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!crisisInput.trim()) {
      setError('Please enter a crisis update before analyzing.');
      return;
    }

    setError('');
    setIsLoading(true);

    // Call both APIs concurrently
    await Promise.all([
      callSummarisationAPI(),
      callRiskPredictionAPI()
    ]);

    setIsLoading(false);
    setLastUpdated(new Date().toLocaleString());
  };

  const handleRefresh = () => {
    if (crisisInput.trim()) {
      handleAnalyze();
    }
  };

  const getRiskLevelColor = (risk: string) => {
    const riskLower = risk.toLowerCase();
    if (riskLower.includes('high') || riskLower.includes('severe') || riskLower.includes('critical')) {
      return 'text-red-600 bg-red-50 border-red-200';
    } else if (riskLower.includes('medium') || riskLower.includes('moderate')) {
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    } else if (riskLower.includes('low') || riskLower.includes('minimal')) {
      return 'text-green-600 bg-green-50 border-green-200';
    }
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getRiskIcon = (risk: string) => {
    const riskLower = risk.toLowerCase();
    if (riskLower.includes('error')) {
      return <XCircle className="w-5 h-5" />;
    } else if (riskLower.includes('high') || riskLower.includes('severe') || riskLower.includes('critical')) {
      return <AlertTriangle className="w-5 h-5" />;
    } else if (riskLower.includes('low') || riskLower.includes('minimal')) {
      return <CheckCircle className="w-5 h-5" />;
    }
    return <AlertCircle className="w-5 h-5" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-red-500 rounded-lg">
              <AlertTriangle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white">AI Crisis Response Dashboard</h1>
          </div>
          <p className="text-xl text-blue-200 max-w-2xl mx-auto">
            Summarises crisis reports and predicts risk levels for rapid decision support
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-lg shadow-xl p-6 mb-8 max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-semibold text-gray-800">Crisis Update Input</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="crisis_input" className="block text-sm font-medium text-gray-700 mb-2">
                Enter Crisis Update
              </label>
              <textarea
                id="crisis_input"
                value={crisisInput}
                onChange={(e) => setCrisisInput(e.target.value)}
                placeholder="Example: Heavy rains in Assam have caused floods displacing thousands. Relief efforts are ongoing."
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={4}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <XCircle className="w-5 h-5 text-red-500" />
                <span className="text-red-700">{error}</span>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleAnalyze}
                disabled={isLoading || !crisisInput.trim()}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
                {isLoading ? 'Analyzing...' : 'Analyze Crisis'}
              </button>

              <button
                onClick={handleRefresh}
                disabled={isLoading || !crisisInput.trim()}
                className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {/* AI Summary Block */}
          <div className="bg-white rounded-lg shadow-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">AI Summary</h3>
            </div>
            
            <div className="min-h-[120px] relative">
              {summaryLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="flex items-center gap-2 text-blue-600">
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Generating summary...</span>
                  </div>
                </div>
              ) : summary ? (
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <p className="text-gray-700 leading-relaxed">{summary}</p>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <span>Enter a crisis update and click "Analyze Crisis" to generate AI summary</span>
                </div>
              )}
            </div>
          </div>

          {/* Risk Level Prediction Block */}
          <div className="bg-white rounded-lg shadow-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <Shield className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">Risk Level Prediction</h3>
            </div>
            
            <div className="min-h-[120px] relative">
              {riskLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="flex items-center gap-2 text-red-600">
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Predicting risk level...</span>
                  </div>
                </div>
              ) : riskLevel ? (
                <div className={`p-4 rounded-lg border-2 ${getRiskLevelColor(riskLevel)}`}>
                  <div className="flex items-center gap-2 mb-2">
                    {getRiskIcon(riskLevel)}
                    <span className="font-semibold">Risk Assessment:</span>
                  </div>
                  <p className="leading-relaxed">{riskLevel}</p>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <span>Enter a crisis update and click "Analyze Crisis" to predict risk level</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status Footer */}
        {lastUpdated && (
          <div className="text-center mt-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">Last updated: {lastUpdated}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;