import React, { useState, useEffect } from 'react';
import { FrameworkType, TargetStatus } from '../types';
import { 
  Play, 
  Code2, 
  BarChart3, 
  Search, 
  Sparkles, 
  GitBranch, 
  Eye, 
  ExternalLink, 
  CheckCircle2, 
  XCircle, 
  RefreshCw,
  Terminal
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'runner' | 'code' | 'reports' | 'selectors' | 'visual' | 'ai' | 'cicd';
  setActiveTab: (tab: 'runner' | 'code' | 'reports' | 'selectors' | 'visual' | 'ai' | 'cicd') => void;
  framework: FrameworkType;
  setFramework: (framework: FrameworkType) => void;
  onRunAllTests: () => void;
  isRunningAll: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  framework,
  setFramework,
  onRunAllTests,
  isRunningAll,
}) => {
  const [targetStatus, setTargetStatus] = useState<TargetStatus>({
    online: true,
    status: 200,
    latencyMs: 180,
    bookCount: 45,
    targetUrl: 'https://bookcart.azurewebsites.net/'
  });
  const [isCheckingPing, setIsCheckingPing] = useState(false);

  const checkBookCartStatus = async () => {
    setIsCheckingPing(true);
    try {
      const res = await fetch('/api/bookcart-status');
      if (res.ok) {
        const data = await res.json();
        setTargetStatus(data);
      }
    } catch {
      // Keep optimistic status
    } finally {
      setIsCheckingPing(false);
    }
  };

  useEffect(() => {
    checkBookCartStatus();
  }, []);

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50">
      {/* Top Banner with App Title and Live Target Status */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-indigo-500 to-cyan-400 p-2.5 rounded-xl shadow-lg shadow-indigo-500/20">
            <Terminal className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-slate-100">
                BookCart E2E Test Suite Studio
              </h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium">
                roadmap.sh QA
              </span>
            </div>
            <p className="text-xs text-slate-400">
              End-to-End Automation Framework & Live Execution Hub
            </p>
          </div>
        </div>

        {/* Target Site Indicator & Framework Selector */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Target App Live Ping */}
          <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/80 text-xs">
            <span className="text-slate-400 font-mono hidden sm:inline">Target:</span>
            <a 
              href="https://bookcart.azurewebsites.net/" 
              target="_blank" 
              rel="noreferrer"
              className="text-cyan-400 hover:text-cyan-300 font-mono font-medium flex items-center gap-1 group"
            >
              bookcart.azurewebsites.net
              <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </a>

            <div className="h-3 w-px bg-slate-700 mx-1" />

            {targetStatus.online ? (
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Online ({targetStatus.latencyMs}ms)
              </span>
            ) : (
              <span className="flex items-center gap-1 text-rose-400 font-medium">
                <XCircle className="w-3.5 h-3.5" />
                Unreachable
              </span>
            )}

            <button
              onClick={checkBookCartStatus}
              disabled={isCheckingPing}
              title="Refresh status ping"
              className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors"
            >
              <RefreshCw className={`w-3 h-3 ${isCheckingPing ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
          </div>

          {/* Framework Switcher Toggle */}
          <div className="bg-slate-800 p-0.5 rounded-lg border border-slate-700 flex items-center">
            <button
              onClick={() => setFramework('playwright')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                framework === 'playwright'
                  ? 'bg-emerald-500 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Playwright (TS)
            </button>
            <button
              onClick={() => setFramework('cypress')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                framework === 'cypress'
                  ? 'bg-cyan-500 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Cypress (TS)
            </button>
          </div>

          {/* Quick Run All Button */}
          <button
            onClick={onRunAllTests}
            disabled={isRunningAll}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold shadow-md shadow-emerald-500/20 transition-all disabled:opacity-50"
          >
            {isRunningAll ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Running Suite...
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                Run Full Suite
              </>
            )}
          </button>
        </div>
      </div>

      {/* Primary Tab Navigation Bar */}
      <div className="bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth pt-2">
          {[
            { id: 'runner', label: 'Live Test Runner', icon: Play },
            { id: 'code', label: 'POM & Specs Code', icon: Code2 },
            { id: 'reports', label: 'Allure Reports', icon: BarChart3 },
            { id: 'selectors', label: 'Selector Strategy', icon: Search },
            { id: 'visual', label: 'Visual Regression', icon: Eye },
            { id: 'ai', label: 'AI Test Generator', icon: Sparkles },
            { id: 'cicd', label: 'CI/CD & Configs', icon: GitBranch },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-white text-blue-600 shadow-sm border border-b-0 border-slate-200 font-extrabold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${tab.id === 'ai' ? 'text-amber-500' : ''}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
