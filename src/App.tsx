import React, { useState, useRef, useEffect } from 'react';
import { BookOpen, Layers, Target, History, BookA, Zap, ChevronDown, GraduationCap, Info, Coffee, ShieldAlert } from 'lucide-react';
import BrowseMode from './components/BrowseMode';
import FlashcardMode from './components/FlashcardMode';
import QuizMode from './components/QuizMode';
import RevisionHistoryMode from './components/RevisionHistoryMode';
import GlossaryMode from './components/GlossaryMode';
import QuickLearnMode from './components/QuickLearnMode';
import VersionMode from './components/VersionMode';
import DonationModal from './components/DonationModal';
import DisclaimerModal from './components/DisclaimerModal';
import { ProgressProvider, useProgress } from './ProgressContext';
import { currentVersion } from './data/versionData';
import { AuthProvider } from './lib/AuthContext';
import { doc, getDocFromServer } from 'firebase/firestore';
import { db } from './lib/firebase';

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();

function AppContent() {
  const [activeTab, setActiveTab] = useState<'browse' | 'flashcards' | 'quiz' | 'quick_learn' | 'history' | 'terminology' | 'version'>('browse');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(localStorage.getItem('theme') as 'light' | 'dark' || 'light');
  const [isDonationOpen, setIsDonationOpen] = useState(false);
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { masteryPercentage } = useProgress();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);

    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--app-text)] font-sans flex flex-col transition-colors duration-500 ease-in-out">
      <div className="flex-1 flex flex-col max-w-full">
        <header className="w-full pt-10 px-4 md:px-8 border-b border-[var(--app-border)] bg-[var(--app-bg)] transition-colors duration-500 ease-in-out">
          <div className="max-w-4xl mx-auto w-full flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6">
            <div className="pb-6">
              <h1 className="text-xs uppercase tracking-[0.2em] font-bold text-red-700 dark:text-red-500 mb-1">Audit Companion</h1>
              <h2 
                className="text-5xl font-serif italic font-light tracking-tight cursor-pointer select-none hover:opacity-80 transition-opacity text-stone-900 dark:text-stone-100" 
                onClick={(e) => {
                  console.log("Theme toggle clicked");
                  toggleTheme();
                }}
                role="button"
                tabIndex={0}
                title="切换白天/黑夜模式"
              >
                IATF 16949:2016
              </h2>
            </div>
            
            <nav className="flex gap-4 sm:gap-8 overflow-visible w-full sm:w-auto pb-6 hide-scrollbar items-center justify-start sm:justify-end">
            <button
              onClick={() => setActiveTab('browse')}
              className={`text-sm font-serif transition-opacity flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'browse' ? 'text-red-700 dark:text-red-500 !opacity-100 font-bold' : 'opacity-60 hover:opacity-100'
              }`}
            >
              <BookOpen className="w-4 h-4" /> 浏览
            </button>
            
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`text-sm font-serif transition-opacity flex items-center gap-2 whitespace-nowrap ${
                  ['flashcards', 'quick_learn', 'quiz'].includes(activeTab) ? 'text-red-700 dark:text-red-500 !opacity-100 font-bold' : 'opacity-60 hover:opacity-100'
                }`}
              >
                <GraduationCap className="w-4 h-4" /> 学习 <ChevronDown className={`w-3 h-3 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isDropdownOpen && (
                <div className="absolute top-full mt-2 right-0 min-w-[140px] bg-white dark:bg-stone-900 border border-black/10 dark:border-white/10 shadow-xl py-2 flex flex-col z-50 rounded-sm">
                  <button
                    onClick={() => { setActiveTab('flashcards'); setIsDropdownOpen(false); }}
                    className={`text-sm font-serif text-left px-4 py-2 transition-colors flex items-center gap-2 whitespace-nowrap hover:bg-stone-50 dark:hover:bg-stone-800 ${
                      activeTab === 'flashcards' ? 'text-red-700 dark:text-red-500 bg-red-50/50 dark:bg-red-950/30' : 'text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    <Layers className="w-4 h-4" /> 抽认卡
                  </button>
                  <button
                    onClick={() => { setActiveTab('quick_learn'); setIsDropdownOpen(false); }}
                    className={`text-sm font-serif text-left px-4 py-2 transition-colors flex items-center gap-2 whitespace-nowrap hover:bg-stone-50 dark:hover:bg-stone-800 ${
                      activeTab === 'quick_learn' ? 'text-red-700 dark:text-red-500 bg-red-50/50 dark:bg-red-950/30' : 'text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    <Zap className="w-4 h-4" /> 快速学习
                  </button>
                  <button
                    onClick={() => { setActiveTab('quiz'); setIsDropdownOpen(false); }}
                    className={`text-sm font-serif text-left px-4 py-2 transition-colors flex items-center gap-2 whitespace-nowrap hover:bg-stone-50 dark:hover:bg-stone-800 ${
                      activeTab === 'quiz' ? 'text-red-700 dark:text-red-500 bg-red-50/50 dark:bg-red-950/30' : 'text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    <Target className="w-4 h-4" /> 测验
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => setActiveTab('history')}
              className={`text-sm font-serif transition-opacity flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'history' ? 'text-red-700 dark:text-red-500 !opacity-100 font-bold' : 'opacity-60 hover:opacity-100'
              }`}
            >
              <History className="w-4 h-4" /> 修订历史
            </button>
            <button
              onClick={() => setActiveTab('terminology')}
              className={`text-sm font-serif transition-opacity flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'terminology' ? 'text-red-700 dark:text-red-500 !opacity-100 font-bold' : 'opacity-60 hover:opacity-100'
              }`}
            >
              <BookA className="w-4 h-4" /> 术语表
            </button>
          </nav>
          </div>
        </header>

        <main className="flex-1 flex px-4 md:px-8 py-12 w-full gap-12">
          <section className="flex-1 flex flex-col w-full h-full max-w-4xl mx-auto">
            {activeTab === 'browse' && <BrowseMode />}
            {activeTab === 'flashcards' && <FlashcardMode />}
            {activeTab === 'quick_learn' && <QuickLearnMode />}
            {activeTab === 'quiz' && <QuizMode />}
            {activeTab === 'history' && <RevisionHistoryMode />}
            {activeTab === 'terminology' && <GlossaryMode />}
            {activeTab === 'version' && <VersionMode />}
          </section>
        </main>

        <footer className="w-full py-8 px-4 md:px-8 border-t border-[var(--app-border)] mt-auto transition-colors duration-500 ease-in-out">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-stone-400 dark:text-stone-500 text-[10px] uppercase tracking-widest font-bold">
            <div className="flex items-center gap-4">
              <span>© 2026 IATF 16949 Smart Platform</span>
              <button 
                onClick={() => setIsDisclaimerOpen(true)}
                className="hover:text-red-700 dark:hover:text-red-500 transition-colors flex items-center gap-1"
              >
                <ShieldAlert className="w-3 h-3" /> 版权声明
              </button>
            </div>
            
            <div className="flex items-center gap-6">
              <button 
                onClick={() => setIsDonationOpen(true)}
                className="hover:text-red-700 dark:hover:text-red-500 transition-colors flex items-center gap-1"
              >
                <Coffee className="w-3 h-3" /> 赞助支持
              </button>
              <button 
                onClick={() => setActiveTab('version')}
                className="hover:text-red-700 dark:hover:text-red-500 transition-colors flex items-center gap-1"
              >
                <Info className="w-3 h-3" /> Version v{currentVersion}
              </button>
            </div>
          </div>
        </footer>
      </div>

      <DonationModal isOpen={isDonationOpen} onClose={() => setIsDonationOpen(false)} />
      <DisclaimerModal isOpen={isDisclaimerOpen} onClose={() => setIsDisclaimerOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ProgressProvider>
        <AppContent />
      </ProgressProvider>
    </AuthProvider>
  );
}
