/**
 * API 代理服务器
 * 用于隐藏前端代码中的 API 密钥
 * 防止密钥暴露给用户
 */

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3001;

// 确保日志目录存在
const LOG_DIR = path.join(__dirname, 'logs');
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}
const BEHAVIOR_LOG_FILE = path.join(LOG_DIR, 'user_behavior.log');

// 环境变量中的 API 密钥
const API_KEY = process.env.API_KEY_302 || 'sk-FzKiwsI5ripsPdKfbAAtHdbKq8CtuQXSx5Mc7IxjbXLl3s3J';
const API_BASE = 'https://api.302.ai';

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 日志中间件
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'API Proxy is running' });
});

// 302.ai 代理 - Chat/聊天接口
app.all('/api/chat/*', async (req, res) => {
  try {
    const url = `${API_BASE}${req.path.replace('/api', '')}`;
    const response = await fetch(url, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'User-Agent': 'Mozilla/5.0'
      },
      body: req.method === 'GET' || req.method === 'HEAD' ? undefined : JSON.stringify(req.body)
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'API request failed', message: error.message });
  }
});

// 302.ai 图片生成代理
app.all('/api/v1/images/*', async (req, res) => {
  try {
    const url = `${API_BASE}${req.path.replace('/api', '')}`;
    const response = await fetch(url, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'User-Agent': 'Mozilla/5.0'
      },
      body: req.method === 'GET' || req.method === 'HEAD' ? undefined : JSON.stringify(req.body)
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'API request failed', message: error.message });
  }
});

// 302.ai 视频生成代理
app.all('/api/openai/*', async (req, res) => {
  try {
    const url = `${API_BASE}${req.path.replace('/api', '')}`;
    const response = await fetch(url, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'User-Agent': 'Mozilla/5.0'
      },
      body: req.method === 'GET' || req.method === 'HEAD' ? undefined : JSON.stringify(req.body)
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'API request failed', message: error.message });
  }
});

// 302.ai 其他接口代理（通用代理）- 处理 /api/302/xxx 路径
app.all('/api/302/*', async (req, res) => {
  try {
    // 去除 /api/302 前缀，保留剩余路径
    const pathWithoutPrefix = req.path.replace(/^\/api\/302/, '');
    const url = `${API_BASE}${pathWithoutPrefix}`;
    console.log(`[302代理] ${req.method} ${req.path} -> ${url}`);
    const response = await fetch(url, {
      method: req.method,
      headers: {
        'Content-Type': req.method === 'POST' ? 'application/json' : 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${API_KEY}`,
        'User-Agent': 'Mozilla/5.0'
      },
      body: req.method === 'GET' || req.method === 'HEAD' ? undefined :
             req.headers['content-type']?.includes('form-data') ? req.body : JSON.stringify(req.body)
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'API request failed', message: error.message });
  }
});

// 豆包图片处理代理
app.all('/api/doubao/*', async (req, res) => {
  try {
    const url = `${API_BASE}/doubao${req.path.replace('/api/doubao', '')}`;
    const response = await fetch(url, {
      method: req.method,
      headers: {
        'Content-Type': req.method === 'POST' ? 'application/json' : 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${API_KEY}`,
        'User-Agent': 'Mozilla/5.0'
      },
      body: req.method === 'GET' || req.method === 'HEAD' ? undefined :
             req.headers['content-type']?.includes('form-data') ? req.body : JSON.stringify(req.body)
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'API request failed', message: error.message });
  }
});

// 即梦视频生成API (Sora2新接口)
const JIMENG_API_KEY = 'sk-FzKiwsI5ripsPdKfbAAtHdbKq8CtuQXSx5Mc7IxjbXLl3s3J';
const JIMENG_BASE = 'https://api.302.ai/doubao/drawing';

// 即梦视频生成 - 提交任务
app.post('/api/jimeng/video/generate', async (req, res) => {
  try {
    const { prompt, negative_prompt, image_url, video_duration } = req.body;

    const requestBody = {
      prompt: prompt || '',
      negative_prompt: negative_prompt || '',
      callback_url: '',
      extra: {
        image_url: image_url || '',
        video_duration: video_duration || 5
      }
    };

    const response = await fetch(`${JIMENG_BASE}/jimeng_ti2v_v30_pro`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${JIMENG_API_KEY}`,
        'User-Agent': 'Mozilla/5.0'
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('即梦视频生成失败:', error);
    res.status(500).json({ error: '视频生成失败', message: error.message });
  }
});

// 即梦视频生成 - 获取任务结果
app.get('/api/jimeng/video/result', async (req, res) => {
  try {
    const { task_id } = req.query;

    if (!task_id) {
      return res.status(400).json({ error: '缺少task_id参数' });
    }

    const response = await fetch(`${JIMENG_BASE}/jimeng_ti2v_v30_pro_result?task_id=${task_id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${JIMENG_API_KEY}`,
        'User-Agent': 'Mozilla/5.0'
      }
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('获取视频结果失败:', error);
    res.status(500).json({ error: '获取视频结果失败', message: error.message });
  }
});

// AI-Media2Doc 后端代理 (端口 8080)
const MEDIA2DOC_API_BASE = 'http://localhost:8080';

app.all('/api/v1/*', async (req, res) => {
  try {
    const url = `${MEDIA2DOC_API_BASE}${req.path}`;
    const headers = { ...req.headers };
    delete headers.host;
    headers['User-Agent'] = 'Mozilla/5.0';

    // 处理请求体
    let body;
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      if (req.headers['content-type']?.includes('multipart/form-data')) {
        // 对于文件上传，直接传递 Buffer
        body = req.body;
      } else {
        body = JSON.stringify(req.body);
      }
    }

    const response = await fetch(url, {
      method: req.method,
      headers: headers,
      body: body
    });

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      res.status(response.status).json(data);
    } else {
      const text = await response.text();
      res.status(response.status).send(text);
    }
  } catch (error) {
    console.error('Media2Doc API Error:', error);
    res.status(500).json({ error: 'Media2Doc API request failed', message: error.message });
  }
});

// Media2Doc 健康检查代理
app.all('/health', async (req, res) => {
  try {
    const url = `${MEDIA2DOC_API_BASE}/health`;
    const response = await fetch(url, { method: 'GET' });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Media2Doc Health Check Error:', error);
    res.status(500).json({ error: 'Media2Doc API unavailable', message: error.message });
  }
});

// 大模型 API 代理
app.all('/api/bigmodel/*', async (req, res) => {
  try {
    const url = `${API_BASE}/bigmodel${req.path.replace('/api/bigmodel', '')}`;
    const response = await fetch(url, {
      method: req.method,
      headers: {
        'Content-Type': req.method === 'POST' ? 'application/json' : 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${API_KEY}`,
        'User-Agent': 'Mozilla/5.0'
      },
      body: req.method === 'GET' || req.method === 'HEAD' ? undefined :
             req.headers['content-type']?.includes('form-data') ? req.body : JSON.stringify(req.body)
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'API request failed', message: error.message });
  }
});

// 搜索代理
app.all('/api/search/*', async (req, res) => {
  try {
    const url = `${API_BASE}${req.path.replace('/api', '')}`;
    const response = await fetch(url, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'User-Agent': 'Mozilla/5.0'
      },
      body: req.method === 'GET' || req.method === 'HEAD' ? undefined : JSON.stringify(req.body)
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'API request failed', message: error.message });
  }
});

// ==================== 用户行为追踪 API ====================

// 系统配置API
app.get('/api/admin/system-config', (req, res) => {
  res.json({
    success: true,
    data: {
      // Sora2视频生成配置
      Sora2: {
        apiKey: 'sk-Rc1j1a6cfUeWlOZYHgXikivqfrUpOdUlGz2ziD772dXFEFZd',
        apiUrl: '/api/jimeng/video/generate',
        resultUrl: '/api/jimeng/video/result',
        enabled: true,
        name: 'Sora2 视频生成',
        model: 'jimeng_ti2v_v30_pro'
      },
      // 电商详情图制作配置
      ecommerce_detail: {
        apiKey: 'sk-Rc1j1a6cfUeWlOZYHgXikivqfrUpOdUlGz2ziD772dXFEFZd',
        apiUrl: '/api/ecommerce/detail/generate',
        resultUrl: '/api/ecommerce/detail/result',
        enabled: true,
        name: '电商详情图制作',
        model: 'gemini-3.1-flash-image-preview',
        systemPrompt: '你是一个专业的电商详情图生成专家。你的任务是根据用户提供的商品照片和产品信息，生成高质量的电商宣传详情图。生成的图片要：1. 突出产品特点 2. 专业美观 3. 适合电商平台展示 4. 多种角度和场景 5. 符合电商规范。请直接生成图片，不要有任何文字解释。'
      }
    }
  });
});

// 电商详情图制作 - 提交任务
const ECOMMERCE_API_KEY = 'sk-Rc1j1a6cfUeWlOZYHgXikivqfrUpOdUlGz2ziD772dXFEFZd';
const ECOMMERCE_BASE = 'https://api.302.ai';

app.post('/api/ecommerce/detail/generate', async (req, res) => {
  try {
    const { image_url, product_name, product_description, industry, style } = req.body;

    // 构建电商详情图的提示词
    const prompt = `请根据这张商品照片生成电商详情图。商品名称：${product_name || '未知商品'}。商品描述：${product_description || '高品质商品'}。行业：${industry || '通用'}。风格：${style || '专业商业'}。

要求：
1. 生成专业美观的电商宣传图
2. 突出产品特点和质感
3. 适合电商平台展示（主图、详情图、场景图）
4. 多种角度展示：正面、侧面、细节特写、使用场景
5. 保持原始产品的真实性
6. 添加专业的光影效果和背景
7. 符合电商平台图片规范

直接输出图片，不要有任何文字。`;

    const requestBody = {
      prompt: prompt,
      image_url: image_url || '',
      negative_prompt: '模糊、低质量、文字、logo、水印、变形、扭曲',
      extra: {
        product_name: product_name || '',
        product_description: product_description || '',
        industry: industry || 'general',
        style: style || 'professional',
        type: 'ecommerce_detail'
      }
    };

    const response = await fetch(`${ECOMMERCE_BASE}/google/v1/models/gemini-3.1-flash-image-preview`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ECOMMERCE_API_KEY}`,
        'User-Agent': 'Mozilla/5.0'
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('电商详情图生成失败:', error);
    res.status(500).json({ error: '电商详情图生成失败', message: error.message });
  }
});

// 电商详情图制作 - 获取任务结果
app.get('/api/ecommerce/detail/result', async (req, res) => {
  try {
    const { requestId } = req.query;

    if (!requestId) {
      return res.status(400).json({ error: '缺少requestId参数' });
    }

    const response = await fetch(`${ECOMMERCE_BASE}/ws/api/v3/predictions/${requestId}/result`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${ECOMMERCE_API_KEY}`,
        'User-Agent': 'Mozilla/5.0'
      }
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('获取详情图结果失败:', error);
    res.status(500).json({ error: '获取详情图结果失败', message: error.message });
  }
});

// 接收用户行为数据
app.post('/api/kb/track', (req, res) => {
  try {
    const { events, userId, sessionId } = req.body;

    // 对用户ID进行哈希脱敏
    const hashedUserId = crypto.createHash('sha256')
      .update(userId)
      .digest('hex')
      .substring(0, 16);

    // 处理并写入日志
    const logEntry = {
      received_at: new Date().toISOString(),
      user_id: hashedUserId,
      session_id: sessionId,
      events: events
    };

    fs.appendFileSync(BEHAVIOR_LOG_FILE, JSON.stringify(logEntry) + '\n');

    console.log(`[行为追踪] 记录 ${events.length} 个事件 | 用户: ${hashedUserId} | 会话: ${sessionId}`);

    res.json({
      success: true,
      message: `成功记录 ${events.length} 个事件`,
      data: {
        total: events.length,
        recorded: events.length
      }
    });
  } catch (error) {
    console.error('Error tracking behavior:', error);
    // 即使出错也返回成功，不影响前端
    res.json({ success: true, message: '数据已接收' });
  }
});

// 获取行为统计（调试用）
app.get('/api/kb/stats', (req, res) => {
  try {
    if (!fs.existsSync(BEHAVIOR_LOG_FILE)) {
      return res.json({
        total_events: 0,
        unique_users: 0,
        total_sessions: 0,
        log_file: BEHAVIOR_LOG_FILE
      });
    }

    const logContent = fs.readFileSync(BEHAVIOR_LOG_FILE, 'utf-8');
    const lines = logContent.trim().split('\n').filter(Boolean);

    const uniqueUsers = new Set();
    const uniqueSessions = new Set();
    let totalEvents = 0;

    lines.forEach(line => {
      try {
        const entry = JSON.parse(line);
        uniqueUsers.add(entry.user_id);
        uniqueSessions.add(entry.session_id);
        totalEvents += (entry.events?.length || 0);
      } catch {
        // 忽略解析失败的行
      }
    });

    res.json({
      total_events: totalEvents,
      unique_users: uniqueUsers.size,
      total_sessions: uniqueSessions.size,
      log_file: BEHAVIOR_LOG_FILE,
      log_lines: lines.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 健康检查
app.get('/api/kb/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'user_behavior_tracker',
    log_file: BEHAVIOR_LOG_FILE,
    log_exists: fs.existsSync(BEHAVIOR_LOG_FILE)
  });
});

// ==================== 用户管理 API ====================

// 用户数据存储路径
const DATA_DIR = path.join(__dirname, '../data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// 确保数据目录和文件存在
const ensureUsersFile = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(USERS_FILE)) {
    // 初始化默认用户
    const defaultUsers = [
      {
        id: 'super_admin_001',
        username: 'admin',
        password: 'admin',
        role: 'super_admin',
        status: 'active',
        computePoints: 999999,
        memberLevel: 'premium',
        createdAt: new Date().toISOString().split('T')[0]
      }
    ];
    fs.writeFileSync(USERS_FILE, JSON.stringify(defaultUsers, null, 2));
  }
};

// 读取用户数据
const getUsers = () => {
  ensureUsersFile();
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('读取用户数据失败:', error);
    return [];
  }
};

// 保存用户数据
const saveUsers = (users) => {
  ensureUsersFile();
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    return true;
  } catch (error) {
    console.error('保存用户数据失败:', error);
    return false;
  }
};

// GET /api/users - 获取所有用户
app.get('/api/users', (req, res) => {
  try {
    const users = getUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: '获取用户列表失败' });
  }
});

// POST /api/users - 保存用��数据
app.post('/api/users', (req, res) => {
  try {
    const users = req.body;
    if (saveUsers(users)) {
      res.json({ success: true, message: '用户数据保存成功' });
    } else {
      res.status(500).json({ error: '保存用户数据失败' });
    }
  } catch (error) {
    res.status(500).json({ error: '保存用户数据失败' });
  }
});

// POST /api/auth/login - 用户登录验证
app.post('/api/auth/login', (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码不能为空' });
    }

    const users = getUsers();
    const user = users.find(u =>
      u.username === username &&
      u.password === password &&
      u.status === 'active'
    );

    if (!user) {
      return res.status(401).json({ error: '用户名或密码错误，或账号已被禁用' });
    }

    // 登录成功，返回用户信息（不包含密码）
    const { password: _, ...userWithoutPassword } = user;
    res.json({
      success: true,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('登录验证失败:', error);
    res.status(500).json({ error: '登录验证失败' });
  }
});

// POST /api/auth/register - 用户注册
app.post('/api/auth/register', (req, res) => {
  try {
    const { username, email, password, inviteCode } = req.body;

    // 验证必填字段
    if (!username || !email || !password) {
      return res.status(400).json({ error: '请填写所有必填字段' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: '密码长度至少为6位' });
    }

    const users = getUsers();

    // 检查用户名或邮箱是否已存在
    const existingUser = users.find(u =>
      u.username === username || u.email === email
    );

    if (existingUser) {
      return res.status(409).json({ error: '用户名或邮箱已被注册' });
    }

    // 创建新用户
    const newUser = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      username,
      email,
      password,
      inviteCode: inviteCode || null,
      role: 'user',
      status: 'active',
      computePoints: 100, // 注册赠送100算力
      memberLevel: 'free',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };

    users.push(newUser);

    if (saveUsers(users)) {
      const { password: _, ...userWithoutPassword } = newUser;
      res.json({
        success: true,
        message: '注册成功',
        user: userWithoutPassword
      });
    } else {
      res.status(500).json({ error: '保存用户数据失败' });
    }
  } catch (error) {
    console.error('用户注册失败:', error);
    res.status(500).json({ error: '用户注册失败' });
  }
});

// GET /api/auth/check-username - 检查用户名是否可用
app.get('/api/auth/check-username', (req, res) => {
  try {
    const { username } = req.query;
    if (!username) {
      return res.status(400).json({ error: '用户名不能为空' });
    }

    const users = getUsers();
    const exists = users.some(u => u.username === username);

    res.json({
      available: !exists,
      username
    });
  } catch (error) {
    res.status(500).json({ error: '检查用户名失败' });
  }
});

// GET /api/auth/check-email - 检查邮箱是否可用
app.get('/api/auth/check-email', (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ error: '邮箱不能为空' });
    }

    const users = getUsers();
    const exists = users.some(u => u.email === email);

    res.json({
      available: !exists,
      email
    });
  } catch (error) {
    res.status(500).json({ error: '检查邮箱失败' });
  }
});

// AI提示词优化API
app.post('/api/ai-prompt', async (req, res) => {
  try {
    const { prompt, context, feature } = req.body;

    // 调用AI进行提示词优化
    const response = await fetch(`${API_BASE}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: '你是一个专业的AI提示词优化专家。请根据上下文优化用户的提示词，使其更加精确、详细和有效。'
          },
          {
            role: 'user',
            content: context ? `请优化以下提示词：${prompt}\n\n上下文：${context}` : `请优化以下提示词：${prompt}`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const optimizedPrompt = data.choices?.[0]?.message?.content || prompt;

    res.json({
      success: true,
      original: prompt,
      optimized: optimizedPrompt
    });
  } catch (error) {
    console.error('AI提示词优化失败:', error);
    res.status(500).json({
      success: false,
      error: '提示词优化失败',
      message: error.message
    });
  }
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found', path: req.path });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 API Proxy Server running on port ${PORT}`);
  console.log(`📡 Proxying requests to: ${API_BASE}`);
  console.log(`🔑 API Key configured: ${API_KEY ? 'Yes ✓' : 'No ✗'}`);
  console.log(`👥 Users API: http://localhost:${PORT}/api/users`);
});
