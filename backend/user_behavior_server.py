"""
用户行为数据收集与存储服务
接收前端发送的行为数据，进行清洗后存储到本地日志文件
记录格式：用户账号 | 功能名称 | 操作类型 | 提示词/参数 | 时间戳
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
import hashlib
from datetime import datetime
import threading

app = Flask(__name__)
CORS(app)

# 配置
LOG_DIR = 'logs'
LOG_FILE = os.path.join(LOG_DIR, 'user_behavior.log')
# 同时创建一个人类可读的格式化日志
READABLE_LOG_FILE = os.path.join(LOG_DIR, 'user_behavior_readable.txt')
os.makedirs(LOG_DIR, exist_ok=True)

# 使用锁保证多线程写入安全
file_lock = threading.Lock()


def hash_user_id(user_id):
    """
    对用户ID进行哈希脱敏
    """
    if not user_id or user_id == 'anonymous':
        return 'anonymous'
    return hashlib.sha256(user_id.encode()).hexdigest()[:16]


def sanitize_data(event_data):
    """
    清洗数据，去除敏感信息
    """
    sanitized = event_data.copy()

    # 脱敏用户ID
    if 'userId' in sanitized:
        sanitized['userId'] = hash_user_id(sanitized['userId'])

    # 限制某些字段的长度
    if 'data' in sanitized:
        data = sanitized['data']
        # 限制 element_text 长度
        if 'element_text' in data and data['element_text']:
            data['element_text'] = str(data['element_text'])[:100]
        # 限制 error_stack 长度
        if 'error_stack' in data and data['error_stack']:
            data['error_stack'] = str(data['error_stack'])[:500]

    return sanitized


def format_readable_log(entry):
    """
    格式化为人类可读的日志
    格式：时间 | 用户账号 | 功能名称 | 操作类型 | 提示词/参数 | 页面URL
    """
    try:
        data = entry.get('data', {})
        event_type = entry.get('event', 'unknown')

        # 获取用户账号（从metadata中获取，如果没有则使用userId）
        user_account = data.get('user_account', data.get('username', ''))
        if not user_account:
            user_account = f"用户_{entry.get('userId', 'unknown')[:8]}"

        # 获取功能名称
        feature_name = data.get('feature_name', data.get('page_name', '未知功能'))

        # 获取操作类型
        action = data.get('action', event_type)

        # 获取提示词或关键参数
        prompt = data.get('prompt', '')
        additional_info = ''

        # 根据不同的操作类型提取关键信息
        if action == 'select_aspect_ratio':
            ratio = data.get('aspect_ratio', '')
            additional_info = f"比例:{ratio}"
        elif action == 'generate':
            if prompt:
                # 限制提示词长度
                if len(str(prompt)) > 80:
                    prompt = str(prompt)[:80] + '...'
            ratio = data.get('aspect_ratio', '')
            if ratio:
                additional_info = f"比例:{ratio}"
        elif event_type == 'page_view':
            prompt = ''  # 页面访问不显示提示词
        elif not prompt:
            # 尝试获取其他关键信息
            tip_id = data.get('tip_id', '')
            if tip_id:
                prompt = f"提示:{tip_id}"

        # 获取页面URL
        url = data.get('url', '')

        # 获取时间戳
        timestamp = entry.get('server_timestamp', data.get('timestamp', ''))

        # 格式化输出
        readable = f"{timestamp} | 账号:{user_account} | 功能:{feature_name} | 操作:{action}"

        if prompt:
            readable += f" | 提示词:{prompt}"

        if additional_info:
            readable += f" | {additional_info}"

        if url:
            # 简化URL显示
            if '#' in url:
                url = url.split('#')[1] if len(url.split('#')[1]) < 50 else url.split('#')[1][:50] + '...'
            readable += f" | 页面:{url}"

        return readable

    except Exception as e:
        return f"格式化错误: {str(e)} | 原始数据: {str(entry)[:200]}"


def append_to_log(entry):
    """
    将条目追加到日志文件（JSON格式 + 可读格式）
    """
    with file_lock:
        try:
            # 写入 JSON 格式日志
            with open(LOG_FILE, 'a', encoding='utf-8') as f:
                f.write(json.dumps(entry, ensure_ascii=False) + '\n')

            # 写入可读格式日志
            readable_line = format_readable_log(entry)
            with open(READABLE_LOG_FILE, 'a', encoding='utf-8') as f:
                f.write(readable_line + '\n')

            # 同时打印到控制台
            print(f"[行为追踪] {readable_line}")

        except Exception as e:
            print(f"[ERROR] Failed to write to log: {e}")


@app.route('/api/kb/track', methods=['POST'])
def track_behavior():
    """
    接收用户行为数据
    请求体格式: { "events": [ {...}, {...} ] }
    """
    try:
        # 获取请求数据
        data = request.get_json()

        if not data:
            return jsonify({'error': 'No data provided'}), 400

        events = data.get('events', [])

        if not events:
            return jsonify({'error': 'No events to track'}), 400

        # 处理每个事件
        processed_count = 0
        for event in events:
            try:
                # 清洗数据
                sanitized = sanitize_data(event)

                # 添加服务器端时间戳
                sanitized['server_timestamp'] = datetime.now().isoformat()

                # 写入日志
                append_to_log(sanitized)
                processed_count += 1

            except Exception as e:
                # 单个事件处理失败不应影响整体
                print(f"[WARN] Failed to process event: {e}")
                continue

        return jsonify({
            'success': True,
            'processed': processed_count,
            'total': len(events)
        }), 200

    except Exception as e:
        # 即使发生错误，也返回成功（不影响主要功能）
        print(f"[ERROR] Track endpoint error: {e}")
        return jsonify({
            'success': True,
            'processed': 0,
            'total': 0,
            'note': 'Error occurred, but client can continue'
        }), 200


@app.route('/api/kb/health', methods=['GET'])
def health_check():
    """
    健康检查端点
    """
    # 检查日志文件状态
    log_exists = os.path.exists(LOG_FILE)
    log_size = 0
    if log_exists:
        log_size = os.path.getsize(LOG_FILE)

    return jsonify({
        'status': 'ok',
        'service': 'User Behavior Tracker',
        'log_file': LOG_FILE,
        'log_exists': log_exists,
        'log_size_bytes': log_size
    }), 200


@app.route('/api/kb/summary', methods=['GET'])
def get_user_summary():
    """
    获取特定用户的行为摘要
    参数: user_id (必需), days (可选，默认7)
    """
    try:
        user_id = request.args.get('user_id', '')
        days = int(request.args.get('days', 7))

        if not user_id:
            return jsonify({'error': 'user_id is required'}), 400

        if not os.path.exists(LOG_FILE):
            return jsonify({'error': 'No data available'}), 404

        from datetime import datetime, timedelta

        cutoff_date = datetime.now() - timedelta(days=days)
        user_events = []
        feature_usage = {}
        prompt_keywords = []
        recent_actions = []

        with open(LOG_FILE, 'r', encoding='utf-8') as f:
            for line in f:
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
                    if event_user_id == user_id or event_user_account == user_id:
                        user_events.append(event)

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

                except:
                    pass

        if not user_events:
            return jsonify({'error': 'No data found for user'}), 404

        # 获取最常用的功能
        top_features = sorted(feature_usage.items(), key=lambda x: x[1], reverse=True)[:5]

        summary = {
            'user_id': user_id,
            'total_events': len(user_events),
            'top_features': top_features,
            'recent_prompts': prompt_keywords[-5:],
            'recent_actions': recent_actions[-10:],
            'days_analyzed': days
        }

        return jsonify(summary), 200

    except Exception as e:
        print(f"[ERROR] Summary endpoint error: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/kb/stats', methods=['GET'])
def get_stats():
    """
    获取简单的统计信息（用于调试）
    """
    try:
        if not os.path.exists(LOG_FILE):
            return jsonify({
                'total_events': 0,
                'event_types': {},
                'latest_events': []
            }), 200

        event_types = {}
        latest_events = []

        with open(LOG_FILE, 'r', encoding='utf-8') as f:
            for line in f:
                try:
                    event = json.loads(line.strip())
                    event_type = event.get('event', 'unknown')
                    event_types[event_type] = event_types.get(event_type, 0) + 1
                except:
                    pass

        # 获取最近的事件
        with open(LOG_FILE, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            for line in lines[-10:]:  # 最近10条
                try:
                    latest_events.append(json.loads(line.strip()))
                except:
                    pass

        return jsonify({
            'total_events': sum(event_types.values()),
            'event_types': event_types,
            'latest_events': latest_events
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    print("=" * 60)
    print("用户行为数据收集服务")
    print("=" * 60)
    print(f"日志文件: {LOG_FILE}")
    print(f"API 端点: http://localhost:5100")
    print(f"  - POST /api/kb/track  - 接收行为数据")
    print(f"  - GET  /api/kb/health - 健康检查")
    print(f"  - GET  /api/kb/stats  - 查看统计")
    print("=" * 60)
    app.run(host='0.0.0.0', port=5100, debug=True, threaded=True)
