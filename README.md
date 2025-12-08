# 🎨 AIA - 学术插图助手 (Academic Illustrator Agent)

[English](#english) | 中文

一个基于 AI 的学术图表自动生成工具，帮助研究人员快速创建 CVPR/NeurIPS 标准的学术插图。

![效果图](./screenshot.png)

## ✨ 功能特点

- 📄 **智能分析**: 支持文本输入和 PDF/图片上传，AI 自动分析论文内容
- 🎯 **Schema 生成**: 自动生成结构化的视觉蓝图 (Visual Schema)
- 🖼️ **图像渲染**: 使用 AI 模型生成高质量学术图表
- 📎 **参考图片**: 可上传参考图片指导生成风格
- 🌍 **双语支持**: 中文/英文界面自由切换
- 💾 **历史记录**: 自动保存生成历史
- 🔑 **BYOK 模式**: 自带 API Key，数据安全

## 🛠️ 技术栈

**前端**
- Next.js 15 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Shadcn/UI
- Zustand (状态管理)
- Framer Motion (动画)

**后端**
- Python FastAPI
- OpenAI SDK
- PyMuPDF (PDF 处理)

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/qwwzdyj/AIA-Academic-Illustrator-.git
cd AIA-Academic-Illustrator-
```

### 2. 安装依赖

**前端**
```bash
cd frontend
npm install
```

**后端**
```bash
cd backend
pip install -r requirements.txt
```

### 3. 启动服务

**启动后端**
```bash
cd backend
uvicorn main:app --reload --port 8000
```

**启动前端**
```bash
cd frontend
npm run dev
```

访问 http://localhost:3000

### 4. 配置 API

打开设置，配置您的 API：

- **逻辑模型 (Step 1)**: OpenAI 格式的多模态模型
- **视觉模型 (Step 3)**: 支持图像生成的模型

## 📖 使用流程

1. **Step 1 - 架构师**: 输入论文摘要或上传 PDF，生成视觉蓝图
2. **Step 2 - 审阅**: 编辑和优化生成的 Schema
3. **Step 3 - 渲染器**: 生成最终的学术图表

## 📦 部署

详见 [DEPLOY.md](./DEPLOY.md)

## 📄 许可证

MIT License

---

<a name="english"></a>
# 🎨 AIA - Academic Illustrator Agent

[中文](#) | English

An AI-powered academic diagram generation tool that helps researchers quickly create CVPR/NeurIPS standard academic illustrations.

![Screenshot](./screenshot.png)

## ✨ Features

- 📄 **Smart Analysis**: Supports text input and PDF/image upload, AI automatically analyzes paper content
- 🎯 **Schema Generation**: Automatically generates structured Visual Schema
- 🖼️ **Image Rendering**: Uses AI models to generate high-quality academic diagrams
- 📎 **Reference Images**: Upload reference images to guide generation style
- 🌍 **Bilingual**: Chinese/English interface
- 💾 **History**: Auto-saves generation history
- 🔑 **BYOK Mode**: Bring Your Own Key, data security

## 🛠️ Tech Stack

**Frontend**
- Next.js 15 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Shadcn/UI
- Zustand
- Framer Motion

**Backend**
- Python FastAPI
- OpenAI SDK
- PyMuPDF

## 🚀 Quick Start

### 1. Clone

```bash
git clone https://github.com/qwwzdyj/AIA-Academic-Illustrator-.git
cd AIA-Academic-Illustrator-
```

### 2. Install Dependencies

**Frontend**
```bash
cd frontend
npm install
```

**Backend**
```bash
cd backend
pip install -r requirements.txt
```

### 3. Start Services

**Start Backend**
```bash
cd backend
uvicorn main:app --reload --port 8000
```

**Start Frontend**
```bash
cd frontend
npm run dev
```

Visit http://localhost:3000

### 4. Configure API

Open Settings and configure your API:

- **Logic Model (Step 1)**: OpenAI-compatible multimodal model
- **Vision Model (Step 3)**: Image generation model

## 📖 Workflow

1. **Step 1 - Architect**: Enter paper abstract or upload PDF, generate Visual Schema
2. **Step 2 - Review**: Edit and optimize the generated Schema
3. **Step 3 - Renderer**: Generate final academic diagram

## 📦 Deployment

See [DEPLOY.md](./DEPLOY.md)

## 📄 License

MIT License
