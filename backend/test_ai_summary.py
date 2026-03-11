"""
测试用户行为摘要生成
"""
import json
import os
import sys
from datetime import datetime, timedelta

# 配置
LOG_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'logs')
LOG_FILE = os.path.join(LOG_DIR, 'user_behavior.log')

def get_user_behavior_summary(user_id, days=7):
    """
    从日志文件中获取用户行为摘要
    """
    try:
        if not os.path.exists(LOG_FILE):
            print(f"[DEBUG] LOG_FILE not found: {LOG_FILE}")
            return None

        cutoff_date = datetime.now() - timedelta(days=days)
        user_events = []

        target_user_id = user_id
        print(f"[DEBUG] Looking for user: {target_user_id}")
        print(f"[DEBUG] LOG_FILE: {LOG_FILE}")
        print(f"[DEBUG] Cutoff date: {cutoff_date}")

        with open(LOG_FILE, 'r', encoding='utf-8') as f:
            line_num = 0
            for line in f:
                line_num += 1
                try:
                    event = json.loads(line.strip())

                    # 解析时间戳
                    event_time_str = event.get('server_timestamp', event.get('timestamp', ''))
                    if event_time_str:
                        try:
                            event_time = datetime.fromisoformat(event_time_str.replace('Z', '+00:00'))
                            if event_time < cutoff_date:
                                continue
                        except:
                            pass

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

        print(f"[DEBUG] Total events found: {len(user_events)}")

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
                prompt = prompt[:50] + ('...' if len(prompt) > 50 else '')
                prompt_keywords.append(prompt)

            # 记录最近操作
            recent_actions.append(f"{feature}-{action}")

        # 获取最常用的功能
        top_features = sorted(feature_usage.items(), key=lambda x: x[1], reverse=True)[:5]

        summary = {
            'total_events': len(user_events),
            'top_features': top_features,
            'recent_prompts': prompt_keywords[-5:],
            'recent_actions': recent_actions[-10:],
            'days_analyzed': days
        }

        return summary

    except Exception as e:
        print(f"[ERROR] Failed: {e}")
        import traceback
        traceback.print_exc()
        return None


if __name__ == '__main__':
    result = get_user_behavior_summary('123456', 7)
    if result:
        print("\n=== 用户行为摘要 ===")
        print(json.dumps(result, ensure_ascii=False, indent=2))
    else:
        print("没有找到用户数据")
