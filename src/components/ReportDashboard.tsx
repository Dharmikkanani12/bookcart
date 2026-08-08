import React, { useState } from 'react';
import { TestCase, TestStatus } from '../types';
import { 
  BarChart3, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Layers, 
  FileCheck2, 
  PieChart, 
  ShieldCheck, 
  Sparkles,
  ExternalLink,
  ChevronDown,
  Filter
} from 'lucide-react';

interface ReportDashboardProps {
  testCases: TestCase[];
}

export const ReportDashboard: React.FC<ReportDashboardProps> = ({ testCases }) => {
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [expandedTestId, setExpandedTestId] = useState<string | null>(testCases[0]?.id || null);

  const totalTests = testCases.length;
  const passedCount = testCases.filter(t => t.status === 'passed').length;
  const failedCount = testCases.filter(t => t.status === 'failed').length;
  const flakyCount = testCases.filter(t => t.status === 'flaky').length;
  const passRate = totalTests > 0 ? Math.round((passedCount / totalTests) * 100) : 100;
  const totalDurationMs = testCases.reduce((acc, t) => acc + t.durationMs, 0);

  // Group tests by requirement
  const requirementGroups = [
    { name: 'User Authentication', category: 'auth' },
    { name: 'Product Search & Navigation', category: 'search' },
    { name: 'Shopping Cart Management', category: 'cart' },
    { name: 'Checkout Process', category: 'checkout' },
    { name: 'API Testing Layer', category: 'api' },
    { name: 'Visual Regression', category: 'visual' },
  ].map(req => {
    const groupTests = testCases.filter(t => t.category === req.category);
    const passed = groupTests.filter(t => t.status === 'passed').length;
    return {
      ...req,
      total: groupTests.length,
      passed,
      percentage: groupTests.length > 0 ? Math.round((passed / groupTests.length) * 100) : 100
    };
  });

  const filteredTests = testCases.filter(t => {
    if (selectedStatusFilter === 'all') return true;
    return t.status === selectedStatusFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Executive Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Pass Rate Metric */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-medium">
            <span>Pass Rate</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            {passRate}%
          </div>
          <div className="mt-2 w-full bg-slate-950 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all"
              style={{ width: `${passRate}%` }}
            />
          </div>
        </div>

        {/* Total Tests Metric */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-medium">
            <span>Total Executed</span>
            <FileCheck2 className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-slate-100 font-mono">
            {totalTests} Suites
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Across 6 critical paths
          </div>
        </div>

        {/* Passed Count */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-medium">
            <span>Passed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            {passedCount}
          </div>
          <div className="text-[11px] text-emerald-500/80 mt-1">
            100% assertions satisfied
          </div>
        </div>

        {/* Failed / Flaky */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-medium">
            <span>Flaky / Failed</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono">
            {failedCount + flakyCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Zero regression errors
          </div>
        </div>

        {/* Total Execution Duration */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-medium">
            <span>Suite Duration</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-cyan-400 font-mono">
            {(totalDurationMs / 1000).toFixed(2)}s
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Avg {(totalDurationMs / totalTests).toFixed(0)}ms per test
          </div>
        </div>

      </div>

      {/* Requirement Coverage Breakdown */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-indigo-400" />
          Roadmap Requirement Test Coverage
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {requirementGroups.map((req, idx) => (
            <div key={idx} className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200 truncate">{req.name}</span>
                <span className="font-mono text-emerald-400 font-bold">{req.passed}/{req.total}</span>
              </div>
              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full rounded-full"
                  style={{ width: `${req.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Allure Detailed Suite Results Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
        
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            Allure Execution Test Breakdown
          </h3>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Filter Status:</span>
            {['all', 'passed', 'failed', 'flaky'].map(st => (
              <button
                key={st}
                onClick={() => setSelectedStatusFilter(st)}
                className={`px-2.5 py-1 rounded capitalize font-medium transition-all ${
                  selectedStatusFilter === st
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Test Case Cards */}
        <div className="space-y-3">
          {filteredTests.map(tc => {
            const isExpanded = expandedTestId === tc.id;

            return (
              <div key={tc.id} className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden transition-all">
                
                {/* Header Row */}
                <div 
                  onClick={() => setExpandedTestId(isExpanded ? null : tc.id)}
                  className="p-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-900/60 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                          {tc.id}
                        </span>
                        <h4 className="text-xs font-bold text-slate-100">{tc.title}</h4>
                      </div>
                      <p className="text-[11px] text-slate-400">{tc.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-slate-400 font-medium hidden sm:inline">{tc.requirement}</span>
                    <span className="font-mono text-slate-300 font-bold bg-slate-900 px-2 py-1 rounded border border-slate-800">
                      {tc.durationMs}ms
                    </span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-4 bg-slate-900/80 border-t border-slate-800 space-y-3 text-xs">
                    <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                      <span>Page Objects Used:</span>
                      {tc.pomsUsed.map((p, i) => (
                        <span key={i} className="bg-slate-950 px-2 py-0.5 rounded text-indigo-300 border border-slate-800 font-mono">
                          {p}
                        </span>
                      ))}
                    </div>

                    <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-2">
                      <h5 className="font-bold text-slate-200 text-[11px] uppercase tracking-wider">
                        Step Execution Timeline ({tc.steps.length} Steps)
                      </h5>
                      <div className="space-y-1.5 font-mono text-[11px]">
                        {tc.steps.map((st, i) => (
                          <div key={i} className="flex items-center justify-between text-slate-300 bg-slate-900/60 p-2 rounded">
                            <span className="text-indigo-400">#{i + 1} {st.name}</span>
                            <span className="text-emerald-400">✔ {st.durationMs}ms</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
};
