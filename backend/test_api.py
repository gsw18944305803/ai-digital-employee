import pandas as pd
import requests

# 创建测试Excel文件
test_data = {
    '日期': ['2025-01-01', '2025-01-02', '2025-01-03', '2025-01-04', '2025-01-05'],
    '产品': ['苹果', '香蕉', '橙子', '葡萄', '西瓜'],
    '销售额': [1500, 800, 2000, 1200, 500],
    '数量': [50, 40, 80, 30, 20],
    '单价': [30, 20, 25, 40, 25]
}

df = pd.DataFrame(test_data)
test_file = 'test_data.xlsx'
df.to_excel(test_file, index=False)

print("测试Excel文件已创建")
print("\n原始数据:")
print(df)

# 测试API
print("\n" + "="*50)
print("测试AI处理Excel API")
print("="*50)

# 准备请求数据
files = {'file': open(test_file, 'rb')}
data = {'instruction': '计算销售额的总和'}

# 调用API
response = requests.post('http://localhost:5000/api/process-excel', files=files, data=data)

print(f"\n状态码: {response.status_code}")

if response.status_code == 200:
    result = response.json()
    print(f"\n处理结果:")
    print(f"✓ 成功: {result['success']}")
    print(f"✓ 消息: {result['message']}")
    print(f"\n生成的代码:")
    print(result['code'])
    print(f"\n数据预览:")
    print(result['preview'])
    print(f"\n统计信息:")
    print(f"  原始行数: {result['stats']['originalRows']}")
    print(f"  处理后行数: {result['stats']['processedRows']}")
    print(f"  列名: {result['stats']['columns']}")
else:
    print(f"错误: {response.text}")

# 清理
import os
os.remove(test_file)
print("\n测试文件已清理")
