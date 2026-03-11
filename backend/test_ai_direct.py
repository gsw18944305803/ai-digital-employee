#!/usr/bin/env python
# -*- coding: utf-8 -*-
import json
import os
import sys

# 添加当���目录到路径
sys.path.insert(0, os.path.dirname(__file__))

LOG_FILE = 'logs/user_behavior.log'
target_user_id = '123456'

print(f"Looking for user: {target_user_id}")
print(f"LOG_FILE: {LOG_FILE}")
print(f"LOG_FILE exists: {os.path.exists(LOG_FILE)}")

user_events = []

with open(LOG_FILE, 'r', encoding='utf-8') as f:
    for line in f:
        try:
            event = json.loads(line.strip())

            event_user_id = event.get('userId') or event.get('user_id', '')
            data = event.get('data', {})
            event_user_account = data.get('user_account', '') or event.get('user_account', '')

            if event_user_id == target_user_id or event_user_account == target_user_id:
                user_events.append(event)
                print(f"Found: event={event.get('event') or event.get('event_type')}, user_id={event_user_id}, user_account={event_user_account}")
        except Exception as e:
            print(f"Error: {e}")

print(f"\nTotal events found: {len(user_events)}")

# 统计功能使用
feature_usage = {}
prompt_keywords = []

for event in user_events:
    data = event.get('data', {})
    feature = data.get('feature_name', 'unknown')
    action = data.get('action', 'unknown')

    if feature not in feature_usage:
        feature_usage[feature] = 0
    feature_usage[feature] += 1

    prompt = data.get('prompt', '')
    if prompt and len(prompt) > 5:
        prompt_keywords.append(prompt[:50])

print(f"\nFeature usage: {feature_usage}")
print(f"Prompts: {prompt_keywords}")

# 构建AI提示
behavior_desc = f"""## 用户行为数据分析报告

**用户账号**: 123456
**分析周期**: 近7天
**总操作次数**: {len(user_events)}次

### 功能使用统计
"""
for feature, count in feature_usage.items():
    behavior_desc += f"- {feature}: {count}次\n"

behavior_desc += f"\n### 最近提示词示例\n"
for i, prompt in enumerate(prompt_keywords[-3:], 1):
    behavior_desc += f"{i}. {prompt}\n"

print("\n=== 发送给智谱AI的数据 ===")
print(behavior_desc)
