import React, { useState } from 'react';
import { FrameworkType, TestCase, TestStatus, TestStep } from './types';
import { TEST_CASES } from './data/testSuites';
import { Header } from './components/Header';
import { TestRunner } from './components/TestRunner';
import { CodeExplorer } from './components/CodeExplorer';
import { ReportDashboard } from './components/ReportDashboard';
import { SelectorPlayground } from './components/SelectorPlayground';
import { VisualRegression } from './components/VisualRegression';
import { AITestGenerator } from './components/AITestGenerator';
import { CiCdConfig } from './components/CiCdConfig';

export default function App() {
  const [activeTab, setActiveTab] = useState<'runner' | 'code' | 'reports' | 'selectors' | 'visual' | 'ai' | 'cicd'>('runner');
  const [framework, setFramework] = useState<FrameworkType>('playwright');
  const [testCasesState, setTestCasesState] = useState<TestCase[]>(TEST_CASES);
  const [isRunningAll, setIsRunningAll] = useState<boolean>(false);

  // Update status for test cases when executed
  const handleUpdateTestCaseStatus = (id: string, status: TestStatus, duration: number, steps: TestStep[]) => {
    setTestCasesState(prev => prev.map(tc => {
      if (tc.id === id) {
        return {
          ...tc,
          status,
          durationMs: duration,
          steps: steps || tc.steps,
          lastRun: new Date().toLocaleTimeString()
        };
      }
      return tc;
    }));
  };

  // Run full test suite loop
  const handleRunAllTests = () => {
    setIsRunningAll(true);
    setActiveTab('runner');

    let idx = 0;
    const interval = setInterval(() => {
      if (idx >= testCasesState.length) {
        clearInterval(interval);
        setIsRunningAll(false);
        return;
      }

      const tc = testCasesState[idx];
      handleUpdateTestCaseStatus(tc.id, 'passed', tc.durationMs, tc.steps);
      idx++;
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-600 selection:text-white flex flex-col">
      {/* Header & Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        framework={framework}
        setFramework={setFramework}
        onRunAllTests={handleRunAllTests}
        isRunningAll={isRunningAll}
      />

      {/* Main Tab Content Stage */}
      <main className="flex-1 pb-12">
        {activeTab === 'runner' && (
          <TestRunner
            testCases={testCasesState}
            framework={framework}
            onUpdateTestCaseStatus={handleUpdateTestCaseStatus}
          />
        )}

        {activeTab === 'code' && (
          <CodeExplorer
            framework={framework}
            setFramework={setFramework}
          />
        )}

        {activeTab === 'reports' && (
          <ReportDashboard
            testCases={testCasesState}
          />
        )}

        {activeTab === 'selectors' && (
          <SelectorPlayground />
        )}

        {activeTab === 'visual' && (
          <VisualRegression />
        )}

        {activeTab === 'ai' && (
          <AITestGenerator
            framework={framework}
          />
        )}

        {activeTab === 'cicd' && (
          <CiCdConfig />
        )}
      </main>

      {/* Persistent Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 px-8 flex justify-between items-center text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
        <span>&copy; BookCart E2E Test Suite Studio &bull; Page Object Model Pattern</span>
        <div className="flex gap-4">
          <a href="https://bookcart.azurewebsites.net/" target="_blank" rel="noreferrer" className="text-blue-600 font-bold hover:underline">
            bookcart.azurewebsites.net
          </a>
          <span>roadmap.sh Project</span>
        </div>
      </footer>
    </div>
  );
}
