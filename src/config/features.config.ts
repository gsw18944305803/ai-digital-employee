/**
 * 功能配置文件
 * 包含所有27个功能的配置信息
 */

export interface FeatureConfig {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  route: string;
  apiEndpoint?: string;
  modelName?: string;
  computeCost?: number;
}

// 主页功能卡片配置 (8个)
export const homeFeatures: FeatureConfig[] = [
  {
    id: 'ai-chat',
    name: 'AI 聊天',
    icon: 'MessageSquare',
    color: 'cyan-500',
    description: '与AI进行自由对话，支持多种大模型',
    route: '/backend?title=AI 聊天',
    apiEndpoint: '/api/302/chat/completions',
    modelName: 'glm-4.7-flashx',
    computeCost: 3
  },
  {
    id: 'ai-image',
    name: 'AI生图',
    icon: 'Image',
    color: 'pink-500',
    description: '输入提示词，一键生成高质量创意图片',
    route: '/backend?title=AI生图',
    apiEndpoint: '/api/302/v1/images/generations',
    modelName: 'dall-e-3',
    computeCost: 50
  },
  {
    id: 'video-pipeline',
    name: '一站式视频创作流水线',
    icon: 'Video',
    color: 'purple-500',
    description: '跨平台抓取热门内容，AI智能创作',
    route: '/backend?title=一站式视频创作流水线',
    computeCost: 100
  },
  {
    id: 'sora2-video',
    name: 'Sora2 视频生成',
    icon: 'Video',
    color: 'blue-500',
    description: '输入文案即可生成创意视频',
    route: '/backend?title=Sora2 视频生成',
    apiEndpoint: '/api/jimeng/video/generate',
    modelName: 'jimeng_ti2v_v30_pro',
    computeCost: 500
  },
  {
    id: 'video-extract',
    name: '多平台视频数据一键提取',
    icon: 'Database',
    color: 'red-500',
    description: '提取小红书、抖音视频数据',
    route: '/backend?title=多平台视频数据一键提取',
    computeCost: 15
  },
  {
    id: 'poster-video',
    name: '宣传海报、视频制作',
    icon: 'Film',
    color: 'orange-500',
    description: '上传素材自动生成产品宣传视频',
    route: '/backend?title=宣传海报、视频制作',
    computeCost: 200
  },
  {
    id: 'veo-video',
    name: 'Veo3.1 视频生成',
    icon: 'Sparkles',
    color: 'indigo-500',
    description: '使用高级模型生成逼真视频',
    route: '/backend?title=Veo3.1 视频生成',
    computeCost: 800
  },
  {
    id: 'franchise',
    name: '招商加盟',
    icon: 'Briefcase',
    color: 'green-500',
    description: '一键生成招商加盟方案与宣传物料',
    route: '/backend?title=招商加盟',
    computeCost: 150
  }
];

// 侧栏 - 图片处理类 (4个)
export const imageFeatures: FeatureConfig[] = [
  {
    id: 'drawing-bot',
    name: '绘画机器人',
    icon: 'Palette',
    color: 'purple-400',
    description: 'Midjourney风格AI绘画',
    route: '/backend?title=绘画机器人',
    apiEndpoint: '/api/302/v1/images/generations',
    modelName: 'dall-e-3'
  },
  {
    id: 'image-translate',
    name: 'AI 图片翻译',
    icon: 'Languages',
    color: 'red-400',
    description: '翻译图片中的文字',
    route: '/backend?title=AI 图片翻译',
    apiEndpoint: '/api/302/v1/chat/completions',
    modelName: 'gpt-4o'
  },
  {
    id: 'avatar-maker',
    name: 'AI 头像制作',
    icon: 'UserCircle',
    color: 'green-400',
    description: '个性化AI头像生成',
    route: '/backend?title=AI 头像制作',
    apiEndpoint: '/api/302/v1/images/generations',
    modelName: 'dall-e-3'
  },
  {
    id: '3d-modeling',
    name: 'AI 3D 建模',
    icon: 'Box',
    color: 'green-400',
    description: '图片转3D模型',
    route: '/backend?title=AI 3D 建模',
    apiEndpoint: '/api/302/tripo3d/v2/openapi/upload',
    modelName: 'Tripo3D-v2.5'
  }
];

// 侧栏 - 信息处理类 (5个)
export const infoFeatures: FeatureConfig[] = [
  {
    id: 'sora2-storyboard',
    name: 'Sora2 故事板',
    icon: 'Layout',
    color: 'yellow-400',
    description: '多场景视频故事创作',
    route: '/backend?title=Sora2 故事板'
  },
  {
    id: 'translate-master',
    name: 'AI翻译大师',
    icon: 'Globe',
    color: 'blue-400',
    description: '多语言翻译',
    route: '/backend?title=AI翻译大师',
    apiEndpoint: '/api/302/chat/completions',
    modelName: 'qwen-plus'
  },
  {
    id: 'prompt-expert',
    name: 'AI提示词专家',
    icon: 'Lightbulb',
    color: 'green-400',
    description: '提示词生成优化',
    route: '/backend?title=AI提示词专家',
    apiEndpoint: '/api/302/chat/completions',
    modelName: 'glm-4.7-flashx'
  },
  {
    id: 'search-master',
    name: 'AI搜索大师3.0',
    icon: 'Search',
    color: 'orange-400',
    description: '智能搜索',
    route: '/backend?title=AI搜索大师3.0',
    apiEndpoint: '/api/302/chat/completions'
  },
  {
    id: 'web-crawler',
    name: '网页数据提取工具',
    icon: 'Globe',
    color: 'purple-400',
    description: '结构化数据提取',
    route: '/backend?title=网页数据提取工具',
    apiEndpoint: '/api/302/302/crawler/task'
  }
];

// 侧栏 - 工作效率类 (4个)
export const workFeatures: FeatureConfig[] = [
  {
    id: 'copywriting',
    name: 'AI文案助手',
    icon: 'FileText',
    color: 'purple-400',
    description: '文案创作助手',
    route: '/backend?title=AI文案助手',
    apiEndpoint: '/api/302/302/writing/api/v1/generate'
  },
  {
    id: 'ecommerce-copy',
    name: 'AI电商文案助手',
    icon: 'ShoppingCart',
    color: 'teal-400',
    description: '电商专用文案',
    route: '/backend?title=AI电商文案助手',
    apiEndpoint: '/api/302/302/writing/api/v1/generate'
  },
  {
    id: 'doc-editor',
    name: 'AI文档编辑器',
    icon: 'FileEdit',
    color: 'blue-400',
    description: '长文档生成编辑',
    route: '/backend?title=AI文档编辑器',
    apiEndpoint: '/api/302/302/writing/api/v1/longtext/generate'
  },
  {
    id: 'ppt-maker',
    name: 'AI PPT制作',
    icon: 'Presentation',
    color: 'red-400',
    description: '演示文稿生成',
    route: '/backend?title=AI PPT制作',
    apiEndpoint: '/api/302/302/ppt/directgeneratepptx',
    computeCost: 60
  }
];

// 侧栏 - 学术相关类 (3个)
export const academicFeatures: FeatureConfig[] = [
  {
    id: 'paper-search',
    name: 'AI学术论文搜索',
    icon: 'Search',
    color: 'purple-400',
    description: '学术论文检索',
    route: '/backend?title=AI学术论文搜索'
  },
  {
    id: 'patent-search',
    name: 'AI专利搜索',
    icon: 'Search',
    color: 'teal-400',
    description: '全球专利搜索',
    route: '/backend?title=AI专利搜索',
    apiEndpoint: '/api/302/302/search/patent'
  },
  {
    id: 'paper-writing',
    name: 'AI论文写作',
    icon: 'PenTool',
    color: 'blue-400',
    description: '学术论文写作',
    route: '/backend?title=AI论文写作'
  }
];

// 侧栏 - 音频相关类 (1个)
export const audioFeatures: FeatureConfig[] = [
  {
    id: 'voice-generator',
    name: 'AI语音生成器',
    icon: 'Mic',
    color: 'blue-400',
    description: '文本转语音',
    route: '/backend?title=AI语音生成器',
    apiEndpoint: '/api/302/bigmodel/api/paas/v4/audio/transmissions',
    computeCost: 15
  }
];

// 侧栏 - 实用工具类 (5个)
export const toolFeatures: FeatureConfig[] = [
  {
    id: 'media2doc',
    name: '音视频转文档',
    icon: 'Video',
    color: 'purple-400',
    description: '音视频内容转文字',
    route: '/media2doc'
  },
  {
    id: 'excel-processor',
    name: 'AI处理Excel',
    icon: 'Table',
    color: 'green-400',
    description: '一句话处理Excel',
    route: '/excel-processor'
  },
  {
    id: 'free-apis',
    name: '免费API汇总',
    icon: 'Globe',
    color: 'teal-400',
    description: '全球免费API收集',
    route: '/free-apis'
  },
  {
    id: 'viral-video',
    name: '抓取爆款视频',
    icon: 'Video',
    color: 'orange-400',
    description: '爆款视频抓取分析',
    route: '/backend?title=抓取爆款视频',
    computeCost: 10
  },
  {
    id: 'trending',
    name: '热点实时聚合',
    icon: 'TrendingUp',
    color: 'pink-400',
    description: 'GitHub热点聚合',
    route: '/trending-topics'
  }
];

// 所有功能合集
export const allFeatures: FeatureConfig[] = [
  ...homeFeatures,
  ...imageFeatures,
  ...infoFeatures,
  ...workFeatures,
  ...academicFeatures,
  ...audioFeatures,
  ...toolFeatures
];

// 侧栏分类
export const sidebarCategories = [
  { name: '图片处理', features: imageFeatures },
  { name: '信息处理', features: infoFeatures },
  { name: '工作效率', features: workFeatures },
  { name: '学术相关', features: academicFeatures },
  { name: '音频相关', features: audioFeatures },
  { name: '实用工具', features: toolFeatures }
];
