import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Coffee, Heart } from 'lucide-react';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DonationModal({ isOpen, onClose }: DonationModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm" onClick={onClose}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white dark:bg-stone-900 border border-black/10 dark:border-white/10 shadow-2xl p-8 max-w-2xl w-full relative transition-colors duration-500 rounded-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors" 
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-500 rounded-full mb-4">
                <Coffee className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100">赞助支持</h3>
              <p className="text-stone-500 dark:text-stone-400 font-serif mt-2 text-sm max-w-md mx-auto leading-relaxed">
                如果您觉得这个工具对您的学习和工作有所帮助，欢迎请开发者喝杯咖啡。您的支持是我持续优化的动力！
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
              {/* WeChat */}
              <div className="flex flex-col items-center bg-stone-50 dark:bg-stone-800/50 p-6 border border-black/5 dark:border-white/5 rounded-sm">
                <div className="w-48 h-48 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-center overflow-hidden mb-4 relative">
                  <span className="text-sm text-stone-400 dark:text-stone-500 px-4 text-center absolute inset-0 flex items-center justify-center z-0">请放置 public/wechat-pay.png</span>
                  <img src="/wechat-pay.png" alt="微信赞助二维码" className="w-full h-full object-cover relative z-10" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                </div>
                <span className="text-green-600 dark:text-green-500 font-bold font-sans text-sm tracking-widest uppercase flex items-center gap-1">
                  微信支付
                </span>
              </div>

              {/* Alipay */}
              <div className="flex flex-col items-center bg-stone-50 dark:bg-stone-800/50 p-6 border border-black/5 dark:border-white/5 rounded-sm">
                <div className="w-48 h-48 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-center overflow-hidden mb-4 relative">
                  <span className="text-sm text-stone-400 dark:text-stone-500 px-4 text-center absolute inset-0 flex items-center justify-center z-0">请放置 public/alipay.png</span>
                  <img src="/alipay.png" alt="支付宝赞助二维码" className="w-full h-full object-cover relative z-10" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                </div>
                <span className="text-blue-600 dark:text-blue-500 font-bold font-sans text-sm tracking-widest uppercase flex items-center gap-1">
                  支付宝
                </span>
              </div>
            </div>

            <div className="mt-8 text-center text-xs text-stone-400 dark:text-stone-500 font-serif flex items-center justify-center gap-1">
              Made with <Heart className="w-3 h-3 text-red-500 mx-1" /> for Quality Professionals
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
