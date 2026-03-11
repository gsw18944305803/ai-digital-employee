# 数字员工系统

一个集成多种AI功能的智能办公助手系统。

## 功能模块

- **AI聊天**: 智能对话助手
- **AI专利搜索**: 全球专利信息搜索
- **多平台视频数据提取**: 支持抖音、小红书等平台
- **电商详情生成**: 商品详情页面生成
- **图��编辑**: 在线图片处理工具
- **音视频转文档**: 多媒体文件转文字文档

## 技术栈

### 前端
- HTML5 / CSS3 / JavaScript
- React (部分模块)

### 后端
- Node.js (代理服务器)
- Python (FastAPI 服务)

## 快速开始

### 环境要求
- Node.js 16+
- Python 3.8+
- npm 或 yarn

### 安装依赖

```bash
# 后端依赖
cd backend
npm install
pip install -r requirements.txt

# 前端是静态文件，无需安装依赖
```

### 启动服务

```bash
# 方式一：使用启动脚本 (Windows)
./启动.bat

# 方式二：手动启动
# 后端 (端口 8080)
cd backend
npm start

# 前端 (端口 8088)
cd frontend
npx http-server -p 8088 -c-1
```

### 访问地址
- 前端: http://localhost:8088
- 后端: http://localhost:8080

## 项目结构

```
数字员工/
├── frontend/           # 前端静态文件
│   ├── index.html      # 主页面
│   ├── patent-search.html  # 专利搜索页面
│   ├── media2doc/      # 音视频转文档模块
│   └── assets/         # 静态资源
├── backend/            # 后端服务
│   ├── proxy-server.js # 代理服务器
│   ├── server-8088.js  # 前端辅助服务
│   ├── *_server.py     # Python API服务
│   └── data/           # 数据目录
├── data/               # 共享数据
└── 启动.bat            # Windows启动脚本
```

## 团队协作

1. 克隆仓库
2. 创建功能分支进行开发
3. 提交 Pull Request 进行代码审查

## 许可证

MIT License
