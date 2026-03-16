/**
 * Sora2视频生成组件
 * 输入文案即可生成创意视频
 *
 * 【修改说明】
 * - 修改UI界面样式
 * - 接入其他大模型（如Runway、Pika等）
 */

import React, { useState } from 'react';

// ========== 【可修改】模型配置 ==========
const MODEL_CONFIG = {
  // 当前模型：即梦
  jimeng: {
    name: '即梦',
    submitUrl: '/api/jimeng/video/generate',
    statusUrl: '/api/jimeng/video/result',
    modelName: 'jimeng_ti2v_v30_pro'
  },

  // ========== 【新增】其他大模型配置 ==========
  runway: {
    name: 'Runway Gen-3',
    submitUrl: '/api/runway/v1/generate',
    statusUrl: '/api/runway/v1/status',
    modelName: 'runway-gen3-turbo'
  },

  pika: {
    name: 'Pika Labs',
    submitUrl: '/api/pika/v1/generate',
    statusUrl: '/api/pika/v1/status',
    modelName: 'pika-1.0'
  },

  kling: {
    name: '可灵',
    submitUrl: '/api/kling/v1/videos/text2video',
    statusUrl: '/api/kling/v1/videos/query',
    modelName: 'kling-v1'
  }
};

interface VideoResult {
  taskId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  videoUrl?: string;
  coverUrl?: string;
}

interface Sora2VideoGeneratorProps {
  defaultModel?: keyof typeof MODEL_CONFIG;
  apiEndpoint?: string;
  modelName?: string;
}

export const Sora2VideoGenerator: React.FC<Sora2VideoGeneratorProps> = ({
  defaultModel = 'jimeng'
}) => {
  // ========== 【修改】添加模型选择功能 ==========
  const [selectedModel, setSelectedModel] = useState<keyof typeof MODEL_CONFIG>(defaultModel);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<VideoResult | null>(null);
  const [progress, setProgress] = useState(0);

  // 获取当前选择的模型配置
  const currentModel = MODEL_CONFIG[selectedModel];

  const generateVideo = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setProgress(0);
    setResult(null);

    try {
      // ========== 【修改】使用选择的模型API ==========
      const submitResponse = await fetch(currentModel.submitUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: currentModel.modelName,
          prompt: prompt.trim(),
          duration: 'auto'
        })
      });

      if (!submitResponse.ok) throw new Error('任务提交失败');

      const submitData = await submitResponse.json();
      const taskId = submitData.task_id || submitData.data?.task_id;

      if (!taskId) throw new Error('未获取到任务ID');

      setResult({ taskId, status: 'pending' });

      // 轮询任务状态
      await pollTaskStatus(taskId);

    } catch (error) {
      setResult({ taskId: '', status: 'failed' });
    } finally {
      setIsGenerating(false);
    }
  };

  const pollTaskStatus = async (taskId: string) => {
    const maxAttempts = 120;
    let attempts = 0;

    const poll = async (): Promise<void> => {
      attempts++;
      setProgress(Math.min(95, attempts * 0.8));

      try {
        // ========== 【修改】使用选择的模型状态API ==========
        const response = await fetch(`${currentModel.statusUrl}?task_id=${taskId}`);
        const data = await response.json();

        const status = data.status || data.data?.status;
        const videoUrl = data.video_url || data.data?.video_url;
        const coverUrl = data.cover_url || data.data?.cover_url;

        if (status === 'completed' && videoUrl) {
          setProgress(100);
          setResult({ taskId, status: 'completed', videoUrl, coverUrl });
          deductCompute(500);
          return;
        }

        if (status === 'failed') {
          setResult({ taskId, status: 'failed' });
          return;
        }

        if (attempts < maxAttempts) {
          setTimeout(poll, 1000);
        } else {
          setResult({ taskId, status: 'failed' });
        }
      } catch {
        if (attempts < maxAttempts) {
          setTimeout(poll, 1000);
        }
      }
    };

    await poll();
  };

  const deductCompute = (cost: number) => {
    if (window.deductUserCompute) {
      window.deductUserCompute(cost, 'Sora2视频生成');
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-lg">
      {/* ========== 【修改】头部样式 ========== */}
      <div className="p-4 border-b bg-gradient-to-r from-blue-500 to-indigo-500 rounded-t-xl">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <span>🎬</span> Sora2 视频生成
        </h2>
        <p className="text-sm text-white/80">输入文案即可生成创意视频</p>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 p-4">
        {/* ========== 【新增】模型选择下拉框 ========== */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            选择模型
          </label>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value as keyof typeof MODEL_CONFIG)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Object.entries(MODEL_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>
                {config.name}
              </option>
            ))}
          </select>
        </div>

        {/* 视频描述输入 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            视频描述
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="描述你想要生成的视频内容..."
            className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
          />
        </div>

        {/* 生成按钮 */}
        <button
          onClick={generateVideo}
          disabled={!prompt.trim() || isGenerating}
          className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg
            hover:from-blue-600 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed
            transition-all flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              生成中... {progress.toFixed(0)}%
            </>
          ) : (
            <>🎬 生成视频</>
          )}
        </button>

        {/* 进度条 */}
        {isGenerating && progress > 0 && (
          <div className="mt-4">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-gray-500 mt-1 text-center">
              正在使用 {currentModel.name} 生成视频...
            </p>
          </div>
        )}

        {/* 结果展示 */}
        {result?.status === 'completed' && result.videoUrl && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">生成结果</h3>
            <video
              src={result.videoUrl}
              controls
              className="w-full rounded-lg border"
              poster={result.coverUrl}
            />
            <div className="mt-3 flex gap-2">
              <a
                href={result.videoUrl}
                download
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
              >
                📥 下载视频
              </a>
            </div>
          </div>
        )}

        {result?.status === 'failed' && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600">
            视频生成失败，请重试
          </div>
        )}
      </div>
    </div>
  );
};

// 全局类型声明
declare global {
  interface Window {
    deductUserCompute?: (cost: number, feature: string) => boolean;
  }
}

export default Sora2VideoGenerator;
