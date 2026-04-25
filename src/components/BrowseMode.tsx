import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  Search, 
  X, 
  Bookmark, 
  CheckCircle2, 
  ExternalLink, 
  List, 
  MapPin, 
  PanelLeftClose,
  AlertTriangle,
  Info,
  Clock,
  BookmarkCheck,
  GitCommit
} from 'lucide-react';
import { iatfData, flatIatfData, Clause } from '../data/iatfData';
import { glossaryData } from '../data/glossaryData';
import { historyData } from '../data/revisionHistory';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { useProgress } from '../ProgressContext';

// Simple Error Boundary to prevent white screen
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: any}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 border border-red-200 bg-red-50/50 rounded-sm m-2">
          <div className="flex items-center gap-2 text-red-700 mb-2">
            <AlertTriangle className="w-4 h-4" />
            <h2 className="text-sm font-bold">渲染组件时出错</h2>
          </div>
          <p className="text-xs text-red-600/80 mb-3">这通常由于复杂的文本格式导致。请点击下方重试按钮，或尝试重新加载页面。</p>
          <div className="flex gap-2">
            <button 
              onClick={() => {
                this.setState({ hasError: false, error: null });
              }}
              className="px-3 py-1.5 bg-red-700 text-white text-[10px] font-bold rounded-sm hover:bg-red-800 transition-colors shadow-sm"
            >
              点击重试
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="px-3 py-1.5 bg-white border border-red-200 text-red-700 text-[10px] font-bold rounded-sm hover:bg-red-50 transition-colors shadow-sm"
            >
              刷新页面
            </button>
          </div>
          {process.env.NODE_ENV === 'development' && (
            <pre className="mt-4 text-[9px] bg-white/50 p-2 overflow-auto max-h-32 border border-red-100 rounded text-red-500 font-mono">
              {this.state.error?.stack || this.state.error?.toString()}
            </pre>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}

/**
 * SmartContent 组件：处理交叉引用链接和术语关联
 */
export const SmartContent = ({ content, onJump, onTermClick, highlight }: { content: string, onJump: (id: string) => void, onTermClick?: (term: string) => void, highlight?: string }) => {
  if (!content) return null;

  // Process links like [[#ID Title]]
  const processClauseLinks = (text: string): (string | JSX.Element)[] => {
    const parts: (string | JSX.Element)[] = [];
    const regex = /\[\[#(.*?)\]\]/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      
      const target = match[1];
      const idPrefixMatch = target.match(/^(\d+(\.\d+)*|附录\s*[A-Z])/);
      const jumpTarget = idPrefixMatch ? idPrefixMatch[0].replace(/\s/g, '') : target;

      parts.push(
        <button
          key={`link-${match.index}-${lastIndex}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onJump(jumpTarget);
          }}
          className="text-red-700 hover:text-red-900 border-b border-red-200 hover:border-red-500 transition-colors font-bold px-0.5 inline-flex items-center gap-0.5"
        >
          {target} <ExternalLink className="w-2 h-2" />
        </button>
      );
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : [text];
  };

  // Process glossary terms
  const processTerms = (elements: (string | JSX.Element)[]): (string | JSX.Element)[] => {
    if (glossaryData.length === 0) return elements;

    // Filter and sort terms once
    const sortedTerms = [...glossaryData]
      .filter(t => t.term && t.term.length > 1)
      .sort((a, b) => b.term.length - a.term.length);
    
    return elements.flatMap((el, elIdx) => {
      if (typeof el !== 'string') return [el];
      
      let textParts: (string | JSX.Element)[] = [el];
      
      sortedTerms.forEach((termObj, termIdx) => {
        const nextParts: (string | JSX.Element)[] = [];
        textParts.forEach((part, partIdx) => {
          if (typeof part !== 'string' || part.length < termObj.term.length) {
            nextParts.push(part);
            return;
          }
          
          const term = termObj.term;
          const index = part.indexOf(term);
          
          if (index !== -1) {
            if (index > 0) nextParts.push(part.substring(0, index));
            
            nextParts.push(
              <span 
                key={`term-${elIdx}-${termIdx}-${partIdx}-${index}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onTermClick && onTermClick(termObj.term);
                }}
                className="border-b border-dashed border-stone-400 hover:border-red-700 dark:hover:border-red-400 hover:text-red-700 dark:hover:text-red-400 cursor-help transition-colors"
                title="点击查看术语解释"
              >
                {term}
              </span>
            );
            
            if (index + term.length < part.length) {
              nextParts.push(part.substring(index + term.length));
            }
          } else {
            nextParts.push(part);
          }
        });
        textParts = nextParts;
      });
      
      return textParts;
    });
  };

  const processHighlights = (elements: (string | JSX.Element)[]) => {
    if (!highlight || !highlight.trim()) return elements;
    
    const term = highlight.trim().toLowerCase();
    
    return elements.flatMap((el, idx) => {
      if (typeof el !== 'string') return [el];
      
      const lowerEl = el.toLowerCase();
      if (!lowerEl.includes(term)) return [el];
      
      const parts: (string | JSX.Element)[] = [];
      let lastIndex = 0;
      let findIndex = lowerEl.indexOf(term);
      
      while (findIndex !== -1) {
        if (findIndex > lastIndex) {
          parts.push(el.substring(lastIndex, findIndex));
        }
        parts.push(
          <mark key={`hl-${idx}-${findIndex}-${lastIndex}`} className="bg-red-200/60 dark:bg-red-900/40 text-red-900 dark:text-red-200 rounded-[2px]">
            {el.substring(findIndex, findIndex + term.length)}
          </mark>
        );
        lastIndex = findIndex + term.length;
        findIndex = lowerEl.indexOf(term, lastIndex);
      }
      
      if (lastIndex < el.length) {
        parts.push(el.substring(lastIndex));
      }
      
      return parts;
    });
  };

  const elementsWithClauseLinks = processClauseLinks(content);
  const elementsWithTerms = processTerms(elementsWithClauseLinks);
  const elementsWithHighlights = processHighlights(elementsWithTerms);

  return (
    <>
      {elementsWithHighlights.map((el, i) => {
        if (typeof el === 'string') {
          return <React.Fragment key={`txt-${i}-${el.length}`}>{el}</React.Fragment>;
        }
        if (React.isValidElement(el)) {
          return React.cloneElement(el as React.ReactElement, { 
            key: (el as any).key || `element-${i}-${el.type}` 
          });
        }
        return null;
      })}
    </>
  );
};

// Fixed TextRenderer to avoid infinite recursion
const TextRenderer = ({ children, onJump, onTermClick, highlight }: { children: React.ReactNode, onJump: (id: string) => void, onTermClick?: (term: string) => void, highlight?: string }) => {
  if (children === null || children === undefined) return null;
  
  if (typeof children === 'string') {
    return <SmartContent content={children} onJump={onJump} onTermClick={onTermClick} highlight={highlight} />;
  }
  
  if (Array.isArray(children)) {
    return (
      <>
        {children.map((child, i) => (
          <TextRenderer key={i} onJump={onJump} onTermClick={onTermClick} highlight={highlight}>
            {child}
          </TextRenderer>
        ))}
      </>
    );
  }
  
  if (React.isValidElement(children)) {
    const props = children.props as any;
    // Only process the children OF the element, avoiding recursing on the element itself
    if (props && props.children) {
      // If the element has children, we need to clone it to process those children
      // But we skip certain elements that shouldn't be processed or could cause issues
      if (typeof children.type === 'string' && ['img', 'br', 'hr', 'code', 'pre'].includes(children.type)) {
        return children;
      }
      
      try {
        return React.cloneElement(children as React.ReactElement, {
          children: <TextRenderer onJump={onJump} onTermClick={onTermClick} highlight={highlight}>{props.children}</TextRenderer>
        });
      } catch (e) {
        return children;
      }
    }
    return children;
  }
  
  return <>{children}</>;
};

const SmartText = TextRenderer; // Maintain backward compatibility for component props

export const ClauseItem = ({ 
  clause, 
  level = 0, 
  defaultOpen = false, 
  isSearchResult = false,
  bookmarks = [],
  onToggleBookmark,
  onJump,
  onTermClick,
  highlightQuery,
  activeId,
  setActiveId,
  onLevel1Toggle
}: { 
  clause: Clause; 
  level?: number; 
  key?: React.Key; 
  defaultOpen?: boolean; 
  isSearchResult?: boolean;
  bookmarks?: string[];
  onToggleBookmark?: (id: string) => void;
  onJump: (id: string) => void;
  onTermClick?: (term: string) => void;
  highlightQuery?: string;
  activeId?: string | null;
  setActiveId: (id: string) => void;
  onLevel1Toggle: (id: string, isOpen: boolean) => void;
}) => {
  const { viewedClauses } = useProgress();
  const isViewed = viewedClauses.includes(clause.id);
  
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const manualToggleRef = useRef(false);

  const hasChildren = clause.subClauses && clause.subClauses.length > 0;
  const isBookmarked = bookmarks.includes(clause.id);
  
  const relatedHistoryEvents = useMemo(() => {
    return historyData.filter(event => event.relatedClauses?.includes(clause.id));
  }, [clause.id]);

  useEffect(() => {
    if (defaultOpen !== undefined) setIsOpen(defaultOpen);
  }, [defaultOpen]);

  // 当 activeId 发生变化时，如果当前条款是目标条款的祖先节点，则自动展开
  useEffect(() => {
    // 如果是用户手动操作触发的 activeId 改变（点击标题），则不在此处强制展开
    // 只有在 activeId 确实改变（通常来自外部跳转或搜索）且不是手动触发时才自动展开
    if (!manualToggleRef.current && activeId && (activeId === clause.id || activeId.startsWith(clause.id + '.')) && !isOpen) {
      setIsOpen(true);
    }
    // 只要 activeId 变化，就重置手动操作标记，以便下一次外部跳转能生效
    manualToggleRef.current = false;
  }, [activeId, clause.id]);

  if (!isSearchResult && clause.title === "（仅章节号）" && hasChildren) {
    return (
      <>
        {clause.subClauses!.map((subClause) => (
          <ClauseItem key={subClause.id} clause={subClause} level={level} defaultOpen={defaultOpen} bookmarks={bookmarks} onToggleBookmark={onToggleBookmark} onJump={onJump} onTermClick={onTermClick} highlightQuery={highlightQuery} activeId={activeId} setActiveId={setActiveId} onLevel1Toggle={onLevel1Toggle} />
        ))}
      </>
    );
  }

  const handleClick = () => {
    manualToggleRef.current = true;
    setActiveId(clause.id);
    if (!isSearchResult) {
      const newIsOpen = !isOpen;
      setIsOpen(newIsOpen);
      if (level === 0) {
        onLevel1Toggle(clause.id, newIsOpen);
      }
    }
  };

  const hasValidInterpretation = clause.interpretation && 
    (clause.interpretation.explanation.trim() !== '[请在此处输入条款解读]' || 
     (clause.interpretation.cases && clause.interpretation.cases.trim() !== '[请在此处输入应用案例，如果没有可留空]') ||
     (clause.interpretation.related && clause.interpretation.related.length > 0 && !clause.interpretation.related[0].includes('8.5.1.1')));

  const hasContent = clause.content && clause.content.length > 0;
  const isExpandable = (hasChildren || hasContent) && !isSearchResult;

  return (
    <div id={`clause-${clause.id}`} className="font-sans border-b border-black/5 dark:border-white/5 last:border-0 hover:bg-stone-100/50 dark:hover:bg-stone-800/30 transition-colors relative group scroll-mt-24">
      <div 
        className={`flex items-center py-4 px-4 cursor-pointer`}
        style={{ paddingLeft: `${isSearchResult ? '1rem' : Math.max(1, level * 2 + 1) + 'rem'}` }}
        onClick={handleClick}
      >
        <span className="w-5 h-5 flex items-center justify-center mr-2 text-stone-400 shrink-0">
          {isExpandable ? (
            <motion.div animate={{ rotate: isOpen ? 90 : 0 }}>
              <ChevronRight className="w-4 h-4" />
            </motion.div>
          ) : (
            <div className="w-1.5 h-1.5 rounded-full bg-stone-300" />
          )}
        </span>
        <span className={`font-serif text-lg flex items-center flex-wrap gap-3 ${!isSearchResult && level === 0 ? 'text-2xl font-light text-stone-900 dark:text-stone-100' : 'text-stone-800 dark:text-stone-200'} flex-1`}>
          <SmartContent content={clause.title} onJump={onJump} onTermClick={onTermClick} highlight={highlightQuery} />
          {relatedHistoryEvents.length > 0 && (
             <span className="inline-flex items-center gap-1 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-widest leading-none border border-red-200 dark:border-red-800">
               <GitCommit className="w-3 h-3" /> SI 更新
             </span>
          )}
          {isViewed && (!hasChildren || isSearchResult) && (
            <CheckCircle2 className="w-4 h-4 text-green-600/70" />
          )}
        </span>
        
        {(!hasChildren || isSearchResult) && onToggleBookmark && (
          <button 
            className={`p-2 opacity-0 group-hover:opacity-100 transition-opacity ${isBookmarked ? 'opacity-100 text-red-600' : 'text-stone-400 hover:text-stone-600'}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleBookmark(clause.id);
            }}
          >
            <Bookmark className="w-4 h-4" fill={isBookmarked ? "currentColor" : "none"} />
          </button>
        )}
      </div>
      
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            {clause.content && clause.content.length > 0 && (
              <div 
                className="px-4 py-4 bg-stone-50/50 dark:bg-stone-900/30 border-l-2 border-red-700/20 dark:border-red-500/20 ml-8 mr-4 my-2"
                style={{ marginLeft: `${Math.max(2, level * 2 + 2)}rem` }}
              >
                <div className="text-sm font-serif text-stone-700 dark:text-stone-300 leading-relaxed overflow-x-auto">
                  <ErrorBoundary>
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm, remarkBreaks]}
                      components={{
                        img: ({node, ...props}) => <img className="max-w-full h-auto my-4 shadow-sm border border-black/5 rounded-sm" {...props} />,
                        table: ({node, ...props}) => <table className="min-w-full border-collapse border border-stone-200 dark:border-stone-800 my-4" {...props} />,
                        th: ({node, children, ...props}) => <th className="border border-stone-300 dark:border-stone-700 p-2 bg-stone-100 dark:bg-stone-800 text-left font-bold" {...props}>{children}</th>,
                        td: ({node, children, ...props}) => <td className="border border-stone-300 dark:border-stone-700 p-2" {...props}>{children}</td>,
                        p: ({node, children, ...props}) => <p className="mb-3 last:mb-0" {...props}>{children}</p>,
                        li: ({node, children, ...props}) => <li className="mb-1" {...props}>{children}</li>,
                        ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-3" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-3" {...props} />
                      }}
                    >
                      {clause.content.join('\n')}
                    </ReactMarkdown>
                  </ErrorBoundary>
                </div>
              </div>
            )}

            {hasValidInterpretation && clause.interpretation && (
              <div 
                className="bg-stone-50 dark:bg-stone-900/50 border border-black/10 dark:border-white/10 mt-2 mb-4 mr-4 relative shadow-sm rounded-sm"
                style={{ marginLeft: `${isSearchResult ? '1rem' : Math.max(1, level * 2 + 1) + 'rem'}`, padding: '24px 32px 32px 32px' }}
              >
                <div className="absolute top-0 left-6 bg-red-700 dark:bg-red-800 text-white px-3 py-1 text-xs font-bold font-sans tracking-wide shadow-sm rounded-b-sm">
                  实际应用
                </div>
                
                <div className="text-sm font-serif leading-relaxed text-stone-800 dark:text-stone-200 space-y-6 pt-6">
                  <div>
                    <ErrorBoundary>
                      <div className="prose prose-stone dark:prose-invert prose-sm max-w-none prose-p:leading-loose">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {(clause.interpretation.explanation || '').replace('\[请在此处输入条款解读\]', '')}
                        </ReactMarkdown>
                      </div>
                    </ErrorBoundary>
                  </div>
                  
                  {clause.interpretation.cases && clause.interpretation.cases.trim() !== '[请在此处输入应用案例，如果没有可留空]' && (
                    <div className="border-t border-stone-200 dark:border-stone-800 pt-4">
                      <div className="text-xs font-bold text-red-700 dark:text-red-500 mb-2 uppercase tracking-widest">案例应用</div>
                      <div className="prose prose-stone dark:prose-invert prose-sm max-w-none prose-p:leading-loose">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {clause.interpretation.cases}
                        </ReactMarkdown>
                      </div>
                    </div>
                  )}

                  {clause.interpretation.related && clause.interpretation.related.length > 0 && !clause.interpretation.related[0].includes('8.5.1.1') && (
                    <div className="pt-6 border-t border-black/10 mt-8">
                      <div className="bg-blue-600 text-white px-2 py-1 text-xs font-bold font-sans inline-block mb-4 tracking-wide shadow-sm rounded-sm">
                        相关/交叉引用条款
                      </div>
                      <div className="flex flex-wrap gap-4">
                        {clause.interpretation.related.map(relId => {
                          const targetId = relId.match(/^(\d+(\.\d+)*)/)?.[0] || relId;
                          const relatedClause = flatIatfData.find(c => c.id === targetId);
                          if (!relatedClause) return null;
                          
                          const titleWithoutId = relatedClause.title.replace(new RegExp(`^${targetId}\\s*`), '');
                          
                          return (
                            <button
                              key={relId}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onJump(targetId);
                              }}
                              className="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-sm px-4 py-2 hover:border-red-300 dark:hover:border-red-900 hover:shadow-md transition-all flex items-center gap-3 rounded-sm"
                            >
                              <span className="font-sans font-bold text-red-600 dark:text-red-400">{targetId}</span> 
                              <span className="font-serif text-stone-700 dark:text-stone-300 text-sm">{titleWithoutId}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {hasChildren && !isSearchResult && (
              <div>
                {clause.subClauses!.map((subClause) => (
                  <ClauseItem key={subClause.id} clause={subClause} level={level + 1} defaultOpen={false} bookmarks={bookmarks} onToggleBookmark={onToggleBookmark} onJump={onJump} onTermClick={onTermClick} highlightQuery={highlightQuery} activeId={activeId} setActiveId={setActiveId} onLevel1Toggle={onLevel1Toggle} />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function BrowseMode() {
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'bookmarks'>('all');
  const [selectedTerm, setSelectedTerm] = useState<{term: string, definition: string} | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [openLevel1Id, setOpenLevel1Id] = useState<string | null>(null);

  useEffect(() => {
    const savedBookmarks = localStorage.getItem('iatf-bookmarks');
    if (savedBookmarks) {
      try { setBookmarks(JSON.parse(savedBookmarks)); } catch (e) {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('iatf-bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  const handleJump = (id: string) => {
    setActiveId(id);
    
    // 递归查找包含该 ID 的一级条款 ID
    const findRootId = (targetId: string) => {
      const containsId = (node: Clause, target: string): boolean => {
        if (node.id === target) return true;
        if (node.subClauses) {
          return node.subClauses.some(child => containsId(child, target));
        }
        return false;
      };

      for (const rootClause of iatfData) {
        if (containsId(rootClause, targetId)) return rootClause.id;
      }
      return null;
    };

    const rootId = findRootId(id);
    if (rootId) {
      setOpenLevel1Id(rootId);
    }
    
    setTimeout(() => {
      const element = document.getElementById(`clause-${id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        // 如果 DOM 中找不到，可能是因为尚未展开，但在 handleJump 中我们已经处理了展开逻辑
        // 如果还是找不到，尝试搜索
        setSearchQuery(id);
      }
    }, 100);
  };

  const handleTermClick = (termName: string) => {
    const term = glossaryData.find(t => t.term === termName);
    if (term) setSelectedTerm(term);
  };

  const handleLevel1Toggle = (id: string, isOpen: boolean) => {
    if (isOpen) {
      setOpenLevel1Id(id);
    } else if (openLevel1Id === id) {
      setOpenLevel1Id(null);
    }
  };

  const filteredClauses = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return flatIatfData.filter((clause) => 
      clause.id.toLowerCase().includes(query) || clause.title.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const bookmarkedClauses = useMemo(() => {
    return flatIatfData.filter(clause => bookmarks.includes(clause.id));
  }, [bookmarks]);

  const dynamicTocItems = useMemo(() => {
    if (!openLevel1Id) return [];
    const topClause = iatfData.find(c => c.id === openLevel1Id);
    if (!topClause) return [];
    
    const items: {id: string}[] = [];
    const collectIds = (nodes: Clause[]) => {
      nodes.forEach(n => {
        items.push({ id: n.id });
        if (n.subClauses && n.subClauses.length > 0) {
          collectIds(n.subClauses);
        }
      });
    };
    
    if (topClause.subClauses) {
      collectIds(topClause.subClauses);
    }
    
    return items;
  }, [openLevel1Id]);

  return (
    <div className="relative w-full">
      {openLevel1Id && dynamicTocItems.length > 0 && (
        <div className="absolute -left-36 top-0 bottom-0 w-32 hidden xl:block pointer-events-none z-10">
          <aside className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto hide-scrollbar animate-in fade-in slide-in-from-right-2 pointer-events-auto pr-2">
            <button 
              onClick={() => {
                setOpenLevel1Id(null);
                setActiveId(null);
              }}
              className="flex items-center gap-2 mb-6 text-[10px] uppercase font-bold tracking-[0.2em] text-stone-400 hover:text-red-700 pl-4 w-full text-left transition-colors"
              title="折叠所有条款并关闭目录"
            >
              <PanelLeftClose className="w-3.5 h-3.5" /> 目录
            </button>
            <div className="space-y-1">
              <button
                  onClick={() => handleJump(openLevel1Id)}
                  className={`w-full text-left px-4 py-2 text-sm font-sans font-bold transition-all border-l-2 hover:bg-stone-50/50 dark:hover:bg-stone-800/30 ${
                    activeId === openLevel1Id ? 'border-red-700 dark:border-red-500 text-red-700 dark:text-red-500' : 'border-transparent text-stone-800 dark:text-stone-200'
                  }`}
                >
                  {openLevel1Id}
              </button>
              {dynamicTocItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => handleJump(item.id)}
                  className={`w-full text-left px-4 py-1.5 text-xs font-sans transition-all border-l-2 hover:bg-stone-50/50 dark:hover:bg-stone-800/30 ${
                    activeId === item.id ? 'border-red-700 dark:border-red-500 text-red-700 dark:text-red-500 font-bold' : 'border-transparent text-stone-500 dark:text-stone-400'
                  }`}
                >
                  {item.id}
                </button>
              ))}
            </div>
          </aside>
        </div>
      )}

      <div className="bg-white dark:bg-stone-900 p-6 md:p-12 shadow-sm border border-black/5 dark:border-white/5 relative w-full min-h-[600px] z-20 transition-colors duration-500">
        <AnimatePresence>
          {selectedTerm && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/20 dark:bg-black/60 backdrop-blur-sm" onClick={() => setSelectedTerm(null)}>
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white dark:bg-stone-900 border border-black/10 dark:border-white/10 shadow-2xl p-8 max-w-lg w-full relative transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <button className="absolute top-4 right-4 text-stone-400 hover:text-stone-900 dark:hover:text-stone-100" onClick={() => setSelectedTerm(null)}>
                  <X className="w-5 h-5" />
                </button>
                <span className="text-[10px] uppercase font-bold tracking-widest text-red-700 dark:text-red-500 block mb-2">术语定义</span>
                <h4 className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100 mb-4">{selectedTerm.term}</h4>
                <div className="h-px bg-stone-100 dark:bg-stone-800 w-full mb-6" />
                <p className="text-stone-600 dark:text-stone-300 font-serif leading-relaxed whitespace-pre-line">{selectedTerm.definition}</p>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <header className="mb-0">
          <span className="text-xs font-mono text-stone-400 dark:text-stone-500">IATF 16949:2016</span>
          <h3 className="text-4xl font-serif mt-2 leading-tight text-stone-900 dark:text-stone-100">标准条款及解读</h3>
          
          <div className="mt-8 relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-stone-400 dark:text-stone-500" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-10 py-3 border border-black/10 dark:border-white/10 focus:border-black/30 dark:focus:border-white/30 focus:ring-0 text-sm font-serif bg-stone-50 dark:bg-stone-800/50 text-stone-900 dark:text-stone-100 outline-none transition-colors duration-500"
              placeholder="搜索条款编号或关键词..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex border-b border-black/5 dark:border-white/5 mt-8">
            <button 
              className={`pb-3 px-4 font-serif text-sm relative transition-colors ${activeTab === 'all' ? 'text-stone-900 dark:text-stone-100 font-bold' : 'text-stone-400 hover:text-stone-600'}`}
              onClick={() => { setActiveTab('all'); setSearchQuery(''); }}
            >
              所有条款
              {activeTab === 'all' && <motion.div layoutId="browseTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-700 dark:bg-red-500" />}
            </button>
            <button 
              className={`pb-3 px-4 font-serif text-sm relative transition-colors ${activeTab === 'bookmarks' ? 'text-stone-900 dark:text-stone-100 font-bold' : 'text-stone-400 hover:text-stone-600'}`}
              onClick={() => setActiveTab('bookmarks')}
            >
              我的书签 ({bookmarks.length})
              {activeTab === 'bookmarks' && <motion.div layoutId="browseTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-700 dark:bg-red-500" />}
            </button>
          </div>
        </header>
        
        <div className="divide-y divide-black/5">
          {activeTab === 'bookmarks' ? (
            bookmarkedClauses.map((clause) => (
              <ErrorBoundary key={clause.id}>
                <ClauseItem clause={clause} isSearchResult={true} bookmarks={bookmarks} onToggleBookmark={setBookmarks as any} onJump={handleJump} onTermClick={handleTermClick} activeId={activeId} setActiveId={setActiveId} onLevel1Toggle={handleLevel1Toggle} />
              </ErrorBoundary>
            ))
          ) : searchQuery.trim() ? (
            filteredClauses.map((clause) => (
              <ErrorBoundary key={clause.id}>
                <ClauseItem clause={clause} isSearchResult={true} bookmarks={bookmarks} onToggleBookmark={setBookmarks as any} onJump={handleJump} onTermClick={handleTermClick} highlightQuery={searchQuery} activeId={activeId} setActiveId={setActiveId} onLevel1Toggle={handleLevel1Toggle} />
              </ErrorBoundary>
            ))
          ) : (
            iatfData.map((clause) => (
              <ErrorBoundary key={clause.id}>
                <ClauseItem clause={clause} bookmarks={bookmarks} onToggleBookmark={setBookmarks as any} onJump={handleJump} onTermClick={handleTermClick} activeId={activeId} setActiveId={setActiveId} onLevel1Toggle={handleLevel1Toggle} defaultOpen={openLevel1Id === clause.id} />
              </ErrorBoundary>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
