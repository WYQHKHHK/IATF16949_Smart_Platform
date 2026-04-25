import React, { useState } from 'react';
import { historyData, RevisionEvent } from '../data/revisionHistory';
import { motion } from 'motion/react';
import { BookOpen, GitCommit, FileText } from 'lucide-react';

export default function RevisionHistoryMode() {
  const [filter, setFilter] = useState<'all' | 'major_release' | 'si'>('all');

  // Sort: newest first
  const sortedHistory = [...historyData].reverse();
  const filteredHistory = sortedHistory.filter(event => filter === 'all' || event.type === filter);

  return (
    <div className="bg-white dark:bg-stone-900 p-6 md:p-12 shadow-sm border border-black/5 dark:border-white/5 relative w-full flex flex-col min-h-[600px] max-w-4xl mx-auto transition-colors duration-500">
      <div className="absolute -left-4 top-12 bg-red-700 dark:bg-red-800 text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest hidden md:block">
        历史
      </div>
      
      <header className="mb-12">
        <span className="text-xs font-mono text-stone-400 dark:text-stone-500">时间线</span>
        <h3 className="text-4xl font-serif mt-2 leading-tight text-stone-900 dark:text-stone-100">修订历史</h3>
        <p className="text-sm font-serif italic text-stone-500 dark:text-stone-400 mt-2">
          追踪标准从 TS 16949 到最新认可解释 (SI) 的演变过程。
        </p>

        <div className="flex border-b border-black/5 dark:border-white/5 mt-8">
          <button 
            className={`pb-3 px-4 font-serif text-sm transition-colors relative ${filter === 'all' ? 'text-stone-900 dark:text-stone-100 pointer-events-none' : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-300'}`}
            onClick={() => setFilter('all')}
          >
            所有事件
            {filter === 'all' && (
              <motion.div layoutId="historyTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-700 dark:bg-red-500" />
            )}
          </button>
          <button 
            className={`pb-3 px-4 font-serif text-sm transition-colors relative ${filter === 'major_release' ? 'text-stone-900 dark:text-stone-100 pointer-events-none' : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-300'}`}
            onClick={() => setFilter('major_release')}
          >
            主要版本
            {filter === 'major_release' && (
              <motion.div layoutId="historyTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-700 dark:bg-red-500" />
            )}
          </button>
          <button 
             className={`pb-3 px-4 font-serif text-sm transition-colors relative ${filter === 'si' ? 'text-stone-900 dark:text-stone-100 pointer-events-none' : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-300'}`}
             onClick={() => setFilter('si')}
          >
            认可解释 (SI)
            {filter === 'si' && (
              <motion.div layoutId="historyTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-700 dark:bg-red-500" />
            )}
          </button>
        </div>
      </header>

      <div className="relative pl-8 md:pl-0">
        <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-stone-200 dark:bg-stone-800 -translate-x-1/2" />
        
        <div className="space-y-12 pb-12">
          {filteredHistory.map((item, index) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`relative flex flex-col md:flex-row items-start ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
            >
              {/* Timeline dot */}
              <div className="absolute left-0 md:left-1/2 w-8 h-8 rounded-full bg-white dark:bg-stone-900 border-2 border-red-700 dark:border-red-600 -translate-x-1/2 flex items-center justify-center z-10 shadow-sm mt-1 mb-4 md:mt-0">
                {item.type === 'major_release' ? (
                  <BookOpen className="w-3.5 h-3.5 text-red-700 dark:text-red-500" />
                ) : item.type === 'si' ? (
                  <GitCommit className="w-4 h-4 text-red-700 dark:text-red-500" />
                ) : (
                  <FileText className="w-4 h-4 text-red-700 dark:text-red-500" />
                )}
              </div>

              {/* Content box */}
              <div className={`ml-8 md:ml-0 md:w-1/2 ${index % 2 === 0 ? 'md:pl-12' : 'md:pr-12'}`}>
                <div className="bg-stone-50 dark:bg-stone-800/50 border border-black/5 dark:border-white/5 p-6 shadow-sm hover:shadow-md transition-all">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-red-700 dark:text-red-400">{item.date}</span>
                  <h4 className="text-xl font-serif mt-2 text-stone-900 dark:text-stone-100">{item.title}</h4>
                  <p className="text-sm font-serif text-stone-600 dark:text-stone-300 mt-3 leading-relaxed">
                    {item.description}
                  </p>
                  
                  {item.relatedClauses && item.relatedClauses.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/5">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-stone-400 dark:text-stone-500 block mb-2">受影响条款</span>
                      <div className="flex flex-wrap gap-2">
                        {item.relatedClauses.map(clause => (
                          <span key={clause} className="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-2 py-1 text-xs font-mono text-stone-600 dark:text-stone-300 rounded">
                            {clause}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          
          {filteredHistory.length === 0 && (
             <div className="py-12 text-center font-serif text-stone-500 italic w-full">
               当前筛选条件下未找到相关历史记录。
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
