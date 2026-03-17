/**
 * AI数字员工聚合网站 - 主应用
 * 使用 React + TypeScript + Vite 构建
 */

import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';

// 导入功能组件
import { AIChat } from './components/features/chat/AIChat';
import { AIImageGeneration } from './components/features/image/ImageGeneration';
import { Sora2VideoGenerator } from './components/features/video/Sora2VideoGenerator';

// 功能配置
const features = [
  // 主页功能
  { id: 'ai-chat', name: 'AI聊天', icon: '💬', color: 'from-cyan-500 to-blue-500', category: 'main', component: AIChat },
  { id: 'ai-image', name: 'AI生图', icon: '🎨', color: 'from-pink-500 to-rose-500', category: 'main', component: AIImageGeneration },
  { id: 'sora2-video', name: 'Sora2视频', icon: '🎬', color: 'from-blue-500 to-indigo-500', category: 'main', component: Sora2VideoGenerator },

  // 可以继续添加更多功能...
];

// 侧边栏导航项
const sidebarItems = [
  { id: 'home', name: '主页', icon: '🏠' },
  { id: 'ai-chat', name: 'AI聊天', icon: '💬' },
  { id: 'ai-image', name: 'AI生图', icon: '🎨' },
  { id: 'sora2-video', name: 'Sora2视频', icon: '🎬' },
];

// 主页组件
const HomePage: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">AI数字员工</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.filter(f => f.category === 'main').map(feature => (
          <Link
            key={feature.id}
            to={`/${feature.id}`}
            className={`p-6 rounded-xl bg-gradient-to-r ${feature.color} text-white hover:opacity-90 transition-opacity`}
          >
            <div className="text-3xl mb-2">{feature.icon}</div>
            <div className="text-lg font-semibold">{feature.name}</div>
          </Link>
        ))}
      </div>
    </div>
  );
};

// 功能页面组件
const FeaturePage: React.FC<{ featureId: string }> = ({ featureId }) => {
  const feature = features.find(f => f.id === featureId);

  if (!feature) {
    return (
      <div className="p-6">
        <h1 className="text-xl text-gray-500">功能未找到</h1>
        <Link to="/" className="text-blue-500 hover:underline">返回主页</Link>
      </div>
    );
  }

  const Component = feature.component;
  return (
    <div className="h-full p-4">
      <Component />
    </div>
  );
};

// 布局组件
const Layout: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname.slice(1) || 'home';

  return (
    <div className="flex h-screen bg-gray-100">
      {/* 侧边栏 */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-gray-800">AI数字员工</h1>
        </div>
        <nav className="p-2">
          {sidebarItems.map(item => (
            <Link
              key={item.id}
              to={item.id === 'home' ? '/' : `/${item.id}`}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                currentPath === item.id
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/:featureId" element={<FeatureWrapper />} />
        </Routes>
      </div>
    </div>
  );
};

// 功能页面包装器
const FeatureWrapper: React.FC = () => {
  const location = useLocation();
  const featureId = location.pathname.slice(1);
  return <FeaturePage featureId={featureId} />;
};

// 主应用
const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
};

export default App;
