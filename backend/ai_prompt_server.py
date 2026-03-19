"""
智谱AI个性化提示生成服务
基于用户行为摘要，使用GLM-3-Turbo模型生成个性化提示语
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
import hashlib
from datetime import datetime, timedelta
import requests

app = Flask(__name__)
CORS(app)

# 智谱AI配置 - 使用302.ai代理
ZHIPU_API_KEY = os.getenv('ZHIPU_API_KEY', 'sk-Rc1j1a6cfUeWlOZYHgXikivqfrUpOdUlGz2ziD772dXFEFZd')
ZHIPU_API_URL = 'https://api.302.ai/v1/chat/completions'

# 默认提示列表（降级使用）
DEFAULT_PROMPTS = [
    {"title": "探索更多功能", "content": "我们有很多实用工具等你发现，点击侧边栏探索吧！", "type": "feature"},
    {"title": "创作小技巧", "content": "试试详细描述你的想法，AI会给你更好的结果！", "type": "tip"},
    {"title": "高效使用", "content": "使用提示词优化功能可以��你的创作效果提升50%哦！", "type": "advanced"},
    {"title": "算力提醒", "content": "合理使用算力，关注会员套餐可以享受更多优惠！", "type": "promo"},
]

LOG_DIR = 'logs'
LOG_FILE = os.path.join(LOG_DIR, 'user_behavior.log')


def hash_user_id(user_id):
    """
    对用户ID进行哈希脱敏（与user_behavior_server保持一致）
    """
    if not user_id or user_id == 'anonymous':
        return 'anonymous'
    return hashlib.sha256(user_id.encode()).hexdigest()[:16]


def get_user_behavior_summary(user_id, days=7):
    """
    从日志文件中获取用户行为摘要
    """
    try:
        if not os.path.exists(LOG_FILE):
            print(f"[DEBUG] LOG_FILE not found: {LOG_FILE}")
            return None

        user_events = []

        # userId在日志中已经是哈希后的值，直接使用
        # 不需要再次哈希，因为数据采集服务器已经处理过了
        target_user_id = user_id
        print(f"[DEBUG] Looking for user: {target_user_id}")
        print(f"[DEBUG] LOG_FILE: {LOG_FILE}")

        with open(LOG_FILE, 'r', encoding='utf-8') as f:
            for line in f:
                try:
                    event = json.loads(line.strip())
                    # 移除日期筛选，直接处理所有事件

                    # 筛选用户事件 - 支持多种格式
                    event_user_id = event.get('userId') or event.get('user_id', '')
                    # 也检查 user_account 字段（兼容新旧格式）
                    data = event.get('data', {})
                    event_user_account = data.get('user_account', '') or event.get('user_account', '')

                    # 匹配用户ID或用户账号
                    if event_user_id == target_user_id or event_user_account == target_user_id:
                        user_events.append(event)
                        print(f"[DEBUG] Found event: {event.get('event') or event.get('event_type', 'unknown')}")
                except:
                    pass

        if not user_events:
            return None

        # 统计用户行为
        feature_usage = {}
        prompt_keywords = []
        recent_actions = []

        for event in user_events:
            data = event.get('data', {})
            feature = data.get('feature_name', '未知功能')
            action = data.get('action', event.get('event', ''))

            # 统计功能使用
            if feature not in feature_usage:
                feature_usage[feature] = 0
            feature_usage[feature] += 1

            # 提取提示词关键词
            prompt = data.get('prompt', '')
            if prompt and len(prompt) > 5:
                # 简化提示词
                prompt = prompt[:50] + ('...' if len(prompt) > 50 else '')
                prompt_keywords.append(prompt)

            # 记录最近操作
            recent_actions.append(f"{feature}-{action}")

        # 获取最常用的功能
        top_features = sorted(feature_usage.items(), key=lambda x: x[1], reverse=True)[:5]

        summary = {
            'total_events': len(user_events),
            'top_features': top_features,
            'recent_prompts': prompt_keywords[-5:],  # 最近5个提示词
            'recent_actions': recent_actions[-10:],  # 最近10个操作
            'days_analyzed': days
        }

        return summary

    except Exception as e:
        print(f"[ERROR] Failed to analyze user behavior: {e}")
        return None


def generate_ai_prompt(user_summary, user_account):
    """
    调用智谱AI生成详细用户画像分析
    """
    print(f"[DEBUG] ZHIPU_API_KEY configured: {bool(ZHIPU_API_KEY)}, length: {len(ZHIPU_API_KEY) if ZHIPU_API_KEY else 0}")

    if not ZHIPU_API_KEY:
        print("[WARN] ZHIPU_API_KEY not configured")
        return None

    # 构建专业的用户画像分析提示词
    system_prompt = """你是一位专业的用户行为分析师，擅长通过用户行为数据生成详细的用户画像。

请根据用户提供的行为数据，生成一份完整的用户画像分析报告，包括：

1. **用户类型标签**（1-2个词）：如"内容创作者"、"设计师"、"视频创作者"、"装修行业用户"等
2. **兴趣领域**（3-5个）：用户最感兴趣的功能或领域
3. **使用习惯**：分析用户的使用频率、偏好功能、操作时间等
4. **专业程度评估**：初级/中级/高级，并说明理由
5. **建议**（2-3条）：针对该用户的具体建议

请以JSON格式返回，格式如下：
{
  "user_type": "用户类型标签",
  "interests": ["兴趣1", "兴趣2", "兴趣3"],
  "usage_habits": "使用习惯描述",
  "proficiency_level": "初级/中级/高级",
  "proficiency_reason": "专业程度评估理由",
  "suggestions": ["建议1", "建议2", "建议3"],
  "summary": "一句话总结该用户特点"
}

注意：
- 根据提示词内容判断用户所属行业（如装修、设计、电商等）
- 建议要具体、有针对性
- 专业程度要根据功能使用频率和提示词质量来判断"""

    # 构建用户行为描述
    behavior_desc = f"""## 用户行为数据分析报告

**用户账号**: {user_account}
**分析周期**: 近{user_summary['days_analyzed']}天
**总操作次数**: {user_summary['total_events']}次

### 功能使用统计
"""
    for feature, count in user_summary['top_features']:
        behavior_desc += f"- {feature}: {count}次\n"

    behavior_desc += f"\n### 最近提示词示例\n"
    if user_summary['recent_prompts']:
        for i, prompt in enumerate(user_summary['recent_prompts'][-3:], 1):
            behavior_desc += f"{i}. {prompt}\n"
    else:
        behavior_desc += "暂无提示词记录\n"

    behavior_desc += f"\n### 最近操作记录\n"
    for action in user_summary['recent_actions'][-5:]:
        behavior_desc += f"- {action}\n"

    behavior_desc += "\n请基于以上数据，生成详细的用户画像分析。"

    try:
        headers = {
            'Authorization': f'Bearer {ZHIPU_API_KEY}',
            'Content-Type': 'application/json'
        }

        payload = {
            'model': 'glm-3-turbo',
            'messages': [
                {'role': 'system', 'content': system_prompt},
                {'role': 'user', 'content': behavior_desc}
            ],
            'temperature': 0.7,
            'max_tokens': 1000
        }

        response = requests.post(
            ZHIPU_API_URL,
            headers=headers,
            json=payload,
            timeout=15
        )

        if response.status_code == 200:
            result = response.json()
            content = result['choices'][0]['message']['content'].strip()

            # 尝试解析JSON
            try:
                # 去除可能的markdown代码块标记
                if content.startswith('```'):
                    content = content.split('```')[1]
                    if content.startswith('json'):
                        content = content[4:]
                if content.endswith('```'):
                    content = content[:-3]

                profile_data = json.loads(content.strip())

                # 添加原始数据摘要
                profile_data['raw_summary'] = {
                    'total_events': user_summary['total_events'],
                    'top_features': user_summary['top_features'][:3],
                    'days_analyzed': user_summary['days_analyzed']
                }

                return profile_data
            except Exception as e:
                print(f"[ERROR] JSON parse failed: {e}")
                # 解析失败，返回简单格式
                return {
                    'user_type': '普通用户',
                    'interests': ['AI创作'],
                    'usage_habits': f'在{user_summary["days_analyzed"]}天内进行了{user_summary["total_events"]}次操作',
                    'proficiency_level': '初级',
                    'proficiency_reason': '数据不足，无法准确评估',
                    'suggestions': ['继续探索更多功能', '尝试使用不同的提示词'],
                    'summary': content[:100],
                    'raw_summary': {
                        'total_events': user_summary['total_events'],
                        'top_features': user_summary['top_features'][:3]
                    }
                }
        else:
            print(f"[WARN] ZhipuAI API error: {response.status_code} - {response.text}")
            return None

    except Exception as e:
        print(f"[ERROR] ZhipuAI API call failed: {e}")
        return None


@app.route('/api/ai-prompt', methods=['POST'])
def get_ai_prompt():
    """
    获取AI生成的用户画像分析
    请求体: { "user_id": "用户ID", "user_account": "用户账号", "days": 分析天数(可选，默认7) }
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        user_id = data.get('user_id', '')
        user_account = data.get('user_account', '用户')
        days = data.get('days', 7)

        if not user_id:
            return jsonify({'error': 'user_id is required'}), 400

        # 获取用户行为摘要
        user_summary = get_user_behavior_summary(user_id, days)

        # 如果没有行为数据，返回默认提示
        if not user_summary:
            print("[INFO] No user behavior found, returning default profile")
            return jsonify({
                'success': True,
                'source': 'default',
                'profile': {
                    'user_type': '新用户',
                    'interests': ['探索中'],
                    'usage_habits': '暂无足够数据',
                    'proficiency_level': '初级',
                    'proficiency_reason': '新用户，暂无使用记录',
                    'suggestions': ['开始使用AI生图功能', '探索视频创作工具'],
                    'summary': '欢迎新用户！建议从基础功能开始探索'
                }
            })

        # 尝试调用AI生成用户画像
        ai_profile = generate_ai_prompt(user_summary, user_account)

        print(f"[AI画像] 用户: {user_account}, 摘要: {user_summary.get('total_events', 0)} 事件")

        if ai_profile:
            print(f"[AI画像] 生成成功: {ai_profile.get('user_type', 'Unknown')}")
            return jsonify({
                'success': True,
                'source': 'ai',
                'profile': ai_profile
            })
        else:
            # AI调用失败，返回基础画像
            basic_profile = {
                'user_type': '活跃用户',
                'interests': [f[0] for f in user_summary['top_features'][:3]],
                'usage_habits': f"在{user_summary['days_analyzed']}天内进行了{user_summary['total_events']}次操作，最常用{user_summary['top_features'][0][0] if user_summary['top_features'] else '未知'}功能",
                'proficiency_level': '中级',
                'proficiency_reason': f"使用频率较高（{user_summary['total_events']}次操作）",
                'suggestions': ['继续探索更多功能', '尝试不同的创作方式'],
                'summary': f'活跃用户，主要使用{user_summary["top_features"][0][0] if user_summary["top_features"] else "AI"}功能',
                'raw_summary': {
                    'total_events': user_summary['total_events'],
                    'top_features': user_summary['top_features'][:3]
                }
            }
            print(f"[AI画像] AI失败，使用基础画像: {basic_profile['user_type']}")
            return jsonify({
                'success': True,
                'source': 'fallback',
                'profile': basic_profile,
                'reason': 'AI调用失败，使用基础画像'
            })

    except Exception as e:
        print(f"[ERROR] AI prompt endpoint error: {e}")
        # 发生错误，返回默认画像
        return jsonify({
            'success': True,
            'source': 'error_fallback',
            'profile': {
                'user_type': '用户',
                'interests': ['未知'],
                'usage_habits': '数据加载失败',
                'proficiency_level': '未知',
                'proficiency_reason': str(e),
                'suggestions': ['请重试'],
                'summary': '数据加载失败，请稍后重试'
            },
            'reason': str(e)
        }), 200


@app.route('/api/ai-prompt/health', methods=['GET'])
def health_check():
    """
    健康检查
    """
    return jsonify({
        'status': 'ok',
        'service': 'AI Personalized Prompt Generator',
        'zhipu_configured': bool(ZHIPU_API_KEY)
    }), 200


if __name__ == '__main__':
    print("=" * 60)
    print("智谱AI个性化提示生成服务")
    print("=" * 60)
    print(f"智谱API: {'已配置' if ZHIPU_API_KEY else '未配置'}")
    print(f"API 端点: http://localhost:5101")
    print(f"  - POST /api/ai-prompt      - 获取AI个性化提示")
    print(f"  - GET  /api/ai-prompt/health - 健康检查")
    print("=" * 60)
    app.run(host='0.0.0.0', port=5101, debug=True, threaded=True)
