/**
 * 功能卡片组件
 * 用于主页展示功能入口
 */

import React from 'react';
import { FeatureConfig } from '../../config/features.config';

interface FeatureCardProps {
  feature: FeatureConfig;
  onClick?: () => void;
}

// 图标组件映射
const IconComponents: Record<string, React.FC<{ className?: string }>> = {
  'MessageSquare': ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  'Image': ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21,15 16,10 5,21" />
    </svg>
  ),
  'Video': ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="23,7 16,12 23,17 23,7" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  ),
  'Database': ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
  ),
  'Briefcase': ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  ),
  'Search': ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
};

// 颜色类映射
const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
  'cyan-500': { bg: 'bg-cyan-500', text: 'text-cyan-500', border: 'border-cyan-500' },
  'pink-500': { bg: 'bg-pink-500', text: 'text-pink-500', border: 'border-pink-500' },
  'purple-500': { bg: 'bg-purple-500', text: 'text-purple-500', border: 'border-purple-500' },
  'blue-500': { bg: 'bg-blue-500', text: 'text-blue-500', border: 'border-blue-500' },
  'red-500': { bg: 'bg-red-500', text: 'text-red-500', border: 'border-red-500' },
  'orange-500': { bg: 'bg-orange-500', text: 'text-orange-500', border: 'border-orange-500' },
  'indigo-500': { bg: 'bg-indigo-500', text: 'text-indigo-500', border: 'border-indigo-500' },
  'green-500': { bg: 'bg-green-500', text: 'text-green-500', border: 'border-green-500' }
};

export const FeatureCard: React.FC<FeatureCardProps> = ({ feature, onClick }) => {
  const colors = colorClasses[feature.color] || colorClasses['blue-500'];
  const IconComponent = IconComponents[feature.icon] || IconComponents['MessageSquare'];

  return (
    <a
      href={feature.route}
      onClick={onClick}
      className="block group"
    >
      <div className={`
        relative overflow-hidden rounded-xl p-6
        bg-white border border-gray-200
        hover:border-2 ${colors.border}
        transition-all duration-300
        hover:shadow-lg hover:-translate-y-1
      `}>
        {/* 图标 */}
        <div className={`
          w-12 h-12 rounded-lg ${colors.bg} bg-opacity-10
          flex items-center justify-center mb-4
          group-hover:scale-110 transition-transform
        `}>
          <IconComponent className={`w-6 h-6 ${colors.text}`} />
        </div>

        {/* 标题 */}
        <h3 className="font-semibold text-gray-800 mb-2 group-hover:text-gray-900">
          {feature.name}
        </h3>

        {/* 描述 */}
        <p className="text-sm text-gray-500 mb-3">
          {feature.description}
        </p>

        {/* 算力消耗标签 */}
        {feature.computeCost && (
          <div className="absolute top-4 right-4">
            <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700">
              {feature.computeCost} 算力
            </span>
          </div>
        )}

        {/* 箭头 */}
        <div className={`
          absolute bottom-4 right-4
          opacity-0 group-hover:opacity-100
          transition-opacity
        `}>
          <svg className={`w-5 h-5 ${colors.text}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </a>
  );
};

// 功能卡片网格
interface FeatureGridProps {
  features: FeatureConfig[];
  columns?: number;
}

export const FeatureGrid: React.FC<FeatureGridProps> = ({ features, columns = 4 }) => {
  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  };

  return (
    <div className={`grid ${gridCols[columns as keyof typeof gridCols]} gap-4`}>
      {features.map((feature) => (
        <FeatureCard key={feature.id} feature={feature} />
      ))}
    </div>
  );
};

export default FeatureCard;
