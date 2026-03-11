# -*- coding: utf-8 -*-
import codecs
import sys

# Read the file
with codecs.open('src/components/admin/UserKnowledgeBase.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find the start and end of the generateAIPrompt function
start_line = None
end_line = None

for i, line in enumerate(lines):
    if 'generateAIPrompt = async' in line:
        start_line = i - 1  # Include the comment line before
        # Find the closing of this function
        brace_count = 0
        for j in range(i, len(lines)):
            brace_count += lines[j].count('{')
            brace_count -= lines[j].count('}')
            if brace_count == 0 and '}' in lines[j]:
                end_line = j + 1
                break
        break

if start_line is None or end_line is None:
    print(f"ERROR: Could not find function boundaries. start={start_line}, end={end_line}")
    sys.exit(1)

print(f"Found function from line {start_line+1} to {end_line}")

# New function
new_func = """  // 生成AI用户画像 - 优先调用智谱AI
  const generateAIPrompt = async (userId) => {
    try {
      setAiPrompt(null);
      setLoading(true);

      // 优先调用智谱AI服务
      try {
        const response = await fetch('http://localhost:5101/api/ai-prompt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: userId,
            user_account: userId,
            days: 7
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.source === 'ai') {
            // 智谱AI成功生成画像
            setAiPrompt(data);

            // 保存AI画像记录
            const prompts = JSON.parse(localStorage.getItem('globalai_ai_prompts') || '[]');
            prompts.unshift({
              timestamp: new Date().toISOString(),
              userId,
              source: 'zhipu_ai',
              profile: data.profile
            });
            localStorage.setItem('globalai_ai_prompts', JSON.stringify(prompts.slice(0, 100)));

            loadStats(); // 刷新统计
            setLoading(false);
            return;
          }
        }
      } catch (aiError) {
        console.warn('智谱AI服务调用失败，使用本地分析:', aiError);
      }

      // 智谱AI失败或返回默认画像时，使用本地分析
      const summaryRes = await fetch(`${API_BASE}/summary?user_id=${encodeURIComponent(userId)}&days=7`);
      if (summaryRes.ok) {
        const summary = await summaryRes.json();
        console.log('用户摘要:', summary);

        if (summary && summary.total_events > 0) {
          const fallbackProfile = generateFallbackProfile(userId, summary);
          setAiPrompt({
            success: true,
            source: 'local_fallback',
            profile: fallbackProfile
          });

          // 保存AI画像记录
          const prompts = JSON.parse(localStorage.getItem('globalai_ai_prompts') || '[]');
          prompts.unshift({
            timestamp: new Date().toISOString(),
            userId,
            source: 'local_fallback',
            profile: fallbackProfile
          });
          localStorage.setItem('globalai_ai_prompts', JSON.stringify(prompts.slice(0, 100)));

          loadStats();
          setLoading(false);
          return;
        }
      }

      // 如果都没有数据，显示提示
      setAiPrompt({
        success: true,
        source: 'no_data',
        profile: {
          user_type: '暂无足够数据',
          interests: ['待分析'],
          usage_habits: '请先使用一些功能，系统将自动分析您的使用习惯',
          proficiency_level: '待评估',
          proficiency_reason: '需要更多使用数据才能进行专业程度评估',
          suggestions: ['尝试使用AI生图功能', '尝试使用视频创作工具', '多次使用同一功能可帮助系统了解您的需求'],
          summary: '暂无足够数据生成详细画像'
        }
      });
    } catch (error) {
      console.error('生成AI画像失败:', error);
      setAiPrompt({
        success: false,
        source: 'error',
        profile: {
          user_type: '数据加载失败',
          interests: ['未知'],
          usage_habits: '无法加载用户数据',
          proficiency_level: '未知',
          proficiency_reason: '系统错误: ' + String(error),
          suggestions: ['请稍后重试', '刷新页面'],
          summary: '数据加载失败，请稍后重试'
        }
      });
    } finally {
      setLoading(false);
    }
  };
"""

# Replace the function
new_lines = lines[:start_line] + [new_func + '\n'] + lines[end_line:]

# Write back
with codecs.open('src/components/admin/UserKnowledgeBase.jsx', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("SUCCESS: File updated successfully!")
print(f"Replaced lines {start_line+1} to {end_line} with new function")
