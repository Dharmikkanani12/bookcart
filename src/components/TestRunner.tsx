import React, { useState, useEffect, useRef } from 'react';
import { TestCase, TestStep, FrameworkType, BrowserType, TestStatus } from '../types';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Globe, 
  Terminal, 
  Network, 
  Maximize2, 
  Filter, 
  Search, 
  Check, 
  ChevronRight,
  ShieldCheck,
  Zap,
  Layers,
  ShoppingBag,
  UserCheck,
  ShoppingCart,
  CreditCard,
  FileCheck
} from 'lucide-react';
import { BOOKCART_BOOKS } from '../data/bookcartData';

interface TestRunnerProps {
  testCases: TestCase[];
  framework: FrameworkType;
  onUpdateTestCaseStatus: (id: string, status: TestStatus, duration: number, steps: TestStep[]) => void;
}

export const TestRunner: React.FC<TestRunnerProps> = ({
  testCases,
  framework,
  onUpdateTestCaseStatus,
}) => {
  const [selectedTestCaseId, setSelectedTestCaseId] = useState<string>(testCases[0]?.id || 'TC-AUTH-02');
  const [browser, setBrowser] = useState<BrowserType>('chromium');
  const [executionSpeed, setExecutionSpeed] = useState<number>(1);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeInspectorTab, setActiveInspectorTab] = useState<'steps' | 'network' | 'console' | 'dom'>('steps');

  // Interactive Browser Simulated States
  const [simulatedUrl, setSimulatedUrl] = useState<string>('https://bookcart.azurewebsites.net/login');
  const [simulatedState, setSimulatedState] = useState<{
    view: 'login' | 'catalog' | 'cart' | 'checkout' | 'orders';
    usernameInput: string;
    isLoggedIn: boolean;
    searchTerm: string;
    cartCount: number;
    cartItems: { title: string; price: number; qty: number }[];
    shippingName: string;
    orderSuccessId?: string;
  }>({
    view: 'login',
    usernameInput: '',
    isLoggedIn: false,
    searchTerm: '',
    cartCount: 0,
    cartItems: [],
    shippingName: ''
  });

  const activeTestCase = testCases.find(t => t.id === selectedTestCaseId) || testCases[0];

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Filter test cases
  const filteredTestCases = testCases.filter(tc => {
    const matchesSearch = tc.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          tc.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tc.requirement.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || tc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Handle single test execution loop
  const runTest = (tc: TestCase) => {
    setIsRunning(true);
    setCurrentStepIndex(0);

    // Initial state setup depending on test category
    if (tc.category === 'auth') {
      setSimulatedUrl('https://bookcart.azurewebsites.net/login');
      setSimulatedState({
        view: 'login',
        usernameInput: '',
        isLoggedIn: false,
        searchTerm: '',
        cartCount: 0,
        cartItems: [],
        shippingName: ''
      });
    } else if (tc.category === 'search') {
      setSimulatedUrl('https://bookcart.azurewebsites.net/');
      setSimulatedState({
        view: 'catalog',
        usernameInput: 'qatester_e2e',
        isLoggedIn: true,
        searchTerm: '',
        cartCount: 0,
        cartItems: [],
        shippingName: ''
      });
    } else if (tc.category === 'cart') {
      setSimulatedUrl('https://bookcart.azurewebsites.net/shopping-cart');
      setSimulatedState({
        view: 'cart',
        usernameInput: 'qatester_e2e',
        isLoggedIn: true,
        searchTerm: '',
        cartCount: 1,
        cartItems: [{ title: 'Roomies', price: 499, qty: 1 }],
        shippingName: ''
      });
    } else if (tc.category === 'checkout') {
      setSimulatedUrl('https://bookcart.azurewebsites.net/checkout');
      setSimulatedState({
        view: 'checkout',
        usernameInput: 'qatester_e2e',
        isLoggedIn: true,
        searchTerm: '',
        cartCount: 1,
        cartItems: [{ title: 'Roomies', price: 499, qty: 1 }],
        shippingName: 'Alex Automation'
      });
    }
  };

  useEffect(() => {
    if (!isRunning || currentStepIndex < 0) return;

    const steps = activeTestCase.steps;
    if (currentStepIndex >= steps.length) {
      setIsRunning(false);
      onUpdateTestCaseStatus(activeTestCase.id, 'passed', activeTestCase.durationMs, steps);
      return;
    }

    // Step state changes simulation
    const step = steps[currentStepIndex];
    const delay = (step.durationMs / executionSpeed);

    timerRef.current = setTimeout(() => {
      // Update interactive browser UI according to step
      if (activeTestCase.category === 'auth') {
        if (currentStepIndex === 1) {
          setSimulatedState(prev => ({ ...prev, usernameInput: 'qatester_e2e' }));
        } else if (currentStepIndex >= 2) {
          setSimulatedState(prev => ({ ...prev, isLoggedIn: true, view: 'catalog' }));
          setSimulatedUrl('https://bookcart.azurewebsites.net/');
        }
      } else if (activeTestCase.category === 'search') {
        if (step.name.includes('Roomies') || step.action.includes('Roomies')) {
          setSimulatedState(prev => ({ ...prev, searchTerm: 'Roomies' }));
        }
      } else if (activeTestCase.category === 'cart') {
        if (step.name.includes('Add to Cart')) {
          setSimulatedState(prev => ({
            ...prev,
            cartCount: 1,
            cartItems: [{ title: 'Roomies', price: 499, qty: 1 }]
          }));
        } else if (step.name.includes('Quantity') || step.action.includes('increment')) {
          setSimulatedState(prev => ({
            ...prev,
            cartCount: 2,
            cartItems: [{ title: 'Roomies', price: 499, qty: 2 }]
          }));
        } else if (step.name.includes('Remove')) {
          setSimulatedState(prev => ({
            ...prev,
            cartCount: 0,
            cartItems: []
          }));
        }
      } else if (activeTestCase.category === 'checkout') {
        if (step.name.includes('Proceed')) {
          setSimulatedUrl('https://bookcart.azurewebsites.net/checkout');
          setSimulatedState(prev => ({ ...prev, view: 'checkout' }));
        } else if (step.name.includes('Submit Order') || step.name.includes('Confirm')) {
          setSimulatedUrl('https://bookcart.azurewebsites.net/myorders');
          setSimulatedState(prev => ({ ...prev, view: 'orders', orderSuccessId: 'ORD-2026-88912' }));
        }
      }

      setCurrentStepIndex(prev => prev + 1);
    }, Math.max(300, delay));

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isRunning, currentStepIndex, selectedTestCaseId, executionSpeed]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Runner Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-800 p-1 rounded-lg border border-slate-700">
            {(['chromium', 'firefox', 'webkit'] as BrowserType[]).map(b => (
              <button
                key={b}
                onClick={() => setBrowser(b)}
                className={`px-3 py-1 rounded text-xs font-semibold capitalize transition-all ${
                  browser === b 
                    ? 'bg-indigo-600 text-white shadow' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {b}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700 text-xs text-slate-300">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>Speed:</span>
            {[1, 2, 5].map(spd => (
              <button
                key={spd}
                onClick={() => setExecutionSpeed(spd)}
                className={`px-1.5 py-0.5 rounded text-xs font-mono font-bold ${
                  executionSpeed === spd ? 'bg-indigo-500/30 text-indigo-300' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => runTest(activeTestCase)}
            disabled={isRunning}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
          >
            <Play className="w-4 h-4 fill-current" />
            Execute Test ({activeTestCase.id})
          </button>

          <button
            onClick={() => setIsRunning(false)}
            disabled={!isRunning}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-lg text-xs font-medium border border-slate-700 disabled:opacity-40 transition-colors"
          >
            <Pause className="w-3.5 h-3.5" />
            Pause
          </button>

          <button
            onClick={() => {
              setIsRunning(false);
              setCurrentStepIndex(-1);
            }}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg border border-slate-700 transition-colors"
            title="Reset execution state"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid: Left Test Case Picker & Right Virtual Browser + Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Sidebar: Test Cases List */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col space-y-4 max-h-[820px]">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              Test Suites ({filteredTestCases.length})
            </h2>
            <span className="text-xs bg-slate-800 px-2 py-0.5 rounded text-slate-400 font-mono">
              {framework.toUpperCase()}
            </span>
          </div>

          {/* Search & Category filter */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search test case or requirement..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar text-xs">
              {['all', 'auth', 'search', 'cart', 'checkout', 'api'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-md capitalize font-medium transition-all ${
                    selectedCategory === cat
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Test Case Cards List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {filteredTestCases.map(tc => {
              const isSelected = tc.id === selectedTestCaseId;
              const isCurrentlyExecuting = isRunning && isSelected;

              return (
                <div
                  key={tc.id}
                  onClick={() => {
                    setSelectedTestCaseId(tc.id);
                    if (!isRunning) setCurrentStepIndex(-1);
                  }}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-950/40 border-indigo-500/60 shadow-lg shadow-indigo-950/50'
                      : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
                        {tc.id}
                      </span>
                      <span className="text-xs font-semibold text-slate-200 line-clamp-1">
                        {tc.title}
                      </span>
                    </div>

                    {isCurrentlyExecuting ? (
                      <span className="flex items-center gap-1 text-[10px] text-amber-400 font-medium animate-pulse">
                        <Zap className="w-3 h-3 fill-amber-400" />
                        Running
                      </span>
                    ) : tc.status === 'passed' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <Clock className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    )}
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-2 mb-2 leading-relaxed">
                    {tc.description}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/60">
                    <span className="text-slate-400 font-medium">Req: {tc.requirement}</span>
                    <span className="font-mono">{tc.durationMs}ms</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Section: Virtual Browser & Dynamic Step Execution Inspector */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Virtual Browser Simulation Container */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col min-h-[420px]">
            
            {/* Chrome-style Window Bar */}
            <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-[11px] font-mono text-slate-400 ml-2 capitalize font-semibold">
                  {browser} Playwright Execution Environment
                </span>
              </div>

              {/* URL Address Bar */}
              <div className="flex-1 max-w-xl bg-slate-950 border border-slate-800 rounded-md px-3 py-1 flex items-center gap-2 text-xs font-mono text-slate-300">
                <Globe className="w-3.5 h-3.5 text-slate-500" />
                <span className="truncate">{simulatedUrl}</span>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 ml-auto flex-shrink-0" />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                  1280 x 720
                </span>
              </div>
            </div>

            {/* Simulated Target Webpage Interactive Frame */}
            <div className="flex-1 bg-slate-900/90 p-6 flex flex-col justify-between relative min-h-[360px]">
              
              {/* Animated Progress Bar when executing */}
              {isRunning && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-slate-800 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-300"
                    style={{ width: `${((currentStepIndex + 1) / activeTestCase.steps.length) * 100}%` }}
                  />
                </div>
              )}

              {/* Virtual Header of BookCart */}
              <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-3 flex items-center justify-between mb-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-indigo-400 font-bold text-sm">
                    <ShoppingBag className="w-4 h-4 text-indigo-400" />
                    BookCart Online Store
                  </div>
                  <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded font-mono">
                    https://bookcart.azurewebsites.net
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {simulatedState.isLoggedIn ? (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                      <UserCheck className="w-3.5 h-3.5" />
                      {simulatedState.usernameInput || 'qatester_e2e'}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400">Guest User</span>
                  )}

                  <div className="relative bg-indigo-600/20 text-indigo-300 p-1.5 rounded-lg border border-indigo-500/30 flex items-center gap-1.5 text-xs font-bold">
                    <ShoppingCart className="w-4 h-4" />
                    <span className="bg-indigo-500 text-white text-[10px] rounded-full px-1.5 py-0.2">
                      {simulatedState.cartCount}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dynamic Page Content View */}
              <div className="flex-1 border border-slate-800 bg-slate-950/80 rounded-xl p-5 flex flex-col justify-center">
                
                {/* 1. Login View Simulation */}
                {simulatedUrl.includes('/login') && (
                  <div className="max-w-sm mx-auto w-full bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
                    <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-indigo-400" />
                      BookCart Login Form
                    </h3>
                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="text-slate-400 text-[11px] block mb-1">
                          Username (getByLabel('Username'))
                        </label>
                        <input
                          type="text"
                          readOnly
                          value={simulatedState.usernameInput}
                          placeholder="Username..."
                          className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-200 font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 text-[11px] block mb-1">
                          Password (getByLabel('Password'))
                        </label>
                        <input
                          type="password"
                          readOnly
                          value={simulatedState.usernameInput ? '••••••••' : ''}
                          placeholder="Password..."
                          className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-200 font-mono text-xs"
                        />
                      </div>
                      <button 
                        className={`w-full py-2 rounded text-xs font-bold transition-all ${
                          simulatedState.usernameInput 
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 ring-2 ring-indigo-400' 
                            : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {"Login (getByRole('button', { name: 'Login' }))"}
                      </button>
                    </div>
                  </div>
                )}

                {/* 2. Catalog View Simulation */}
                {simulatedUrl === 'https://bookcart.azurewebsites.net/' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-4">
                      <input
                        type="text"
                        readOnly
                        value={simulatedState.searchTerm}
                        placeholder="Search books or authors... (getByPlaceholder('Search...'))"
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono"
                      />
                      <span className="text-xs text-slate-400">
                        Showing {simulatedState.searchTerm ? '1' : '6'} books
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {BOOKCART_BOOKS
                        .filter(b => !simulatedState.searchTerm || b.title.toLowerCase().includes(simulatedState.searchTerm.toLowerCase()))
                        .slice(0, 3)
                        .map(b => (
                          <div key={b.bookId} className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs space-y-2">
                            <div className="h-24 rounded bg-slate-950 overflow-hidden relative">
                              <img src={b.coverFileName} alt={b.title} className="w-full h-full object-cover opacity-80" />
                            </div>
                            <h4 className="font-bold text-slate-200 truncate">{b.title}</h4>
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-emerald-400 font-mono font-bold">₹{b.price}</span>
                              <button 
                                className="bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] px-2 py-1 rounded font-bold"
                              >
                                Add to Cart
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* 3. Shopping Cart View Simulation */}
                {simulatedUrl.includes('/shopping-cart') && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-slate-100 flex items-center justify-between">
                      <span>Shopping Cart Table (getByRole('table'))</span>
                      <span className="text-xs text-indigo-400 font-mono">Subtotal: ₹{simulatedState.cartItems.reduce((a,c) => a + (c.price * c.qty), 0)}</span>
                    </h3>

                    {simulatedState.cartItems.length > 0 ? (
                      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden text-xs">
                        <table className="w-full text-left border-collapse">
                          <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] border-b border-slate-800">
                            <tr>
                              <th className="p-2.5">Title</th>
                              <th className="p-2.5">Price</th>
                              <th className="p-2.5">Quantity</th>
                              <th className="p-2.5 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800 text-slate-200">
                            {simulatedState.cartItems.map((item, i) => (
                              <tr key={i}>
                                <td className="p-2.5 font-medium">{item.title}</td>
                                <td className="p-2.5 font-mono">₹{item.price}</td>
                                <td className="p-2.5 font-mono font-bold text-indigo-400">{item.qty}</td>
                                <td className="p-2.5 text-right">
                                  <button className="text-xs bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded hover:bg-rose-500/30">
                                    Delete
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="p-8 text-center bg-slate-900/50 border border-slate-800 rounded-lg text-slate-400 text-xs">
                        Your shopping cart is empty
                      </div>
                    )}
                  </div>
                )}

                {/* 4. Checkout View Simulation */}
                {simulatedUrl.includes('/checkout') && (
                  <div className="max-w-md mx-auto w-full bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 text-xs">
                    <h3 className="font-bold text-slate-100 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-emerald-400" />
                      Shipping Details Form
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-slate-400 text-[10px]">Name</label>
                        <input type="text" readOnly value="Alex Automation" className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 font-mono text-xs" />
                      </div>
                      <div>
                        <label className="text-slate-400 text-[10px]">Pincode</label>
                        <input type="text" readOnly value="10001" className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 font-mono text-xs" />
                      </div>
                    </div>
                    <div>
                      <label className="text-slate-400 text-[10px]">Address Line 1</label>
                      <input type="text" readOnly value="100 QA Test Boulevard" className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 font-mono text-xs" />
                    </div>
                    <button className="w-full bg-emerald-600 text-white font-bold py-1.5 rounded shadow shadow-emerald-600/30">
                      {"Place Order (getByRole('button', { name: 'Place Order' }))"}
                    </button>
                  </div>
                )}

                {/* 5. Orders Confirmation Simulation */}
                {simulatedUrl.includes('/myorders') && (
                  <div className="max-w-sm mx-auto w-full bg-slate-900 border border-emerald-500/40 rounded-xl p-5 text-center space-y-3 shadow-xl">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                      <FileCheck className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-emerald-400 text-sm">Order Placed Successfully!</h3>
                    <p className="text-slate-400 text-xs">
                      Order ID: <span className="font-mono text-slate-200 font-bold">{simulatedState.orderSuccessId || 'ORD-2026-88912'}</span>
                    </p>
                  </div>
                )}

              </div>

              {/* Step Notification Overlay */}
              {isRunning && currentStepIndex >= 0 && currentStepIndex < activeTestCase.steps.length && (
                <div className="mt-4 bg-slate-950/90 border border-indigo-500/40 rounded-lg p-3 flex items-center justify-between text-xs font-mono shadow-xl">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                    <span className="text-indigo-300 font-bold">
                      Step {currentStepIndex + 1}/{activeTestCase.steps.length}:
                    </span>
                    <span className="text-slate-200">
                      {activeTestCase.steps[currentStepIndex].name}
                    </span>
                  </div>
                  <span className="text-slate-400 text-[11px]">
                    {activeTestCase.steps[currentStepIndex].selector}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Execution Inspector (Steps, Network, Console, DOM) */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl space-y-4">
            
            {/* Inspector Navigation Tabs */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveInspectorTab('steps')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeInspectorTab === 'steps' 
                      ? 'bg-indigo-600 text-white' 
                      : 'text-slate-400 hover:text-slate-200 bg-slate-950 border border-slate-800'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Steps & Assertions ({activeTestCase.steps.length})
                </button>

                <button
                  onClick={() => setActiveInspectorTab('network')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeInspectorTab === 'network' 
                      ? 'bg-indigo-600 text-white' 
                      : 'text-slate-400 hover:text-slate-200 bg-slate-950 border border-slate-800'
                  }`}
                >
                  <Network className="w-3.5 h-3.5" />
                  Network Requests
                </button>

                <button
                  onClick={() => setActiveInspectorTab('console')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeInspectorTab === 'console' 
                      ? 'bg-indigo-600 text-white' 
                      : 'text-slate-400 hover:text-slate-200 bg-slate-950 border border-slate-800'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  Console Logs
                </button>
              </div>

              <span className="text-xs font-mono text-slate-400">
                Total Duration: {activeTestCase.durationMs}ms
              </span>
            </div>

            {/* Inspector Tab 1: Steps & Assertions */}
            {activeInspectorTab === 'steps' && (
              <div className="space-y-2">
                {activeTestCase.steps.map((st, idx) => {
                  const isCurrent = isRunning && currentStepIndex === idx;
                  const isDone = currentStepIndex > idx || (!isRunning && activeTestCase.status === 'passed');

                  return (
                    <div
                      key={st.id}
                      className={`p-3 rounded-lg border text-xs transition-all ${
                        isCurrent
                          ? 'bg-indigo-950/60 border-indigo-500 text-indigo-200 shadow-md ring-1 ring-indigo-500'
                          : isDone
                          ? 'bg-slate-950 border-slate-800/80 text-slate-300'
                          : 'bg-slate-950/40 border-slate-800/40 text-slate-500 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-bold text-slate-400">
                            #{idx + 1}
                          </span>
                          <span className="font-semibold text-slate-200">
                            {st.name}
                          </span>
                        </div>

                        {isDone ? (
                          <span className="text-emerald-400 font-mono text-[11px] flex items-center gap-1 font-bold">
                            <Check className="w-3.5 h-3.5" />
                            Passed ({st.durationMs}ms)
                          </span>
                        ) : isCurrent ? (
                          <span className="text-amber-400 font-mono text-[11px] animate-pulse font-bold">
                            Evaluating...
                          </span>
                        ) : (
                          <span className="text-slate-600 font-mono text-[11px]">
                            Pending
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-800/60 font-mono text-[11px]">
                        <div>
                          <span className="text-slate-500 block">Selector Used:</span>
                          <span className="text-cyan-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                            {st.selector}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Assertion Check:</span>
                          <span className="text-emerald-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                            {st.assertion}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Inspector Tab 2: Network Requests */}
            {activeInspectorTab === 'network' && (
              <div className="space-y-2">
                {activeTestCase.steps.filter(s => s.networkRequest).map((st, i) => {
                  const req = st.networkRequest!;
                  return (
                    <div key={i} className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs space-y-2 font-mono">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            req.method === 'POST' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-emerald-500/20 text-emerald-300'
                          }`}>
                            {req.method}
                          </span>
                          <span className="text-slate-200">{req.url}</span>
                        </div>

                        <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
                          HTTP {req.status} ({req.responseTimeMs}ms)
                        </span>
                      </div>

                      {req.responseBody && (
                        <div className="bg-slate-900 p-2 rounded text-[11px] text-slate-400 overflow-x-auto">
                          <span className="text-slate-500 block text-[10px] uppercase mb-1">Response Payload:</span>
                          <pre>{JSON.stringify(req.responseBody, null, 2)}</pre>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Inspector Tab 3: Console Logs */}
            {activeInspectorTab === 'console' && (
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-xs text-slate-300 space-y-1.5 min-h-[140px]">
                <div className="text-slate-500 text-[11px]">
                  [Playwright Runner Log] Initializing {browser} context on https://bookcart.azurewebsites.net
                </div>
                {activeTestCase.steps.map((s, i) => (
                  <div key={i} className="text-slate-300">
                    <span className="text-indigo-400">[{new Date().toLocaleTimeString()}]</span> {s.consoleLog || `Executed action ${s.action} - Assertion: ${s.assertion}`}
                  </div>
                ))}
                <div className="text-emerald-400 font-bold">
                  [Playwright] Test suite run completed with 0 errors. All assertions satisfied!
                </div>
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
};
