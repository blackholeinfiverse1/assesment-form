import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { grokService } from '../lib/grokService';
import { scoringService } from '../lib/scoringService';
import { Play, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export default function EvaluationTest() {
  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState(null);

  const sampleQuestion = {
    id: 'test-q1',
    category: 'Coding',
    difficulty: 'medium',
    question_text: 'What is the time complexity of binary search in a sorted array?',
    options: ['A) O(n)', 'B) O(log n)', 'C) O(n log n)', 'D) O(1)'],
    correct_answer: 'B) O(log n)',
    explanation: 'Binary search divides the search space in half with each comparison.'
  };

  const testCases = [
    {
      name: 'Correct Answer with Good Explanation',
      userAnswer: 'B) O(log n)',
      userExplanation: 'Binary search works by repeatedly dividing the search space in half, which gives us logarithmic time complexity.'
    },
    {
      name: 'Correct Answer with Poor Explanation',
      userAnswer: 'B) O(log n)',
      userExplanation: 'I think it is log n.'
    },
    {
      name: 'Wrong Answer with Good Explanation',
      userAnswer: 'A) O(n)',
      userExplanation: 'I believe we need to check each element in the worst case, so it should be linear time.'
    },
    {
      name: 'Wrong Answer with No Explanation',
      userAnswer: 'D) O(1)',
      userExplanation: ''
    }
  ];

  const runEvaluationTest = async () => {
    setTesting(true);
    setTestResults(null);
    
    const results = {
      grokApiTest: null,
      scoringServiceTest: null,
      testCaseResults: [],
      errors: []
    };

    try {
      toast.loading('Testing evaluation pipeline...');

      // Test 1: Direct Grok API evaluation
      console.log('\n🧪 === Testing Direct Grok API Evaluation ===');
      try {
        const directEvaluation = await grokService.evaluateResponse(
          sampleQuestion,
          'B) O(log n)',
          'Binary search divides the array in half each time.'
        );
        
        results.grokApiTest = {
          success: true,
          data: directEvaluation,
          message: 'Grok API evaluation successful'
        };
        console.log('✅ Direct Grok API test passed');
      } catch (error) {
        results.grokApiTest = {
          success: false,
          error: error.message,
          message: 'Grok API evaluation failed'
        };
        results.errors.push(`Grok API: ${error.message}`);
        console.error('❌ Direct Grok API test failed:', error);
      }

      // Test 2: Scoring Service evaluation
      console.log('\n🧪 === Testing Scoring Service ===');
      try {
        const scoringEvaluation = await scoringService.evaluateResponse(
          sampleQuestion,
          'B) O(log n)',
          'Binary search divides the array in half each time.'
        );
        
        results.scoringServiceTest = {
          success: true,
          data: scoringEvaluation,
          message: 'Scoring service evaluation successful'
        };
        console.log('✅ Scoring service test passed');
      } catch (error) {
        results.scoringServiceTest = {
          success: false,
          error: error.message,
          message: 'Scoring service evaluation failed'
        };
        results.errors.push(`Scoring Service: ${error.message}`);
        console.error('❌ Scoring service test failed:', error);
      }

      // Test 3: Multiple test cases
      console.log('\n🧪 === Testing Multiple Scenarios ===');
      for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];
        console.log(`\n📝 Testing: ${testCase.name}`);
        
        try {
          const result = await scoringService.evaluateResponse(
            sampleQuestion,
            testCase.userAnswer,
            testCase.userExplanation
          );
          
          results.testCaseResults.push({
            name: testCase.name,
            success: true,
            input: testCase,
            output: result,
            message: `Scores: ${result.accuracy_score}/${result.explanation_score}/${result.reasoning_score}`
          });
          
          console.log(`✅ ${testCase.name} completed`);
          
          // Add delay between test cases
          await new Promise(resolve => setTimeout(resolve, 2000));
          
        } catch (error) {
          results.testCaseResults.push({
            name: testCase.name,
            success: false,
            input: testCase,
            error: error.message,
            message: 'Evaluation failed'
          });
          
          results.errors.push(`${testCase.name}: ${error.message}`);
          console.error(`❌ ${testCase.name} failed:`, error);
        }
      }

      setTestResults(results);
      
      if (results.errors.length === 0) {
        toast.success('All evaluation tests passed! 🎉');
      } else {
        toast.error(`${results.errors.length} test(s) failed`);
      }
      
    } catch (error) {
      console.error('Test suite failed:', error);
      toast.error('Test suite failed: ' + error.message);
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
        <div className={`text-sm ${result.success ? 'text-green-300' : 'text-red-300'} mb-2`}>
          {result.message}
        </div>
        {result.data && (
          <div className="text-xs text-white/60 bg-white/5 p-2 rounded">
            <pre>{JSON.stringify(result.data, null, 2)}</pre>
          </div>
        )}
        {result.error && (
          <div className="text-xs text-red-300 bg-red-500/10 p-2 rounded">
            Error: {result.error}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Evaluation Pipeline Test</h2>
        <p className="text-white/70">
          Test the complete evaluation pipeline from Grok API to scoring service
        </p>
        
        <button
          onClick={runEvaluationTest}
          disabled={testing}
          className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
        >
          <Play className="h-4 w-4" />
          {testing ? 'Running Tests...' : 'Test Evaluation Pipeline'}
        </button>
      </div>

      {testing && (
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
          <div className="text-white/70">Testing evaluation pipeline...</div>
          <div className="text-sm text-white/60">Check console for detailed logs</div>
        </div>
      )}

      {testResults && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-white">Test Results</h3>
          
          <div className="grid gap-4 md:grid-cols-2">
            <TestResult
              title="Grok API Direct Test"
              result={testResults.grokApiTest}
              icon={testResults.grokApiTest?.success ? CheckCircle : XCircle}
            />
            
            <TestResult
              title="Scoring Service Test"
              result={testResults.scoringServiceTest}
              icon={testResults.scoringServiceTest?.success ? CheckCircle : XCircle}
            />
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium text-white">Test Case Results</h4>
            {testResults.testCaseResults.map((result, index) => (
              <TestResult
                key={index}
                title={result.name}
                result={result}
                icon={result.success ? CheckCircle : XCircle}
              />
            ))}
          </div>
          
          {testResults.errors.length > 0 && (
            <div className="p-4 rounded-lg border border-orange-500/30 bg-orange-500/10">
              <div className="flex items-center gap-3 mb-2">
                <AlertTriangle className="h-5 w-5 text-orange-400" />
                <span className="font-medium text-white">Issues Found</span>
              </div>
              <ul className="text-sm text-orange-300 space-y-1">
                {testResults.errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
