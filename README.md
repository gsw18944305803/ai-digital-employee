# AI 数字员工系统

一个集成多种 AI 功能的智能办公助手系统，支持 AI 聊天、专利搜索、视频数据提取、电商详情生成等功能。

---

## 目录

- [功能模块](#功能模块)
- [技术栈](#技术栈)
- [项目结构](#项目结构)
- [快速开始](#快速开始)
- [功能分支工作流](#功能分支工作流)
- [协作规范](#协作规范)
- [许可证](#许可证)

---

## 功能模块

| 模块 | 描述 | 入口文件 |
|------|------|----------|
| AI 聊天 | 智能对话助手 | `index.html` |
| AI 专利搜索 | 全球专利信息搜索 | `patent-search.html` |
| 多平台视频数据提取 | 支持抖音、小红书等平台 | 后端 API |
| 电商详情生成 | 商品详情页面生成 | `ecommerce-detail.html` |
| 图片编辑 | 在线图片处理工具 | `image-editor.html` |
| 音视频转文档 | 多媒体文件转文字文档 | `media2doc/` |

---

## 技术栈

### 前端
- HTML5 / CSS3 / JavaScript
- 响应式设计

### 后端
- **Node.js** - 代理服务器 (Express)
- **Python** - API 服务 (FastAPI)

---

## 项目结构

```
数字员工/
├── frontend/                    # 前端静态文件
│   ├── index.html               # 主页面 (AI聊天)
│   ├── patent-search.html       # 专利搜索页面
│   ├── ecommerce-detail.html    # 电商详情页面
│   ├── image-editor.html        # 图片编辑页面
│   ├── media2doc/               # 音视频转文档模块
│   └── assets/                  # 静态资源 (CSS, JS, 图片)
│
├── backend/                     # 后端服务
│   ├── proxy-server.js          # Node.js 代理服务器
│   ├── server-8088.js           # 前端辅助服务
│   ├── ai_prompt_server.py      # AI 提示词服务
│   ├── excel_server.py          # Excel 处理服务
│   ├── trending_server.py       # 热点数据服务
│   ├── svi_server.py            # SVI 服务
│   ├── user_behavior_server.py  # 用户行为服务
│   ├── requirements.txt         # Python 依赖
│   ├── package.json             # Node.js 依赖
│   └── data/                    # 数据目录
│
├── 启动.bat                     # Windows 一键启动脚本
└── README.md                    # 项目文档
```

---

## 快速开始

### 环境要求

- Node.js 16+
- Python 3.8+
- npm 或 yarn

### 安装依赖

```bash
# 安装 Node.js 依赖
cd backend
npm install

# 安装 Python 依赖
pip install -r requirements.txt
```

### 启动服务

#### 方式一：Windows 一键启动
直接双击根目录下的 `启动.bat`

#### 方式二：命令行启动
```bash
# 终端 A - 启动后端服务
cd backend && python main.py

# 终端 B - 启动前端/代理服务
node proxy-server.js
```

### 访问地址

| 服务 | 地址 |
|------|------|
| 前端页面 | http://localhost:8088 |
| 后端 API | http://localhost:8080 |

---

## 功能分支工作流

### 1. 开始开发新功能

> 把你要负责的功能分支从远程仓库"拉取"到本地。

```bash
# 1. 同步远程最新分支信息
git fetch origin

# 2. 切换到目标功能分支（如：3D建模功能）
git checkout feature/3d-modeling

# 3. 拉取主分支最新代码，确保代码是最新的
git pull origin main
```

### 2. 预览网站

> 修改代码前先确保能正常运行，修改后可实时查看效果。

**Windows 用户：** 双击 `启动.bat`

**命令行启动：**
```bash
# 后端
cd backend && python main.py

# 前端代理
node proxy-server.js
```

打开浏览器访问 http://localhost:8088 查看效果。

### 3. 在功能分支上开发

> 针对模块相关的前后端文件进行修改。

**示例（3D建模功能）：**
- 前端修改：`frontend/3d-modeling.html`
- 后端修改：`backend/api/modeling.py`

修改后保存文件，刷新浏览器即可看到变化。

### 4. 推送到远程仓库

> 将本地修改上传到 GitHub。

```bash
# 1. 查看修改了哪些文件
git status

# 2. 添加所有修改到暂存区
git add .

# 3. 提交修改（遵循约定式提交规范）
git commit -m "feat(3d-modeling): 优化模型展示页面的UI标题"

# 4. 推送到远程分支
git push origin feature/3d-modeling
```

**提交信息规范：**
| 类型 | 说明 | 示例 |
|------|------|------|
| `feat` | 新功能 | `feat(chat): 添加语音输入功能` |
| `fix` | 修复 Bug | `fix(patent): 修复搜索无结果问题` |
| `docs` | 文档更新 | `docs: 更新README` |
| `style` | 代码格式 | `style: 格式化代码` |
| `refactor` | 重构 | `refactor(api): 优化接口响应` |

### 5. 创建 Pull Request (PR)

1. 在 GitHub 网页上找到黄色 **"Compare & pull request"** 按钮
2. 确认合并方向：`base: main ← compare: feature/3d-modeling`
3. 填写 PR 描述，邀请同事进行代码审查
4. 审查通过后，由负责人合并到 `main` 分支

### 6. 合并后清理

```bash
# 切换回主分支
git checkout main

# 拉取最新代码
git pull origin main

# 删除已合并的功能分支（可选）
git branch -d feature/3d-modeling
git push origin --delete feature/3d-modeling
```

---

## 协作规范

### 依赖同步
如果开发时使用了新的 Python 库，提交前务必更新依赖文件：

```bash
pip freeze > backend/requirements.txt
```

### 分支命名规范

| 分支类型 | 命名格式 | 示例 |
|----------|----------|------|
| 功能分支 | `feature/功能名` | `feature/ai-chat` |
| 修复分支 | `fix/问题描述` | `fix/login-error` |
| 热修复 | `hotfix/问题描述` | `hotfix/security-patch` |

### 代码审查要点

- [ ] 代码符合项目规范
- [ ] 没有引入新的警告或错误
- [ ] 功能测试通过
- [ ] 依赖已更新到 `requirements.txt`

### 避免越权修改

在 `feature/xxx` 分支上，**只修改与该功能相关的文件**，不要随意修改其他模块的代码。

---

## 许可证

[MIT License](LICENSE)

---

## 贡献指南

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交修改 (`git commit -m 'feat: 添加某功能'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request
