import React, { useState, useEffect } from 'react';
import { flatIatfData, Clause } from '../data/iatfData';
import { motion, AnimatePresence } from 'motion/react';
import { useProgress } from '../ProgressContext';
import { Loader2, ArrowRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface QuickLearnQuestion {
  clause: Clause;
  options: string[];
}

export default function QuickLearnMode() {
  const [questions, setQuestions] = useState<QuickLearnQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [takeaway, setTakeaway] = useState<string | null>(null);
  const [isGeneratingTakeaway, setIsGeneratingTakeaway] = useState(false);
  const { addQuickLearnResult, quickLearnStats } = useProgress();

  const generateQuestions = () => {
    const qCount = 5; // Shorter session for "Quick" learn
    const qs: QuickLearnQuestion[] = [];
    const shuffled = [...flatIatfData].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, qCount);

    selected.forEach(clause => {
      const options = new Set<string>();
      options.add(clause.title);

      while (options.size < 4) {
        const randClause = flatIatfData[Math.floor(Math.random() * flatIatfData.length)];
        options.add(randClause.title);
      }

      qs.push({
        clause,
        options: Array.from(options).sort(() => 0.5 - Math.random())
      });
    });

    setQuestions(qs);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsCorrect(null);
    setScore(0);
    setCompleted(false);
    setTakeaway(null);
  };

  useEffect(() => {
    generateQuestions();
  }, []);

  const generateTakeaway = async (clause: Clause) => {
    setIsGeneratingTakeaway(true);
    setTakeaway(null);
    try {
      setTimeout(() => {
        if (clause.interpretation && clause.interpretation.explanation && !clause.interpretation.explanation.includes('请在此处输入条款解读')) {
          const text = clause.interpretation.explanation.split('。')[0] + '。';
          setTakeaway(text);
        } else {
          setTakeaway(`核心要点：重点关注 ${clause.id} 的实际业务落地与证据留存。`);
        }
        setIsGeneratingTakeaway(false);
      }, 400); // Add a small delay to simulate generation for UX
    } catch (err) {
      console.error(err);
      setTakeaway('无法生成总结。');
      setIsGeneratingTakeaway(false);
    }
  };

  const handleSelect = (option: string) => {
    if (selectedOption !== null) return;
    
    const currentQ = questions[currentIndex];
    setSelectedOption(option);
    
    const correct = option === currentQ.clause.title;
    setIsCorrect(correct);
    
    if (correct) {
      setScore(prev => prev + 1);
      generateTakeaway(currentQ.clause);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setIsCorrect(null);
      setTakeaway(null);
    } else {
      addQuickLearnResult(score, questions.length);
      setCompleted(true);
    }
  };

  if (questions.length === 0) return <div className="text-center font-serif text-lg py-20 opacity-50">加载中...</div>;

  if (completed) {
    const overallAccuracy = quickLearnStats.total > 0 ? Math.round((quickLearnStats.correct / quickLearnStats.total) * 100) : 0;
    
    return (
      <div className="bg-white dark:bg-stone-900 p-12 shadow-sm border border-black/5 dark:border-white/5 flex flex-col items-center justify-center py-24 min-h-[500px] transition-colors duration-500">
        <span className="text-[10px] uppercase font-bold tracking-widest text-stone-400 dark:text-stone-500 mb-4">快速学习完成</span>
        <h2 className="text-8xl font-serif font-light tracking-tight mb-2 text-stone-900 dark:text-stone-100">{score}<span className="text-4xl text-stone-300 dark:text-stone-700">/{questions.length}</span></h2>
        
        <div className="flex gap-6 mt-4 opacity-60">
          <div className="flex flex-col items-center text-stone-900 dark:text-stone-100">
            <span className="text-[10px] uppercase tracking-widest font-bold">总会话数</span>
            <span className="font-serif text-xl">{quickLearnStats.attempts}</span>
          </div>
          <div className="flex flex-col items-center text-stone-900 dark:text-stone-100">
            <span className="text-[10px] uppercase tracking-widest font-bold">平均正确率</span>
            <span className="font-serif text-xl">{overallAccuracy}%</span>
          </div>
        </div>

        <button
          onClick={generateQuestions}
          className="mt-10 px-8 py-3 bg-black dark:bg-stone-100 text-white dark:text-stone-900 text-[10px] uppercase font-bold tracking-widest hover:bg-stone-800 dark:hover:bg-white transition-colors"
        >
          开始新一轮
        </button>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-stone-900 shadow-sm border border-black/5 dark:border-white/5 flex flex-col w-full min-h-[500px] transition-colors duration-500">
      <div className="px-6 md:px-12 py-8 border-b border-black/5 dark:border-white/5 flex justify-between items-center bg-stone-50 dark:bg-stone-800/30">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-stone-400 dark:text-stone-500">快速学习</span>
          <p className="text-sm font-sans font-medium mt-1 text-stone-900 dark:text-stone-100">第 {currentIndex + 1} 题 / 共 {questions.length} 题</p>
        </div>
        <div className="text-right">
          <span className="text-[10px] uppercase font-bold tracking-widest text-stone-400 dark:text-stone-500">得分</span>
          <p className="text-2xl font-serif mt-1 text-black dark:text-white">{score}</p>
        </div>
      </div>

      <div className="p-6 md:p-12 flex-1 flex flex-col">
        <div className="mb-8">
          <span className="text-[10px] uppercase font-bold tracking-widest text-red-700 dark:text-red-500">识别标题</span>
          <h2 className="text-4xl font-serif mt-4 leading-tight text-stone-900 dark:text-stone-100">
            以下编号对应的标题是<br />
            <span className="font-sans font-bold tracking-tighter text-6xl mt-2 block">{currentQ.clause.id}?</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentQ.options.map((option, index) => {
            const isSelected = selectedOption === option;
            const isActualCorrect = option === currentQ.clause.title;
            
            let stateClass = "border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-white/30 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 cursor-pointer";
            if (selectedOption !== null) {
              if (isSelected && isCorrect) stateClass = "border-green-500 dark:border-green-600 bg-green-50 dark:bg-green-950/30 text-green-900 dark:text-green-300 shadow-sm";
              else if (isSelected && !isCorrect) stateClass = "border-red-300 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 text-red-900 dark:text-red-300 opacity-70";
              else if (isActualCorrect) stateClass = "border-green-500 dark:border-green-600 text-green-700 dark:text-green-400 border-dashed animate-pulse-slow";
              else stateClass = "border-black/5 dark:border-white/5 text-stone-400 dark:text-stone-600 opacity-50 cursor-not-allowed";
            }

             return (
              <button
                key={index}
                onClick={() => handleSelect(option)}
                disabled={selectedOption !== null}
                className={`text-left p-6 border transition-all flex flex-col justify-center min-h-[100px] ${stateClass}`}
              >
                <span className="font-serif text-lg leading-snug">{option}</span>
                {isSelected && (
                  <span className="text-[10px] uppercase tracking-widest mt-3 font-bold opacity-70">
                    {isCorrect ? '正确' : '错误'}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        
        <AnimatePresence>
          {selectedOption !== null && isCorrect && (
             <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-8 p-6 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/30 rounded-sm overflow-hidden"
             >
                <div className="flex items-center text-[10px] uppercase font-bold tracking-widest text-red-700 dark:text-red-400 mb-2">
                   重点 takeaway
                   {isGeneratingTakeaway && <Loader2 className="w-3 h-3 ml-2 animate-spin" />}
                </div>
                {takeaway && (
                   <p className="font-serif text-stone-800 dark:text-stone-200 text-lg leading-relaxed">
                     {takeaway}
                   </p>
                )}
             </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {selectedOption !== null && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 flex justify-end pt-8 border-t border-black/5 dark:border-white/5"
            >
              <button
                onClick={handleNext}
                className="px-8 py-3 bg-black dark:bg-stone-100 text-white dark:text-stone-900 text-[10px] uppercase font-bold tracking-widest hover:bg-stone-800 dark:hover:bg-white transition-colors flex items-center"
              >
                {currentIndex < questions.length - 1 ? '下一题' : '查看结果'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
