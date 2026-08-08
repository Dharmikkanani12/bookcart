import React, { useState } from 'react';
import { FrameworkType, PageObjectFile, TestCase } from '../types';
import { PAGE_OBJECT_FILES, TEST_CASES } from '../data/testSuites';
import { 
  FileCode, 
  Copy, 
  Check, 
  Download, 
  FolderTree, 
  Code, 
  Sparkles,
  Layers,
  Terminal,
  FileText,
  Search
} from 'lucide-react';

interface CodeExplorerProps {
  framework: FrameworkType;
  setFramework: (framework: FrameworkType) => void;
}

export const CodeExplorer: React.FC<CodeExplorerProps> = ({
  framework,
  setFramework,
}) => {
  const [selectedFileId, setSelectedFileId] = useState<string>(PAGE_OBJECT_FILES[0].id);
  const [copied, setCopied] = useState<boolean>(false);
  const [searchFilter, setSearchFilter] = useState<string>('');

  // Selected File details
  const selectedPomFile = PAGE_OBJECT_FILES.find(f => f.id === selectedFileId);
  const selectedTestCase = TEST_CASES.find(tc => tc.id === selectedFileId);

  // Active Code Content
  const activeCodeContent = selectedPomFile
    ? (framework === 'playwright' ? selectedPomFile.playwrightContent : selectedPomFile.cypressContent)
    : selectedTestCase
    ? (framework === 'playwright' ? selectedTestCase.playwrightCode : selectedTestCase.cypressCode)
    : '// Select a file to inspect production test code';

  const activeFileName = selectedPomFile ? selectedPomFile.name : selectedTestCase ? `${selectedTestCase.id}.spec.ts` : 'code.ts';
  const activeFilePath = selectedPomFile ? selectedPomFile.path : selectedTestCase ? `src/specs/${selectedTestCase.id}.spec.ts` : '';

  const handleCopyCode = () => {
    navigator.clipboard.writeText(activeCodeContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    const element = document.createElement("a");
    const file = new Blob([activeCodeContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = activeFileName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Banner & Framework Selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div>
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <FileCode className="w-4 h-4 text-indigo-400" />
            Page Object Model (POM) & Spec File Explorer
          </h2>
          <p className="text-xs text-slate-400">
            Clean, modular TypeScript test architecture for BookCart (https://bookcart.azurewebsites.net)
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Framework Toggle */}
          <div className="bg-slate-950 p-1 rounded-lg border border-slate-800 flex items-center gap-1">
            <button
              onClick={() => setFramework('playwright')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                framework === 'playwright'
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Playwright (TS)
            </button>
            <button
              onClick={() => setFramework('cypress')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                framework === 'cypress'
                  ? 'bg-cyan-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Cypress (TS)
            </button>
          </div>

          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md shadow-indigo-600/30"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied Code!' : 'Copy Code'}
          </button>

          <button
            onClick={handleDownloadFile}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Download
          </button>
        </div>
      </div>

      {/* Main Grid: File Tree Sidebar & Code Editor View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Sidebar: File Tree Navigation */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4 max-h-[760px] overflow-y-auto">
          
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              placeholder="Search POMs or test specs..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Section 1: Page Object Models */}
          <div className="space-y-2">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <FolderTree className="w-3.5 h-3.5 text-indigo-400" />
              Page Object Models (src/pages/)
            </h3>

            <div className="space-y-1">
              {PAGE_OBJECT_FILES.filter(f => f.type === 'pom' && f.name.toLowerCase().includes(searchFilter.toLowerCase())).map(f => {
                const isSelected = f.id === selectedFileId;
                return (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFileId(f.id)}
                    className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-indigo-950/60 border-indigo-500/60 text-indigo-200 font-bold shadow-md'
                        : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <FileCode className={`w-3.5 h-3.5 ${isSelected ? 'text-indigo-400' : 'text-slate-500'}`} />
                      <span>{f.name}</span>
                    </div>
                    <span className="text-[10px] bg-slate-900 px-1.5 py-0.5 rounded text-slate-500 font-mono">
                      POM
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Test Specs (E2E Test Suites) */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              Test Specs (src/specs/)
            </h3>

            <div className="space-y-1">
              {TEST_CASES.filter(tc => tc.title.toLowerCase().includes(searchFilter.toLowerCase()) || tc.id.toLowerCase().includes(searchFilter.toLowerCase())).map(tc => {
                const isSelected = tc.id === selectedFileId;
                return (
                  <button
                    key={tc.id}
                    onClick={() => setSelectedFileId(tc.id)}
                    className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-indigo-950/60 border-indigo-500/60 text-indigo-200 font-bold shadow-md'
                        : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Code className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`} />
                      <span className="truncate">{tc.id}.spec.ts</span>
                    </div>
                    <span className="text-[10px] bg-indigo-500/10 text-indigo-300 px-1.5 py-0.5 rounded font-mono">
                      {tc.category}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Config Files */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              Configurations
            </h3>

            {PAGE_OBJECT_FILES.filter(f => f.type === 'config').map(f => {
              const isSelected = f.id === selectedFileId;
              return (
                <button
                  key={f.id}
                  onClick={() => setSelectedFileId(f.id)}
                  className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-indigo-950/60 border-indigo-500/60 text-indigo-200 font-bold shadow-md'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{f.name}</span>
                  </div>
                  <span className="text-[10px] bg-slate-900 px-1.5 py-0.5 rounded text-slate-500 font-mono">
                    Config
                  </span>
                </button>
              );
            })}
          </div>

        </div>

        {/* Right Code Content View */}
        <div className="lg:col-span-8 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col">
          
          {/* File Header Tab */}
          <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono text-xs text-slate-300">
              <FileCode className="w-4 h-4 text-indigo-400" />
              <span className="font-bold text-white">{activeFilePath || activeFileName}</span>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
              <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                Language: TypeScript
              </span>
              <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 capitalize">
                Framework: {framework}
              </span>
            </div>
          </div>

          {/* Description Callout */}
          <div className="bg-slate-900/60 px-4 py-2 border-b border-slate-800/80 text-xs text-slate-400 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            <span>
              {selectedPomFile?.description || selectedTestCase?.description || 'Production test code file'}
            </span>
          </div>

          {/* Code Viewer Panel */}
          <div className="p-4 overflow-x-auto bg-slate-950 font-mono text-xs text-slate-200 leading-relaxed custom-scrollbar">
            <pre className="text-slate-300">
              <code>{activeCodeContent}</code>
            </pre>
          </div>

        </div>

      </div>
    </div>
  );
};
