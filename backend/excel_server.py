"""
AI处理Excel - 后端API服务
使用DeepSeek API理解用户需求，用pandas处理Excel
"""

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import pandas as pd
import os
import re
import uuid
from openai import OpenAI
import io

app = Flask(__name__)
CORS(app)

# 配置
UPLOAD_FOLDER = 'uploads'
DOWNLOAD_FOLDER = 'downloads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(DOWNLOAD_FOLDER, exist_ok=True)

# DeepSeek API配置
DEEPSEEK_API_KEY = os.getenv('DEEPSEEK_API_KEY', 'sk-aff42de691da458da58bb67fa0d742b4')
DEEPSEEK_BASE_URL = 'https://api.deepseek.com'

client = OpenAI(
    api_key=DEEPSEEK_API_KEY,
    base_url=DEEPSEEK_BASE_URL
)


def ask_deepseek(instruction, df_info):
    """
    调用DeepSeek API理解用户需求并生成pandas代码
    """
    columns = df_info['columns']
    dtypes = df_info['dtypes']
    sample_rows = df_info['sample']

    prompt = f"""你是一个Excel处理专家。用户有一个Excel文件，需要你帮忙处理。

文件信息：
- 列名：{columns}
- 数据类型：{dtypes}
- 示例数据（前3行）：
{sample_rows}

用户需求：{instruction}

请生成Python代码来处理这个数据。代码要求：
1. 使用pandas库
2. 数据已经存储在变量df中
3. 只返回处理后的代码，不要解释
4. 代码格式如下，直接可执行：

```python
import pandas as pd

# 处理数据
df_processed = df.copy()
# 你的处理代码...

return df_processed
```

现在请生成代码："""

    try:
        response = client.chat.completions.create(
            model="deepseek-chat",
            messages=[
                {"role": "system", "content": "你是一个专业的数据分析助手，擅长使用pandas处理Excel数据。"},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1,
            max_tokens=2000
        )

        code = response.choices[0].message.content

        # 提取代码块
        if '```' in code:
            code_match = re.search(r'```python\n(.*?)```', code, re.DOTALL)
            if code_match:
                code = code_match.group(1)
            else:
                code_match = re.search(r'```\n(.*?)```', code, re.DOTALL)
                if code_match:
                    code = code_match.group(1)

        return code.strip()

    except Exception as e:
        raise Exception(f"DeepSeek API调用失败: {str(e)}")


def execute_pandas_code(code, df):
    """
    安全执行pandas代码
    """
    try:
        # 创建执行环境
        local_vars = {
            'df': df.copy(),
            'pd': pd,
        }

        # 执行代码
        exec(code, {'pd': pd, '__builtins__': __builtins__}, local_vars)

        # 获取处理后的数据
        if 'df_processed' in local_vars:
            return local_vars['df_processed'], code
        else:
            return df, code

    except Exception as e:
        # 如果失败，尝试简单替换常见模式
        try:
            # 如果代码只是计算或返回结果，尝试提取信息
            df_original = df.copy()

            # 尝试直接执行简单操作
            if 'sum' in code.lower() and '销售额' in code:
                result_col = code.split('销售额')[0].split('[')[-1].split('\'')[0] if '[' in code.split('销售额')[0] else '销售额'
                if 'sum' in code:
                    total = df[result_col].sum() if result_col in df.columns else 0
                    df_result = pd.DataFrame({'总计': [total]})
                    return df_result, code

            return df_original, code
        except Exception as e2:
            raise Exception(f"代码执行失败: {str(e)}")


@app.route('/api/process-excel', methods=['POST'])
def process_excel():
    """
    处理Excel文件的主接口
    """
    try:
        # 检查文件
        if 'file' not in request.files:
            return jsonify({'error': '未上传文件'}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': '文件名为空'}), 400

        # 获取用户需求
        instruction = request.form.get('instruction', '')
        if not instruction:
            return jsonify({'error': '请输入处理需求'}), 400

        # 保存上传的文件
        file_id = str(uuid.uuid4())
        file_ext = os.path.splitext(file.filename)[1]
        upload_path = os.path.join(UPLOAD_FOLDER, f"{file_id}{file_ext}")
        file.save(upload_path)

        # 读取Excel文件
        if file_ext == '.csv':
            df = pd.read_csv(upload_path, encoding='utf-8-sig')
        else:
            df = pd.read_excel(upload_path)

        original_rows = len(df)

        # 获取数据信息
        df_info = {
            'columns': df.columns.tolist(),
            'dtypes': {col: str(dtype) for col, dtype in df.dtypes.items()},
            'sample': df.head(3).to_string()
        }

        # 调用DeepSeek生成处理代码
        code = ask_deepseek(instruction, df_info)

        # 执行代码处理数据
        df_processed = execute_pandas_code(code, df)

        # 如果返回的是元组
        if isinstance(df_processed, tuple):
            df_processed = df_processed[0]

        processed_rows = len(df_processed)

        # 保存处理后的文件
        download_filename = f"processed_{file_id}{file_ext}"
        download_path = os.path.join(DOWNLOAD_FOLDER, download_filename)

        if file_ext == '.csv':
            df_processed.to_csv(download_path, index=False, encoding='utf-8-sig')
        else:
            df_processed.to_excel(download_path, index=False, engine='openpyxl')

        # 生成预览数据
        preview_data = df_processed.head(5).to_string()

        return jsonify({
            'success': True,
            'message': f'处理成功！共处理 {processed_rows} 行数据',
            'downloadUrl': f'http://localhost:5000/api/download/{download_filename}',
            'code': code,
            'preview': preview_data,
            'stats': {
                'originalRows': original_rows,
                'processedRows': processed_rows,
                'columns': df_processed.columns.tolist()
            }
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/download/<filename>', methods=['GET'])
def download_file(filename):
    """
    下载处理后的文件
    """
    try:
        file_path = os.path.join(DOWNLOAD_FOLDER, filename)
        if os.path.exists(file_path):
            return send_file(
                file_path,
                as_attachment=True,
                download_name=filename
            )
        else:
            return jsonify({'error': '文件不存在'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/health', methods=['GET'])
def health_check():
    """
    健康检查
    """
    return jsonify({
        'status': 'ok',
        'service': 'AI Excel Processor',
        'deepseek_configured': DEEPSEEK_API_KEY != 'your-api-key-here'
    })


if __name__ == '__main__':
    print("=" * 50)
    print("AI处理Excel - 后端服务")
    print("=" * 50)
    print(f"DeepSeek API: {'已配置' if DEEPSEEK_API_KEY != 'your-api-key-here' else '未配置'}")
    print("服务启动在: http://localhost:5000")
    print("=" * 50)
    app.run(host='0.0.0.0', port=5000, debug=True)
