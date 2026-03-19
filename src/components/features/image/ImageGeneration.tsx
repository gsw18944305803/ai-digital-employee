/**
 * AI生图组件
 * 输入提示词，一键生成高质量创意图片
 */

import React, { useState } from 'react';

interface ImageResult {
  url: string;
  revisedPrompt?: string;
}

interface AIImageGenerationProps {
  apiEndpoint?: string;
  modelName?: string;
}

export const AIImageGeneration: React.FC<AIImageGenerationProps> = ({
  apiEndpoint = '/api/302/v1/images/generations',
  modelName = 'dall-e-3'
}) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<ImageResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateImage = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: modelName,
          prompt: prompt.trim(),
          n: 1,
          size: '1024x1024',
          quality: 'standard'
        })
      });

      if (!response.ok) {
        throw new Error('图片生成失败');
      }

      const data = await response.json();
      const imageUrl = data.data?.[0]?.url;
      const revisedPrompt = data.data?.[0]?.revised_prompt;

      if (imageUrl) {
        setResult({ url: imageUrl, revisedPrompt });
        deductCompute(50);
      } else {
        throw new Error('未返回图片URL');
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败，请重试');
    } finally {
      setIsGenerating(false);
    }
  };

  const deductCompute = (cost: number) => {
    if (window.deductUserCompute) {
      window.deductUserCompute(cost, 'AI生图');
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-lg">
      {/* 头部 */}
      <div className="p-4 border-b bg-gradient-to-r from-pink-500 to-rose-500 rounded-t-xl">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <span>���</span> AI生图
        </h2>
        <p className="text-sm text-white/80">输入提示词，一键生成高质量创意图片</p>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 p-4">
        {/* 提示词输入 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            图片描述
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="描述你想要生成的图片，例如：一只穿着宇航服的猫在月球上漫步..."
            className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-pink-500"
            rows={4}
          />
        </div>

        {/* 生成按钮 */}
        <button
          onClick={generateImage}
          disabled={!prompt.trim() || isGenerating}
          className="w-full py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg
            hover:from-pink-600 hover:to-rose-600 disabled:opacity-50 disabled:cursor-not-allowed
            transition-all flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              生成中...
            </>
          ) : (
            <>🎨 生成图片</>
          )}
        </button>

        {/* 错误提示 */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600">
            {error}
          </div>
        )}

        {/* 结果展示 */}
        {result && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">生成结果</h3>
            <div className="relative rounded-lg overflow-hidden border">
              <img
                src={result.url}
                alt="AI生成的图片"
                className="w-full h-auto"
              />
            </div>
            {result.revisedPrompt && (
              <p className="mt-2 text-sm text-gray-500">
                <span className="font-medium">优化后的提示词：</span>
                {result.revisedPrompt}
              </p>
            )}
            <div className="mt-3 flex gap-2">
              <a
                href={result.url}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
              >
                📥 下载图片
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIImageGeneration;
