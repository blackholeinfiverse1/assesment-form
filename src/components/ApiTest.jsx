import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { grokService } from '../lib/grokService';
import { CheckCircle, XCircle, AlertCircle, Play } from 'lucide-react';

export default function ApiTest() {
  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState(null);

  const runApiTest = async () => {
    setTesting(true);
    setTestResults(null);
    
    const results = {
      apiKeyCheck: null,
      connectivity: null,
      questionGeneration: null,
      errors: []
    };

    try {
      // Test 1: API Key validation
      console.log('🔧 Step 1: Validating API key...');
      try {
        await grokService.validateApiSetup();
        results.apiKeyCheck = { success: true, message: 'API key is valid and connectivity works' };
      } catch (error) {
        results.apiKeyCheck = { success: false, message: error.message };
        results.errors.push(`API Key/Connectivity: ${error.message}`);
      }

      // Test 2: Simple question generation
      if (results.apiKeyCheck?.success) {
        console.log('🔧 Step 2: Testing question generation...');
        try {
          const testQuestions = await grokService.generateQuestions('Coding', 'medium', 1);
          if (testQuestions && testQuestions.length > 0) {
            results.questionGeneration = { 
              success: true, 
              message: `Successfully generated ${testQuestions.length} question(s)`,
              sample: testQuestions[0]?.question_text?.substring(0, 100) + '...'
            };
          } else {
            results.questionGeneration = { success: false, message: 'No questions generated' };
            results.errors.push('Question generation returned empty result');
          }
        } catch (error) {
          results.questionGeneration = { success: false, message: error.message };
          results.errors.push(`Question Generation: ${error.message}`);
        }
      }

      setTestResults(results);
      
      if (results.errors.length === 0) {
        toast.success('All API tests passed! 🎉');
      } else {
        toast.error(`${results.errors.length} test(s) failed`);
      }
      
    } catch (error) {
      console.error('Test suite failed:', error);
      toast.error('Test suite failed: ' + error.message);
      setTestResults({
        apiKeyCheck: { success: false, message: 'Test suite failed' },
        connectivity: null,
        questionGeneration: null,
        errors: [error.message]
      });
    } finally {
      setTesting(false);
    }
  };

  const TestResult = ({ title, result, icon: Icon }) => {
    if (!result) return null;
    
    return (
      <div className={`p-4 rounded-lg border ${
        result.success 
          ? 'border-green-500/30 bg-green-500/10' 
          : 'border-red-500/30 bg-red-500/10'
      }`}>
        <div className="flex items-center gap-3 mb-2">
          <Icon className={`h-5 w-5 ${result.success ? 'text-green-400' : 'text-red-400'}`} />
          <span className="font-medium text-white">{title}</span>
        </div>
        <div className={`text-sm ${result.success ? 'text-green-300' : 'text-red-300'}`}>
          {result.message}
        </div>
        {result.sample && (
          <div className="mt-2 text-xs text-white/60 bg-white/5 p-2 rounded">
            Sample: {result.sample}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Groq API Test Suite</h2>
        <p className="text-white/70">
          Test the Groq API integration to diagnose any issues with question generation
        </p>
        
        <button
          onClick={runApiTest}
          disabled={testing}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
        >
          <Play className="h-4 w-4" />
          {testing ? 'Running Tests...' : 'Run API Tests'}
        </button>
      </div>

      {testing && (
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <div className="text-white/70">Testing API connectivity and functionality...</div>
        </div>
      )}

      {testResults && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Test Results</h3>
          
          <TestResult
            title="API Key & Connectivity"
            result={testResults.apiKeyCheck}
            icon={testResults.apiKeyCheck?.success ? CheckCircle : XCircle}
          />
          
          <TestResult
            title="Question Generation"
            result={testResults.questionGeneration}
            icon={testResults.questionGeneration?.success ? CheckCircle : XCircle}
          />
          
          {testResults.errors.length > 0 && (
            <div className="p-4 rounded-lg border border-orange-500/30 bg-orange-500/10">
              <div className="flex items-center gap-3 mb-2">
                <AlertCircle className="h-5 w-5 text-orange-400" />
                <span className="font-medium text-white">Issues Found</span>
              </div>
              <ul className="text-sm text-orange-300 space-y-1">
                {testResults.errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="p-4 rounded-lg bg-white/5 border border-white/10">
            <div className="text-sm font-medium text-white/90 mb-2">Debugging Tips:</div>
            <ul className="text-xs text-white/70 space-y-1">
              <li>• Check browser console for detailed API request/response logs</li>
              <li>• Verify your Groq API key is valid and has sufficient credits</li>
              <li>• Ensure you're using a supported model (llama3-8b-8192)</li>
              <li>• Check if your API key has the correct permissions</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
