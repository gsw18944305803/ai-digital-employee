"""
AI无限视频生成 - API服务器
基于 Stable Video Infinity 模型的视频生成服务
"""

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import sys
import traceback
import logging
from pathlib import Path
import subprocess
import json
from datetime import datetime

# 添加SVI模型路径到系统路径
SVI_PATH = 'D:/Stable-Video-Infinity-main'
if SVI_PATH not in sys.path:
    sys.path.insert(0, SVI_PATH)

app = Flask(__name__)
CORS(app)

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# 全局变量存储模型状态
model_initialized = False
model_status = {
    'initialized': False,
    'loading': False,
    'error': None,
    'model_path': SVI_PATH,
    'requirements_installed': False,
    'gpu_available': False
}

# 视频输出目录
VIDEO_OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'videos')
os.makedirs(VIDEO_OUTPUT_DIR, exist_ok=True)

# 检查CUDA和GPU可用性
def check_gpu_availability():
    """检查GPU是否可用"""
    try:
        import torch
        if torch.cuda.is_available():
            gpu_count = torch.cuda.device_count()
            gpu_name = torch.cuda.get_device_name(0) if gpu_count > 0 else "Unknown"
            return True, f"{gpu_name} (共{gpu_count}个设备)"
        else:
            return False, "未检测到CUDA设备"
    except ImportError:
        return False, "PyTorch未安装"
    except Exception as e:
        return False, str(e)

# 检查依赖是否安装
def check_dependencies():
    """检查SVI所需的依赖"""
    required_packages = [
        'torch', 'torchvision', 'transformers', 'safetensors',
        'einops', 'diffusers', 'gradio', 'imageio', 'cv2'
    ]
    missing = []
    installed = []

    for package in required_packages:
        try:
            if package == 'cv2':
                import cv2
            else:
                __import__(package)
            installed.append(package)
        except ImportError:
            missing.append(package)

    return installed, missing

# 检查模型权重是否存在
def check_model_weights():
    """检查模型权重文件"""
    weights_dir = os.path.join(SVI_PATH, 'weights')

    required_files = {
        'Wan2.1-I2V-14B-480P': [
            'diffusion_pytorch_model-00001-of-00007.safetensors',
            'Wan2.1_VAE.pth',
            'models_t5_umt5-xxl-enc-bf16.pth',
            'models_clip_open-clip-xlm-roberta-large-vit-huge-14.pth'
        ],
        'Stable-Video-Infinity': [
            'version-2.0/SVI_Wan2.1-I2V-14B_lora_v2.0.safetensors'
        ]
    }

    status = {}
    for model_name, files in required_files.items():
        model_path = os.path.join(weights_dir, model_name)
        model_exists = os.path.exists(model_path)
        if model_exists:
            files_status = {}
            for file in files:
                file_path = os.path.join(model_path, file)
                files_status[file] = os.path.exists(file_path)
            status[model_name] = {
                'exists': True,
                'files': files_status,
                'all_files_present': all(files_status.values())
            }
        else:
            status[model_name] = {
                'exists': False,
                'path': model_path
            }

    return status

@app.route('/api/health', methods=['GET'])
def health_check():
    """健康检查端点"""
    return jsonify({
        'status': 'healthy',
        'service': 'AI无限视频生成服务',
        'version': '1.0.0',
        'model': model_status
    })

@app.route('/api/status', methods=['GET'])
def get_status():
    """获取模型状态"""
    gpu_available, gpu_info = check_gpu_availability()
    installed, missing = check_dependencies()
    weights_status = check_model_weights()

    return jsonify({
        'model_initialized': model_initialized,
        'model_loading': model_status['loading'],
        'error': model_status['error'],
        'gpu_available': gpu_available,
        'gpu_info': gpu_info,
        'dependencies': {
            'installed': installed,
            'missing': missing,
            'all_present': len(missing) == 0
        },
        'model_weights': weights_status,
        'svi_path': SVI_PATH
    })

@app.route('/api/check-setup', methods=['POST'])
def check_setup():
    """检查设置并返回安装说明"""
    gpu_available, gpu_info = check_gpu_availability()
    installed, missing = check_dependencies()
    weights_status = check_model_weights()

    # 生成安装说明
    instructions = []
    warnings = []

    # GPU检查
    if not gpu_available:
        warnings.append("⚠️ 未检测到GPU - 此模型需要NVIDIA GPU和CUDA支持")
        instructions.append({
            'step': 1,
            'title': '安装PyTorch (CUDA版本)',
            'command': 'pip install torch torchvision --index-url https://download.pytorch.org/whl/cu121',
            'description': '确保安装CUDA版本的PyTorch以使用GPU加速'
        })

    # 依赖检查
    if missing:
        instructions.append({
            'step': len(instructions) + 1,
            'title': '安装缺失的依赖',
            'command': f'cd "{SVI_PATH}" && pip install -r requirements.txt',
            'description': f'需要安装: {", ".join(missing)}'
        })

    # 模型权重检查
    weights_missing = []
    for model_name, status in weights_status.items():
        if not status.get('exists', False) or not status.get('all_files_present', False):
            weights_missing.append(model_name)

    if weights_missing:
        instructions.append({
            'step': len(instructions) + 1,
            'title': '下载模型权重',
            'command': '# 使用Hugging Face CLI下载模型',
            'description': '请参考README.md下载以下模型:\n' + '\n'.join([f'  - {w}' for w in weights_missing]),
            'details': {
                'Wan2.1-I2V-14B-480P': 'huggingface-cli download Wan-AI/Wan2.1-I2V-14B-480P --local-dir ./weights/Wan2.1-I2V-14B-480P',
                'SVI-2.0': 'huggingface-cli download vita-video-gen/svi-model version-2.0/SVI_Wan2.1-I2V-14B_lora_v2.0.safetensors --local-dir ./weights/Stable-Video-Infinity'
            }
        })

    # 启动Gradio服务的说明
    instructions.append({
        'step': len(instructions) + 1,
        'title': '启动Gradio演示服务',
        'command': f'cd "{SVI_PATH}" && python gradio_demo.py --port 7860',
        'description': '启动独立的Gradio Web界面进行视频生成'
    })

    return jsonify({
        'ready': gpu_available and len(missing) == 0 and len(weights_missing) == 0,
        'gpu_available': gpu_available,
        'gpu_info': gpu_info,
        'dependencies_installed': len(missing) == 0,
        'weights_available': len(weights_missing) == 0,
        'warnings': warnings,
        'instructions': instructions,
        'quick_start': {
            'gradio_url': 'http://localhost:7860',
            'start_command': f'cd "{SVI_PATH}" && python gradio_demo.py'
        }
    })

@app.route('/api/generate', methods=['POST'])
def generate_video():
    """
    视频生成端点
    注意: 这是一个简化的接口，实际生成需要直接使用Gradio界面
    """
    data = request.json

    # 检查模型是否已初始化
    if not model_initialized:
        return jsonify({
            'success': False,
            'error': '模型未初始化，请先通过Gradio界面启动模型',
            'gradio_url': 'http://localhost:7860'
        }), 400

    # 获取参数
    prompt = data.get('prompt', '')
    negative_prompt = data.get('negative_prompt', '')
    num_clips = data.get('num_clips', 5)
    num_steps = data.get('num_steps', 50)
    cfg_scale = data.get('cfg_scale', 5.0)
    seed = data.get('seed', -1)
    image_data = data.get('image')  # Base64编码的图像

    if not prompt:
        return jsonify({
            'success': False,
            'error': '请提供提示词(prompt)'
        }), 400

    # 这里应该调用实际的生成函数
    # 由于复杂性，建议用户使用Gradio界面
    return jsonify({
        'success': False,
        'error': '请使用Gradio界面进行视频生成',
        'gradio_url': 'http://localhost:7860',
        'message': '由于视频生成需要实时进度显示和预览，建议使用专门的Gradio界面'
    })

@app.route('/api/gradio-link', methods=['GET'])
def get_gradio_link():
    """获取Gradio服务链接"""
    return jsonify({
        'gradio_url': 'http://localhost:7860',
        'start_command': f'cd "{SVI_PATH}" && python gradio_demo.py',
        'description': '打开此链接使用完整的视频生成界面'
    })

@app.route('/api/demo-info', methods=['GET'])
def get_demo_info():
    """获取演示信息"""
    return jsonify({
        'name': 'AI无限视频生成',
        'name_en': 'Stable Video Infinity',
        'description': '基于Stable Video Infinity模型的无限长度视频生成工具',
        'features': [
            '生成任意长度的视频，没有时间限制',
            '支持多种模式: SVI-Film(电影风格)和SVI-Shot(镜头运动)',
            '支持流式提示词输入，每个片段可以使用不同的描述',
            '基于误差回收机制，保证长时间生成的一致性',
            '支持图像到视频的转换'
        ],
        'capabilities': {
            'max_length': '无限(受存储限制)',
            'resolution': '最高480p',
            'fps': 16,
            'input_formats': ['JPG', 'PNG'],
            'output_format': 'MP4'
        },
        'requirements': {
            'gpu': 'NVIDIA GPU (推荐A100 80G或类似)',
            'ram': '至少32GB',
            'storage': '至少100GB可用空间',
            'cuda': 'CUDA 12.0+'
        },
        'paper': 'https://arxiv.org/abs/2510.09212',
        'github': 'https://github.com/vita-epfl/Stable-Video-Infinity',
        'license': 'Apache 2.0'
    })

@app.route('/api/examples', methods=['GET'])
def get_examples():
    """获取示例提示词"""
    examples = {
        'single_prompt': [
            {
                'prompt': 'Gentle waves wash over the shore at sunset',
                'description': '海浪冲刷沙滩'
            },
            {
                'prompt': 'A cat sits peacefully in a sunny window, then stretches and jumps down',
                'description': '猫咪在窗边活动'
            },
            {
                'prompt': 'Cherry blossoms fall like snow in a peaceful Japanese garden',
                'description': '樱花飘落'
            }
        ],
        'streaming_prompts': [
            {
                'name': '日落海边',
                'prompts': [
                    'The sun hangs low over the horizon, casting a golden path across the water',
                    'Gentle waves rhythmically wash upon the wet, reflective sand',
                    'Seagulls fly across the colorful horizon as the sun dips lower',
                    'The sky transforms into shades of orange and purple as day turns to twilight'
                ],
                'description': '日落时分海边的连续场景'
            },
            {
                'name': '猫咪日常',
                'prompts': [
                    'A Siamese kitten rests snugly inside a straw hat',
                    'The kitten decides to explore and jumps out of the hat',
                    'The kitten sees a feather toy and pounces on it excitedly',
                    'The kitten chases the toy around the living room',
                    'The kitten tires itself out and curls up for a nap on the floor'
                ],
                'description': '小猫咪的日常活动'
            },
            {
                'name': '城市夜景',
                'prompts': [
                    'City lights begin to twinkle as evening approaches',
                    'More buildings illuminate as the sky darkens',
                    'Cars move through the streets with their headlights on',
                    'The city comes alive with nighttime activity',
                    'A peaceful view of the sleeping metropolis under the stars'
                ],
                'description': '城市从黄昏到夜晚的变化'
            }
        ]
    }
    return jsonify(examples)

# 错误处理
@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'success': False,
        'error': '端点不存在'
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'success': False,
        'error': '服务器内部错误',
        'details': str(error)
    }), 500

if __name__ == '__main__':
    logger.info("=" * 60)
    logger.info("AI无限视频生成 - API服务器")
    logger.info("=" * 60)

    # 检查GPU和依赖
    gpu_available, gpu_info = check_gpu_availability()
    logger.info(f"GPU状态: {gpu_info}")

    installed, missing = check_dependencies()
    logger.info(f"已安装依赖: {len(installed)}个")
    if missing:
        logger.warning(f"缺失依赖: {', '.join(missing)}")

    weights_status = check_model_weights()
    logger.info(f"模型权重路径: {SVI_PATH}/weights")

    # 启动服务器
    logger.info("服务器启动在 http://localhost:5002")
    logger.info("提示: 视频生成建议使用Gradio界面 (http://localhost:7860)")
    logger.info("=" * 60)

    app.run(host='0.0.0.0', port=5002, debug=True)
