/**
 * API配置文件
 * 包含所有API端点和模型配置
 */

export interface ApiConfig {
  name: string;
  provider: string;
  apiUrl: string;
  modelName?: string;
  submitUrl?: string;
  statusUrl?: string;
  botId?: string;
}

// 模型API配置
export const models: Record<string, ApiConfig> = {
  // 聊天模型
  chat: {
    name: 'AI对话 (AIChat)',
    provider: 'openai',
    apiUrl: '/api/302/chat/completions',
    modelName: 'gpt-4o'
  },

  // 图片生成
  image: {
    name: 'AI生图 (DALL-E)',
    provider: 'dall-e',
    apiUrl: '/api/302/v1/images/generations',
    modelName: 'dall-e-3'
  },

  // Sora视频
  sora: {
    name: 'Sora2 视频生成',
    provider: 'custom',
    apiUrl: '/api/jimeng/video/generate',
    submitUrl: '/api/jimeng/video/generate',
    statusUrl: '/api/jimeng/video/result?task_id={id}',
    modelName: 'jimeng_ti2v_v30_pro'
  },

  // 视频创作流水线
  video_pipeline: {
    name: '一站式视频创作',
    provider: 'coze',
    apiUrl: '/api/coze/workflow/run',
    botId: '7597999195278376960'
  },

  // 数据提取
  data_extraction: {
    name: '多平台数据提取',
    provider: 'coze',
    apiUrl: '/api/coze/bot/chat',
    botId: '7597999195278376960'
  },

  // 3D建模
  '3d_modeling': {
    name: 'AI 3D建模',
    provider: 'tripo3d',
    apiUrl: '/api/302/tripo3d/v2/openapi/upload',
    modelName: 'Tripo3D-v2.5'
  },

  // 语音合成
  tts: {
    name: 'AI语音生成',
    provider: 'bigmodel',
    apiUrl: '/api/302/bigmodel/api/paas/v4/audio/transmissions',
    modelName: 'tts-1'
  },

  // PPT生成
  ppt: {
    name: 'AI PPT制作',
    provider: '302',
    apiUrl: '/api/302/302/ppt/directgeneratepptx'
  }
};

// 各功能的API配置
export const featureApis: Record<string, Partial<ApiConfig>> = {
  '绘画机器人': {
    apiUrl: '/api/302/v1/images/generations',
    modelName: 'dall-e-3'
  },
  'AI 图片翻译': {
    apiUrl: '/api/302/v1/chat/completions',
    modelName: 'gpt-4o'
  },
  'AI 头像制作': {
    apiUrl: '/api/302/v1/images/generations',
    modelName: 'dall-e-3'
  },
  'AI 3D 建模': {
    apiUrl: '/api/302/tripo3d/v2/openapi/upload',
    modelName: 'Tripo3D-v2.5'
  },
  'AI搜索大师3.0': {
    apiUrl: '/api/302/chat/completions',
    modelName: 'gpt-4o'
  },
  '网页数据提取工具': {
    apiUrl: '/api/302/302/crawler/task'
  },
  'AI 聊天': {
    apiUrl: '/api/302/chat/completions',
    modelName: 'glm-4.7-flashx'
  },
  'AI翻译大师': {
    apiUrl: '/api/302/chat/completions',
    modelName: 'qwen-plus'
  },
  'AI提示词专家': {
    apiUrl: '/api/302/chat/completions',
    modelName: 'glm-4.7-flashx'
  },
  'AI文案助手': {
    apiUrl: '/api/302/302/writing/api/v1/generate'
  },
  'AI电商文案助手': {
    apiUrl: '/api/302/302/writing/api/v1/generate'
  },
  'AI文档编辑器': {
    apiUrl: '/api/302/302/writing/api/v1/longtext/generate'
  },
  'AI PPT制作': {
    apiUrl: '/api/302/302/ppt/directgeneratepptx'
  },
  'AI���利搜索': {
    apiUrl: '/api/302/302/search/patent'
  },
  'AI语音生成器': {
    apiUrl: '/api/302/bigmodel/api/paas/v4/audio/transmissions'
  }
};

// API基础URL
export const API_BASE_URL = '/api/302';

// 请求超时配置
export const REQUEST_TIMEOUT = 60000; // 60秒

// 重试配置
export const RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000
};
