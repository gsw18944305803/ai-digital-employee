import json
from datetime import datetime, timedelta

LOG_FILE = 'logs/user_behavior.log'
cutoff_date = datetime.now() - timedelta(days=7)

print('Current time:', datetime.now())
print('Cutoff date:', cutoff_date)

count = 0
total = 0
with open(LOG_FILE, 'r', encoding='utf-8') as f:
    for line in f:
        try:
            event = json.loads(line.strip())
            total += 1
            event_time_str = event.get('server_timestamp', '')

            if event_time_str:
                try:
                    event_time = datetime.fromisoformat(event_time_str.replace('Z', '+00:00'))
                    is_recent = event_time >= cutoff_date
                    if not is_recent:
                        count += 1
                except:
                    pass

print('Total events:', total)
print('Filtered out:', count, 'events due to date')
