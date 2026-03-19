import React, { useState } from 'react';

const PatentSearch: React.FC = () => {
  const [keyword, setKeyword] = useState('');

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">AI专利搜索</h2>
        <p className="text-sm text-gray-400">智能AI助手为您服务，请输入您的需求，我们将快速为您生成高质量结果。</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧输入区域 */}
        <div className="lg:col-span-1 space-y-6">
          <section className="bg-ai-card border border-white/5 rounded-2xl p-5 space-y-4 h-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center text-blue-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-text">
                    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path>
                    <path d="M14 2v4a2 2 0 0 0 2 2h4"></path>
                    <path d="M10 9H8"></path>
                    <path d="M16 13H8"></path>
                    <path d="M16 17H8"></path>
                  </svg>
                </span>
                <div className="text-sm font-medium">请输入技术关键词或发明描述</div>
              </div>
              <button 
                className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                onClick={() => setKeyword('')}
              >
                清空
              </button>
            </div>

            <div className="relative">
              <div className="absolute top-2 right-2 z-10">
                <div className="flex items-center gap-2">
                  <button disabled className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium transition-all bg-gray-100 text-gray-400 cursor-not-allowed" title="使用AI优化提示词">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sparkles">
                      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"></path>
                      <path d="M20 3v4"></path>
                      <path d="M22 5h-4"></path>
                      <path d="M4 17v2"></path>
                      <path d="M5 18H3"></path>
                    </svg>
                    优化提示词
                  </button>
                </div>
              </div>
              <textarea 
                className="w-full h-64 bg-ai-card border border-white/10 rounded-xl p-4 pr-24 text-sm text-gray-100 placeholder-gray-400 outline-none resize-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-colors" 
                placeholder="请输入发明的技术领域、核心创新点或关键词..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              ></textarea>
              <div className="absolute bottom-3 right-3 text-xs text-gray-400">{keyword.length} 字</div>
            </div>

            <div className="flex items-center gap-3">
              <button disabled={!keyword} className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-medium transition-all ${keyword ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-white/5 text-gray-400 cursor-not-allowed'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sparkles">
                  <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"></path>
                  <path d="M20 3v4"></path>
                  <path d="M22 5h-4"></path>
                  <path d="M4 17v2"></path>
                  <path d="M5 18H3"></path>
                </svg>
                <span>检索专利</span>
              </button>
              <span className="inline-flex items-center bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full font-medium text-xs px-2 py-1 gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-zap fill-amber-500/20">
                  <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path>
                </svg>
                <span>100 算力</span>
              </span>
            </div>
          </section>
        </div>

        {/* 右侧结果展示区域 */}
        <div className="lg:col-span-2">
          <section className="bg-ai-card border border-white/5 rounded-2xl p-6 h-full min-h-[500px] flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-purple-500/15 flex items-center justify-center text-purple-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-check-big">
                    <path d="M21.801 10A10 10 0 1 1 17 3.335"></path>
                    <path d="m9 11 3 3L22 4"></path>
                  </svg>
                </span>
                <div className="text-sm font-medium">生成结果</div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 rounded-lg transition-colors text-gray-500 cursor-not-allowed" title="复制" disabled>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-copy">
                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-ai-dark/20 rounded-xl border border-dashed border-white/5">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sparkles">
                  <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"></path>
                  <path d="M20 3v4"></path>
                  <path d="M22 5h-4"></path>
                  <path d="M4 17v2"></path>
                  <path d="M5 18H3"></path>
                </svg>
              </div>
              <p className="text-sm text-gray-300">结果将在此处展示</p>
              <p className="text-xs text-gray-400 mt-2">请在左侧输入内容并点击生成</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PatentSearch;
