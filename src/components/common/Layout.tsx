/**
 * 布局组件
 * 包含主布局、侧边栏、顶部导航
 */

import React from 'react';
import { homeFeatures, sidebarCategories, FeatureConfig } from '../config/features.config';

interface LayoutProps {
  children: React.ReactNode;
  currentFeature?: string;
}

// 侧边栏组件
export const Sidebar: React.FC<{ currentFeature?: string }> = ({ currentFeature }) => {
  return (
    <aside className="w-64 bg-gray-900 min-h-screen p-4 overflow-y-auto">
      {/* Logo */}
      <div className="mb-6 p-2">
        <h1 className="text-xl font-bold text-white">AI数字员工</h1>
        <p className="text-xs text-gray-400">智能AI工具平台</p>
      </div>

      {/* 主页入口 */}
      <div className="mb-4">
        <a
          href="/"
          className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
        >
          <span>🏠</span>
          <span>主页</span>
        </a>
      </div>

      {/* 功能分类 */}
      {sidebarCategories.map((category) => (
        <div key={category.name} className="mb-4">
          <h3 className="text-xs text-gray-500 uppercase mb-2 px-2">{category.name}</h3>
          <div className="space-y-1">
            {category.features.map((feature) => (
              <SidebarItem
                key={feature.id}
                feature={feature}
                isActive={currentFeature === feature.id}
              />
            ))}
          </div>
        </div>
      ))}
    </aside>
  );
};

// 侧边栏项目
const SidebarItem: React.FC<{ feature: FeatureConfig; isActive: boolean }> = ({
  feature,
  isActive
}) => {
  return (
    <a
      href={feature.route}
      className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
        isActive
          ? 'bg-blue-600 text-white'
          : 'text-gray-300 hover:bg-gray-800'
      }`}
    >
      <span>{getIconEmoji(feature.icon)}</span>
      <span className="text-sm">{feature.name}</span>
    </a>
  );
};

// 图标转Emoji
function getIconEmoji(icon: string): string {
  const iconMap: Record<string, string> = {
    'MessageSquare': '💬',
    'Image': '🎨',
    'Video': '🎬',
    'Database': '📊',
    'Film': '🎥',
    'Sparkles': '✨',
    'Briefcase': '💼',
    'Palette': '🎨',
    'Languages': '🌐',
    'UserCircle': '👤',
    'Box': '🧊',
    'Layout': '📋',
    'Globe': '🌍',
    'Lightbulb': '💡',
    'Search': '🔍',
    'FileText': '✍️',
    'ShoppingCart': '🛒',
    'FileEdit': '📄',
    'Presentation': '📊',
    'PenTool': '✒️',
    'Mic': '🎙️',
    'Table': '📈',
    'TrendingUp': '🔥'
  };
  return iconMap[icon] || '🔹';
}

// 主布局组件
export const Layout: React.FC<LayoutProps> = ({ children, currentFeature }) => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar currentFeature={currentFeature} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default Layout;
