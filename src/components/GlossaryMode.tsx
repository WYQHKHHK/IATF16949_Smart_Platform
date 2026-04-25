import React, { useState, useMemo } from 'react';
import { glossaryData } from '../data/glossaryData';
import { Search, BookA } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function GlossaryMode() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTerms = useMemo(() => {
    return glossaryData.filter((term) => {
      const matchesSearch = 
        term.term.toLowerCase().includes(searchQuery.toLowerCase()) || 
        term.definition.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesSearch;
    }).sort((a, b) => a.term.localeCompare(b.term));
  }, [searchQuery]);

  return (
    <div className="bg-white dark:bg-stone-900 p-6 md:p-12 shadow-sm border border-black/5 dark:border-white/5 relative w-full flex flex-col min-h-[600px] max-w-4xl mx-auto transition-colors duration-500">
      <div className="absolute -left-4 top-12 bg-red-700 dark:bg-red-800 text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest hidden md:block">
        术语表
      </div>
      
      <header className="mb-12">
        <span className="text-xs font-mono text-stone-400 dark:text-stone-500">Section 3.1</span>
        <h3 className="text-4xl font-serif mt-2 leading-tight text-stone-900 dark:text-stone-100">汽车行业术语</h3>
        <p className="text-sm font-serif italic text-stone-500 dark:text-stone-400 mt-2">
          IATF 16949:2016 规范定义的汽车行业核心术语与定义。
        </p>
      </header>

      {/* Search */}
      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-stone-500" />
          <input
            type="text"
            placeholder="搜索术语、关键词或定义..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-stone-50 dark:bg-stone-800/50 border border-black/10 dark:border-white/10 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-red-700 dark:focus:border-red-500 focus:ring-1 focus:ring-red-700 dark:focus:ring-red-500 font-serif transition-shadow"
          />
        </div>
      </div>

      {/* Terminology List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatePresence>
           {filteredTerms.map((item, index) => (
             <motion.div
               key={`${item.term}-${index}`}
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               transition={{ duration: 0.2 }}
               layout
               className="p-6 border border-black/5 dark:border-white/5 bg-stone-50 dark:bg-stone-800/30 group hover:border-black/20 dark:hover:border-white/20 transition-colors"
             >
               <h4 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100 group-hover:text-red-700 dark:group-hover:text-red-400 transition-colors mb-3">
                 {item.term}
               </h4>
               
               <p className="text-sm font-serif text-stone-600 dark:text-stone-400 leading-relaxed whitespace-pre-line">
                 {item.definition}
               </p>
               
             </motion.div>
           ))}
        </AnimatePresence>
        
        {filteredTerms.length === 0 && (
          <div className="col-span-1 md:col-span-2 py-16 text-center font-serif text-stone-500 italic opacity-60">
            未找到符合要求的术语。
          </div>
        )}
      </div>
    </div>
  );
}
