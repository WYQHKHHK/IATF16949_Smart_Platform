import React, { useState, useEffect } from 'react';
import { iatfData, Clause } from '../data/iatfData';
import { motion, AnimatePresence } from 'motion/react';
import { useProgress } from '../ProgressContext';
import { Loader2 } from 'lucide-react';

// Flatten function to get all clauses including interpretations
const flattenClauses = (clauses: Clause[]): Clause[] => {
  let result: Clause[] = [];
  clauses.forEach(clause => {
    result.push(clause);
    if (clause.subClauses && clause.subClauses.length > 0) {
      result = result.concat(flattenClauses(clause.subClauses));
    }
  });
  return result;
};

const allClauses = flattenClauses(iatfData);

type Difficulty = 'easy' | 'medium' | 'hard';

interface Question {
  type: 'guess_title' | 'guess_id' | 'scenario';
  clause?: Clause;
  scenario?: string; // for hard mode
  options: string[];
  correctAns: string; // explicitly store correct answer
}

export default function QuizMode() {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const { addQuizResult, quizStats } = useProgress();

  // Generate Questions
  const generateQuestions = async (selectedDifficulty: Difficulty) => {
    setIsGenerating(true);
    setGenerateError(null);
    const qCount = 10;
    const qs: Question[] = [];

    if (selectedDifficulty === 'hard') {
      try {
        // Filter clauses that have valid cases
        const clausesWithCases = allClauses.filter(c => 
          c.interpretation && 
          c.interpretation.cases && 
          c.interpretation.cases.trim() !== '' &&
          c.interpretation.cases.trim() !== '[请在此处输入应用案例，如果没有可留空]' &&
          (c.interpretation.cases.includes('案例') || c.interpretation.cases.length > 20)
        );

        if (clausesWithCases.length < 5) {
          throw new Error("Not enough clauses with cases found.");
        }

        // Pick 10 random clauses with cases
        const selectedClauses = [...clausesWithCases]
          .sort(() => 0.5 - Math.random())
          .slice(0, 10);

        selectedClauses.forEach(clause => {
          // Clean up the case text (remove "**案例**：" prefix if exists)
          let scenario = clause.interpretation!.cases.replace(/^\*\*案例\*\*[:：]\s*/, '').trim();
          
          const options = new Set<string>();
          const correctAns = clause.id;
          options.add(correctAns);

          // Add 3 distractors
          while (options.size < 4) {
            const randClause = allClauses[Math.floor(Math.random() * allClauses.length)];
            if (randClause.id !== correctAns) {
              options.add(randClause.id);
            }
          }

          qs.push({
            type: 'scenario',
            scenario,
            options: Array.from(options).sort(() => 0.5 - Math.random()),
            correctAns
          });
        });

      } catch (err) {
        console.error(err);
        setGenerateError("本地案例不足，无法生成困难模式题目。请先完善条款的“应用案例”。");
        setIsGenerating(false);
        return;
      }
    } else {
      const shuffled = [...allClauses].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, qCount);

      selected.forEach(clause => {
        const options = new Set<string>();
        const isGuessTitle = selectedDifficulty === 'medium'; // Medium: Guess title from ID. Easy: Guess ID from Title.
        
        const correctAns = isGuessTitle ? clause.title : clause.id;
        options.add(correctAns);

        while (options.size < 4) {
          const randClause = allClauses[Math.floor(Math.random() * allClauses.length)];
          const wrongAns = isGuessTitle ? randClause.title : randClause.id;
          options.add(wrongAns);
        }

        qs.push({
          type: isGuessTitle ? 'guess_title' : 'guess_id',
          clause,
          options: Array.from(options).sort(() => 0.5 - Math.random()),
          correctAns
        });
      });
    }

    setQuestions(qs);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsCorrect(null);
    setScore(0);
    setCompleted(false);
    setIsGenerating(false);
    setDifficulty(selectedDifficulty);
  };

  const handleSelect = (option: string) => {
    if (selectedOption !== null) return; // Prevent multiple selections
    
    const currentQ = questions[currentIndex];
    const correctAns = currentQ.correctAns;
    
    setSelectedOption(option);
    const correct = option === correctAns;
    setIsCorrect(correct);
    if (correct) setScore(s => s + 1);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setIsCorrect(null);
    } else {
      addQuizResult(score, questions.length);
      setCompleted(true);
    }
  };

  const resetQuiz = () => {
    setDifficulty(null);
    setQuestions([]);
    setCompleted(false);
  };

  if (!difficulty || generateError) {
    return (
      <div className="bg-white dark:bg-stone-900 p-12 shadow-sm border border-black/5 dark:border-white/5 flex flex-col items-center justify-center py-24 min-h-[500px] transition-colors">
        <h2 className="text-4xl font-serif font-light tracking-tight mb-8 text-stone-900 dark:text-stone-100">选择难度</h2>
        
        {generateError && (
          <div className="mb-6 text-red-600 font-serif italic text-center max-w-md">
            {generateError}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
          <button 
            onClick={() => generateQuestions('easy')}
            disabled={isGenerating}
            className="p-8 border border-black/10 dark:border-white/10 hover:border-black dark:hover:border-white transition-colors text-left flex flex-col group disabled:opacity-50"
          >
            <span className="text-[10px] uppercase tracking-widest font-bold text-stone-400 group-hover:text-black dark:group-hover:text-white transition-colors">简单</span>
            <span className="font-serif text-2xl mt-4 text-stone-900 dark:text-stone-100">识别编号</span>
            <span className="text-sm font-serif italic text-stone-500 mt-2">给出条款标题，识别正确的条款编号。</span>
          </button>
          
          <button 
             onClick={() => generateQuestions('medium')}
             disabled={isGenerating}
             className="p-8 border border-black/10 dark:border-white/10 hover:border-black dark:hover:border-white transition-colors text-left flex flex-col group disabled:opacity-50"
          >
            <span className="text-[10px] uppercase tracking-widest font-bold text-stone-400 group-hover:text-black dark:group-hover:text-white transition-colors">中等</span>
            <span className="font-serif text-2xl mt-4 text-stone-900 dark:text-stone-100">识别标题</span>
            <span className="text-sm font-serif italic text-stone-500 mt-2">给出条款编号，识别正确的条款标题。</span>
          </button>
          
          <button 
             onClick={() => generateQuestions('hard')}
             disabled={isGenerating}
             className="p-8 border border-black/10 dark:border-white/10 hover:border-black dark:hover:border-white transition-colors text-left flex flex-col group disabled:opacity-50"
          >
            <span className="text-[10px] uppercase tracking-widest font-bold text-red-700 dark:text-red-500 group-hover:text-red-900 dark:group-hover:text-red-400 transition-colors">困难</span>
            <span className="font-serif text-2xl mt-4 text-stone-900 dark:text-stone-100">情景题</span>
            <span className="text-sm font-serif italic text-stone-500 mt-2">阅读实际应用场景，并通过 AI 识别适用的条款。</span>
            {isGenerating && (
              <span className="mt-4 flex items-center text-xs text-stone-500 uppercase tracking-widest font-bold">
                <Loader2 className="w-3 h-3 mr-2 animate-spin" /> 正在生成...
              </span>
            )}
          </button>
        </div>
      </div>
    );
  }

  if (completed) {
    const overallAccuracy = quizStats.total > 0 ? Math.round((quizStats.correct / quizStats.total) * 100) : 0;
    
    return (
      <div className="bg-white dark:bg-stone-900 p-12 shadow-sm border border-black/5 dark:border-white/5 flex flex-col items-center justify-center py-24 min-h-[500px] transition-colors duration-500">
        <span className="text-[10px] uppercase font-bold tracking-widest text-stone-400 dark:text-stone-500 mb-4">测验完成</span>
        <h2 className="text-8xl font-serif font-light tracking-tight mb-2 text-stone-900 dark:text-stone-100">{score}<span className="text-4xl text-stone-300 dark:text-stone-700">/{questions.length}</span></h2>
        
        <div className="flex gap-6 mt-4 opacity-60">
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase tracking-widest font-bold text-stone-400">总测验次数</span>
            <span className="font-serif text-xl text-stone-800 dark:text-stone-200">{quizStats.attempts}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase tracking-widest font-bold text-stone-400">平均正确率</span>
            <span className="font-serif text-xl text-stone-800 dark:text-stone-200">{overallAccuracy}%</span>
          </div>
        </div>

        <p className="text-stone-600 dark:text-stone-400 font-serif text-lg mb-10 max-w-md text-center mt-6">
          {score >= 8 ? "表现非常出色，您对该标准的理解非常透彻！" : "干得不错。建议进一步复习以达到完全掌握程度。"}
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => generateQuestions(difficulty)}
            className="px-8 py-3 bg-black dark:bg-stone-800 text-white text-[10px] uppercase font-bold tracking-widest hover:bg-stone-800 dark:hover:bg-stone-700 transition-colors"
          >
            重做 ({difficulty})
          </button>
          <button
            onClick={resetQuiz}
            className="px-8 py-3 border border-black dark:border-white/20 text-black dark:text-white text-[10px] uppercase font-bold tracking-widest hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            更改难度
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const correctAns = currentQ.correctAns;

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-stone-900 shadow-sm border border-black/5 dark:border-white/5 flex flex-col w-full min-h-[500px] transition-colors duration-500">
      <div className="px-6 md:px-12 py-8 border-b border-black/5 dark:border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center bg-stone-50 dark:bg-stone-800/50 gap-4 transition-colors duration-500">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-stone-400">进度</span>
          <p className="text-2xl font-serif mt-1 text-black dark:text-white">{currentIndex + 1} <span className="text-sm text-stone-400 dark:text-stone-600">/ {questions.length}</span></p>
        </div>
        <div className="flex items-center gap-6">
           <div className="text-right hidden sm:block">
            <span className="text-[10px] uppercase font-bold tracking-widest text-stone-400">难度</span>
            <p className="text-xl font-serif mt-1 text-stone-500 capitalize">
              {difficulty === 'easy' ? '简单' : difficulty === 'medium' ? '中等' : '困难'}
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold tracking-widest text-stone-400">得分</span>
            <p className="text-2xl font-serif mt-1 text-black dark:text-white">{score}</p>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-12">
        <div className="mb-12">
          {currentQ.type === 'guess_title' ? (
            <>
              <span className="text-[10px] uppercase font-bold tracking-widest text-red-700 dark:text-red-500">识别标题</span>
              <h2 className="text-4xl font-serif mt-4 leading-tight text-stone-900 dark:text-stone-100">
                以下编号对应的条款标题是？ <br />
                <span className="font-sans font-bold tracking-tighter text-6xl mt-2 block">{currentQ.clause?.id}</span>
              </h2>
            </>
          ) : currentQ.type === 'guess_id' ? (
            <>
              <span className="text-[10px] uppercase font-bold tracking-widest text-red-700 dark:text-red-500">识别编号</span>
              <h2 className="text-3xl lg:text-4xl font-serif mt-4 leading-tight text-stone-900 dark:text-stone-100">
                以下标题对应的条款编号是？<br />
                <span className="italic mt-4 block text-stone-700 dark:text-stone-400">"{currentQ.clause?.title}"</span>
              </h2>
            </>
          ) : (
             <>
              <span className="text-[10px] uppercase font-bold tracking-widest text-red-700 dark:text-red-500">场景分析</span>
              <h2 className="text-2xl font-serif mt-4 leading-relaxed text-stone-800 dark:text-stone-200">
                {currentQ.scenario}
              </h2>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentQ.options.map((option, idx) => {
            let stateClass = "bg-white dark:bg-stone-800 border-black/10 dark:border-white/10 hover:border-black dark:hover:border-white text-black dark:text-white";
            if (selectedOption !== null) {
              if (option === correctAns) {
                stateClass = "bg-stone-100 dark:bg-stone-700 border-black dark:border-white font-bold text-black dark:text-white";
              } else if (option === selectedOption) {
                stateClass = "bg-white dark:bg-stone-900 border-red-700 dark:border-red-500 text-red-700 dark:text-red-500";
              } else {
                stateClass = "bg-white dark:bg-stone-950 border-black/5 dark:border-white/5 text-stone-300 dark:text-stone-700";
              }
            }

            return (
              <motion.button
                key={idx}
                onClick={() => handleSelect(option)}
                disabled={selectedOption !== null}
                animate={
                  selectedOption !== null && option === selectedOption
                    ? option === correctAns
                      ? { scale: [1, 1.02, 1], transition: { duration: 0.3 } }
                      : { x: [0, -8, 8, -6, 6, 0], transition: { duration: 0.4 } }
                    : {}
                }
                whileHover={selectedOption === null ? { scale: 1.01 } : {}}
                whileTap={selectedOption === null ? { scale: 0.98 } : {}}
                className={`text-left p-6 border transition-opacity flex flex-col justify-center ${stateClass}`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className={`text-lg ${currentQ.type === 'guess_id' || currentQ.type === 'scenario' ? 'font-sans font-bold text-2xl tracking-tighter' : 'font-serif'} pr-4`}>{option}</span>
                </div>
                {selectedOption !== null && option === correctAns && (
                  <span className="text-[10px] uppercase tracking-widest mt-4">回答正确</span>
                )}
                {selectedOption !== null && option === selectedOption && option !== correctAns && (
                   <span className="text-[10px] uppercase tracking-widest mt-4">回答错误</span>
                )}
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence>
          {selectedOption !== null && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-12 flex justify-end pt-8 border-t border-black/5 dark:border-white/5 items-center gap-6"
            >
              <button
                onClick={resetQuiz}
                className="text-stone-400 dark:text-stone-600 hover:text-black dark:hover:text-white text-[10px] uppercase font-bold tracking-widest transition-colors"
                style={{marginRight: 'auto'}}
              >
                结束测试
              </button>
              <button
                onClick={handleNext}
                className="px-8 py-3 bg-black dark:bg-stone-800 text-white text-[10px] uppercase font-bold tracking-widest hover:bg-stone-800 dark:hover:bg-stone-700 transition-colors"
              >
                {currentIndex < questions.length - 1 ? '下一题' : '查看结果'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
