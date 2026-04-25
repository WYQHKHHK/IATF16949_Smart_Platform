import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldAlert } from 'lucide-react';

interface DisclaimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DisclaimerModal({ isOpen, onClose }: DisclaimerModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm" onClick={onClose}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white dark:bg-stone-900 border border-black/10 dark:border-white/10 shadow-2xl p-8 max-w-2xl w-full relative transition-colors duration-500 rounded-sm max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors" 
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-3 mb-6 border-b border-black/5 dark:border-white/5 pb-4">
              <ShieldAlert className="w-6 h-6 text-stone-700 dark:text-stone-300" />
              <h3 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-100">版权归属与免责声明</h3>
            </div>

            <div className="prose prose-stone dark:prose-invert prose-sm font-serif leading-relaxed max-w-none">
              <p>
                欢迎使用 <strong>IATF 16949 智能平台</strong>。在您使用本平台前，请仔细阅读以下声明：
              </p>
              
              <h4 className="text-red-700 dark:text-red-500 font-bold mt-6 mb-2 text-base">版权归属</h4>
              <p>
                IATF 16949® 是国际汽车工作组（IATF）的注册商标。本平台中所引用的 IATF 16949:2016 官方标准条款文本，其知识产权及版权完全归属于 <strong>AIAG（汽车工业行动小组）</strong> 及 <strong>IATF（国际汽车工作组）</strong> 所有。
              </p>
              <p>
                本平台的软件代码、界面设计、交互逻辑以及衍生的人工智能解析功能，其版权归属于本平台开发者所有（© 2026）。
              </p>

              <h4 className="text-red-700 dark:text-red-500 font-bold mt-6 mb-2 text-base">使用目的与免责条款</h4>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>非官方性质</strong>：本平台是一个完全独立的第三方工具，未获得 IATF 或 AIAG 的官方授权、赞助或认可。</li>
                <li><strong>学习辅助</strong>：本平台旨在为质量管理专业人士提供便捷的检索、学习和备考辅助工具，绝不能替代官方发行的标准出版物。</li>
                <li><strong>AI 解析免责</strong>：平台中提供的“条款解读”、“应用案例”和“快速学习”等衍生内容，仅代表平台预设逻辑或分析结果，<strong>仅供参考</strong>。在实际的企业质量管理体系建设、内审及第三方认证审核中，请务必以审核员的专业判断和官方标准指南为准。本平台不对因采信这些解析而产生的任何直接或间接后果负责。</li>
              </ul>

              <h4 className="text-red-700 dark:text-red-500 font-bold mt-6 mb-2 text-base">隐私与安全</h4>
              <p>
                本平台为纯前端单页应用（SPA）。所有的浏览记录、书签和测验进度均保存在您的本地浏览器（LocalStorage）中，我们不会收集或上传您的任何个人数据。
              </p>
            </div>

            <div className="mt-8 flex justify-end">
              <button 
                onClick={onClose}
                className="px-6 py-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-sm font-bold font-sans tracking-widest uppercase hover:bg-stone-800 dark:hover:bg-white transition-colors rounded-sm"
              >
                我已了解
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
