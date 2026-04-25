import React from 'react';
import { ShieldCheck, Calendar, Info, CheckCircle2 } from 'lucide-react';
import { appVersions } from '../data/versionData';
import { motion } from 'motion/react';

export default function VersionMode() {
  return (
    <div className="bg-white dark:bg-stone-900 p-6 md:p-12 shadow-sm border border-black/5 dark:border-white/5 relative w-full flex flex-col min-h-[600px] transition-colors duration-500">
      <div className="absolute -left-4 top-12 bg-stone-800 dark:bg-stone-700 text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest hidden md:block">
        ABOUT
      </div>
      
      <header className="mb-12">
        <span className="text-xs font-mono text-stone-400 dark:text-stone-500">系统信息</span>
        <h3 className="text-4xl font-serif mt-2 leading-tight text-stone-900 dark:text-stone-100">版本管理</h3>
        <p className="text-sm font-serif italic text-stone-500 dark:text-stone-400 mt-2">追踪 IATF 16949 智慧平台的开发迭代与功能更新。</p>
      </header>

      <div className="space-y-12">
        {appVersions.map((v, index) => (
          <motion.div 
            key={v.version}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative pl-8 border-l-2 border-stone-100 dark:border-stone-800 pb-4"
          >
            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white dark:bg-stone-900 border-2 border-stone-800 dark:border-stone-600 flex items-center justify-center">
              <div className={`w-1.5 h-1.5 rounded-full ${index === 0 ? 'bg-red-600 animate-pulse' : 'bg-stone-300 dark:bg-stone-700'}`} />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 mb-4">
              <span className="text-2xl font-mono font-bold text-stone-900 dark:text-stone-100">v{v.version}</span>
              <span className="inline-flex items-center gap-1 text-xs text-stone-400 dark:text-stone-500 bg-stone-50 dark:bg-stone-800/50 px-2 py-0.5 rounded border border-stone-100 dark:border-stone-800">
                <Calendar className="w-3 h-3" /> {v.date}
              </span>
              {index === 0 && (
                <span className="text-[10px] uppercase font-bold tracking-widest text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-2 py-0.5 rounded border border-red-100 dark:border-red-900/30">
                  Current
                </span>
              )}
            </div>

            <div className="bg-stone-50/50 dark:bg-stone-800/20 p-6 rounded-sm border border-stone-100/50 dark:border-white/5">
              <h4 className="text-xs font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500 mb-4 flex items-center gap-2">
                <Info className="w-3 h-3" /> 更新内容
              </h4>
              <ul className="space-y-3">
                {v.changes.map((change, i) => (
                  <li key={i} className="flex items-start gap-3 text-stone-700 dark:text-stone-300 font-serif text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-600/60 dark:text-green-500/60 mt-0.5 shrink-0" />
                    <span>{change}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}
      </div>

      <footer className="mt-auto pt-12 border-t border-stone-100 dark:border-stone-800 flex justify-between items-center">
        <div className="flex items-center gap-2 text-stone-400 dark:text-stone-500 text-xs font-mono">
          <ShieldCheck className="w-4 h-4" />
          <span>Secure Build</span>
        </div>
        <div className="text-stone-300 dark:text-stone-700 text-[10px] uppercase tracking-widest font-bold">
          IATF 16949 Smart Tool
        </div>
      </footer>
    </div>
  );
}
