[![AIA Logo](frontend/image.png)](https://aia-academic-illustrator.vercel.app)

<div align="center">

[English](#english) | 简体中文

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green)](./LICENSE)

**✨ AI 驱动的学术图表自动生成工具**

支持 GPT-5.1 / DeepSeek / Gemini 等多种模型

[在线体验](https://aia-academic-illustrator.vercel.app) / [本地部署](#-本地开发) / [问题反馈](https://github.com/qwwzdyj/AIA-Academic-Illustrator-/issues)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/qwwzdyj/AIA-Academic-Illustrator-)

</div>

---

![效果图](frontend/demo_screenshot.png)

## ✨ 功能特点

- 📄 **智能分析** - 支持文本输入和 PDF/图片上传
- 🔄 **浏览器端 PDF 转换** - PDF 自动转换为图片（使用 pdf.js）
- 🎯 **Schema 生成** - AI 自动生成结构化视觉蓝图
- 🖼️ **图像渲染** - 使用 AI 模型生成高质量学术图表
- 📎 **参考图片** - 可上传参考图片指导生成风格
- 🌍 **双语支持** - 中文/英文界面
- 💾 **本地存储** - 历史记录保存在浏览器（最多 2 张图片）
- 🔑 **BYOK 模式** - 自带 API Key，数据安全

## 🤖 推荐模型配置

| 模型类型 | 用途 | 推荐模型 |
|----------|------|----------|
| **逻辑模型** | 分析论文生成 Schema | `gpt-5.1` / `deepseek-chat` / `gemini-3` |
| **视觉模型** | 生成学术图表 | `gemini-3-pro-image-preview` |

> 💡 提示：两个模型都可以通过 OpenAI 格式的 API 代理调用

## 🛠️ 技术栈

![Next.js](https://img.shields.io/badge/Next.js-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-brown?style=flat-square)

## 🚀 本地开发

```bash
# 克隆项目
git clone https://github.com/qwwzdyj/AIA-Academic-Illustrator-.git
cd AIA-Academic-Illustrator-/frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 http://localhost:3000

## 📖 使用流程

1. **Step 1 - 架构师**: 输入论文摘要或上传 PDF → 生成视觉蓝图
2. **Step 2 - 审阅**: 编辑优化 Schema，添加参考图片
3. **Step 3 - 渲染器**: 生成学术图表 → 下载保存

## 🌐 自行部署

> 注意：部署时需要设置 Root Directory 为 `frontend`

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/qwwzdyj/AIA-Academic-Illustrator-)

## 📄 许可证

[MIT License](./LICENSE)

---

<a name="english"></a>

<div align="center">

![AIA Logo](frontend/image.png)

[简体中文](#) | English

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green)](./LICENSE)

**✨ AI-Powered Academic Diagram Generation Tool**

Supports GPT-5.1 / DeepSeek / Gemini and more

[Live Demo](https://aia-academic-illustrator.vercel.app) / [Local Deploy](#-local-development) / [Issues](https://github.com/qwwzdyj/AIA-Academic-Illustrator-/issues)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/qwwzdyj/AIA-Academic-Illustrator-)

</div>

---

## ✨ Features

- 📄 **Smart Analysis** - Text input + PDF/image upload
- 🔄 **Browser-side PDF Conversion** - PDF to images using pdf.js
- 🎯 **Schema Generation** - AI generates structured Visual Schema
- 🖼️ **Image Rendering** - High-quality academic diagrams
- 📎 **Reference Images** - Style guidance support
- 🌍 **Bilingual** - Chinese/English UI
- 💾 **Local Storage** - History saved in browser (max 2 images)
- 🔑 **BYOK Mode** - Bring Your Own Key, data security

## 🤖 Recommended Models

| Model Type | Purpose | Recommended |
|------------|---------|-------------|
| **Logic Model** | Analyze paper, generate Schema | `gpt-5.1` / `deepseek-chat` / `gemini-3` |
| **Vision Model** | Generate academic diagrams | `gemini-3-pro-image-preview` |

## 🚀 Local Development

```bash
git clone https://github.com/qwwzdyj/AIA-Academic-Illustrator-.git
cd AIA-Academic-Illustrator-/frontend
npm install
npm run dev
```

Visit http://localhost:3000

## 🌐 Deploy Your Own

> Note: Set Root Directory to `frontend` when deploying

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/qwwzdyj/AIA-Academic-Illustrator-)

## 📄 License

[MIT License](./LICENSE)
