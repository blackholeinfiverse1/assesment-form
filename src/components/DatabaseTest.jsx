import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';
import { Play, CheckCircle, XCircle, Database, Users, FileText } from 'lucide-react';

export default function DatabaseTest() {
  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState(null);

  const runDatabaseTest = async () => {
    setTesting(true);
    setTestResults(null);
    
    const results = {
      connection: null,
      tables: {
        students: null,
        assignment_attempts: null,
        assignment_responses: null
      },
      permissions: null,
      sampleData: null,
      errors: []
    };

    try {
      toast.loading('Testing database connection and structure...');

      // Test 1: Basic connection
      console.log('🧪 Testing database connection...');
      try {
        const { data, error } = await supabase.from('students').select('count', { count: 'exact', head: true });
        if (error) throw error;
        
        results.connection = {
          success: true,
          message: 'Database connection successful'
        };
        console.log('✅ Database connection test passed');
      } catch (error) {
        results.connection = {
          success: false,
          error: error.message,
          message: 'Database connection failed'
        };
        results.errors.push(`Connection: ${error.message}`);
        console.error('❌ Database connection test failed:', error);
      }

      // Test 2: Table structure tests
      console.log('🧪 Testing table structures...');
      
      // Test students table
      try {
        const { data, error } = await supabase
          .from('students')
          .select('id, user_id, name, email, student_id')
          .limit(1);
        
        if (error) throw error;
        
        results.tables.students = {
          success: true,
          message: `Students table accessible (${data?.length || 0} sample records)`,
          sampleData: data?.[0] || null
        };
        console.log('✅ Students table test passed');
      } catch (error) {
        results.tables.students = {
          success: false,
          error: error.message,
          message: 'Students table test failed'
        };
        results.errors.push(`Students table: ${error.message}`);
        console.error('❌ Students table test failed:', error);
      }

      // Test assignment_attempts table
      try {
        const { data, error } = await supabase
          .from('assignment_attempts')
          .select('id, user_id, student_id, total_score, percentage, grade')
          .limit(1);
        
        if (error) throw error;
        
        results.tables.assignment_attempts = {
          success: true,
          message: `Assignment attempts table accessible (${data?.length || 0} sample records)`,
          sampleData: data?.[0] || null
        };
        console.log('✅ Assignment attempts table test passed');
      } catch (error) {
        results.tables.assignment_attempts = {
          success: false,
          error: error.message,
          message: 'Assignment attempts table test failed'
        };
        results.errors.push(`Assignment attempts: ${error.message}`);
        console.error('❌ Assignment attempts table test failed:', error);
      }

      // Test assignment_responses table
      try {
        const { data, error } = await supabase
          .from('assignment_responses')
          .select('id, attempt_id, question_id, is_correct, total_score')
          .limit(1);
        
        if (error) throw error;
        
        results.tables.assignment_responses = {
          success: true,
          message: `Assignment responses table accessible (${data?.length || 0} sample records)`,
          sampleData: data?.[0] || null
        };
        console.log('✅ Assignment responses table test passed');
      } catch (error) {
        results.tables.assignment_responses = {
          success: false,
          error: error.message,
          message: 'Assignment responses table test failed'
        };
        results.errors.push(`Assignment responses: ${error.message}`);
        console.error('❌ Assignment responses table test failed:', error);
      }

      // Test 3: Sample data query
      console.log('🧪 Testing data relationships...');
      try {
        const { data, error } = await supabase
          .from('assignment_attempts')
          .select(`
            id,
            user_id,
            total_score,
            percentage,
            students!assignment_attempts_student_id_fkey (
              name,
              email
            )
          `)
          .limit(3);
        
        if (error) throw error;
        
        results.sampleData = {
          success: true,
          message: `Found ${data?.length || 0} assignment attempts with student relationships`,
          data: data || []
        };
        console.log('✅ Data relationships test passed');
      } catch (error) {
        results.sampleData = {
          success: false,
          error: error.message,
          message: 'Data relationships test failed'
        };
        results.errors.push(`Data relationships: ${error.message}`);
        console.error('❌ Data relationships test failed:', error);
      }

      setTestResults(results);
      
      if (results.errors.length === 0) {
        toast.success('All database tests passed! 🎉');
      } else {
        toast.error(`${results.errors.length} test(s) failed`);
      }
      
    } catch (error) {
      console.error('Database test suite failed:', error);
      toast.error('Database test suite failed: ' + error.message);
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
        {result.sampleData && (
          <div className="text-xs text-white/60 bg-white/5 p-2 rounded">
            Sample: {JSON.stringify(result.sampleData, null, 2)}
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
        <h2 className="text-2xl font-bold text-white">Database Structure Test</h2>
        <p className="text-white/70">
          Test the Supabase database connection, table structure, and data relationships
        </p>
        
        <button
          onClick={runDatabaseTest}
          disabled={testing}
          className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
        >
          <Play className="h-4 w-4" />
          {testing ? 'Running Tests...' : 'Test Database'}
        </button>
      </div>

      {testing && (
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
          <div className="text-white/70">Testing database structure...</div>
        </div>
      )}

      {testResults && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-white">Test Results</h3>
          
          {/* Connection Test */}
          <TestResult
            title="Database Connection"
            result={testResults.connection}
            icon={testResults.connection?.success ? CheckCircle : XCircle}
          />
          
          {/* Table Tests */}
          <div className="space-y-3">
            <h4 className="font-medium text-white">Table Structure Tests</h4>
            <div className="grid gap-3 md:grid-cols-3">
              <TestResult
                title="Students Table"
                result={testResults.tables.students}
                icon={testResults.tables.students?.success ? CheckCircle : XCircle}
              />
              <TestResult
                title="Assignment Attempts"
                result={testResults.tables.assignment_attempts}
                icon={testResults.tables.assignment_attempts?.success ? CheckCircle : XCircle}
              />
              <TestResult
                title="Assignment Responses"
                result={testResults.tables.assignment_responses}
                icon={testResults.tables.assignment_responses?.success ? CheckCircle : XCircle}
              />
            </div>
          </div>
          
          {/* Data Relationships Test */}
          <TestResult
            title="Data Relationships"
            result={testResults.sampleData}
            icon={testResults.sampleData?.success ? CheckCircle : XCircle}
          />
          
          {testResults.errors.length > 0 && (
            <div className="p-4 rounded-lg border border-orange-500/30 bg-orange-500/10">
              <div className="flex items-center gap-3 mb-2">
                <XCircle className="h-5 w-5 text-orange-400" />
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
            <div className="text-sm font-medium text-white/90 mb-2">Database Setup Instructions:</div>
            <ul className="text-xs text-white/70 space-y-1">
              <li>• Run the SQL script from `src/sql/create_assignment_tables.sql` in Supabase</li>
              <li>• Ensure RLS (Row Level Security) policies are properly configured</li>
              <li>• Verify that the `students` table exists and is accessible</li>
              <li>• Check that foreign key relationships are properly set up</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
