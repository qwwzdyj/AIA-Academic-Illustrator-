🚀 System Prompt: Build the "Academic Illustrator Agent (AIA)"
Role: You are a Senior Full-Stack Architect & AI Engineer. Objective: Build a web application that automates the creation of CVPR/NeurIPS standard academic diagrams using a strict "Logic (Architect) -> Vision (Renderer)" workflow.

1. Technology Stack
Frontend: Next.js 15 (App Router), React 18, TypeScript, Tailwind CSS, Shadcn/UI (Components), Lucide React (Icons), Zustand (State Management).

Backend/Agent: Antigravity (Python Framework) or Python FastAPI (if Antigravity is unavailable in context).

LLM Integration: OpenAI SDK (Python) - Used for compatible endpoints (DeepSeek, GPT, etc.) & Google Generative AI SDK (Optional for native Gemini).

2. Core Architectural Constraints (NON-NEGOTIABLE)
Immutable Prompts: The specific prompt templates provided in Section 5 must be hardcoded into the backend as CONSTANTS. You are strictly forbidden from modifying the text, logic, or structure of these prompts.

BYOK (Bring Your Own Key): Do NOT use .env files for API keys.

Users must manually input their Base URL, API Key, and Model Name in the UI.

Configuration must be split into two separate profiles: "Logic Config" (Step 1) and "Vision Config" (Step 2).

Persist these configs in browser localStorage.

Internationalization (i18n): The UI must support a toggle between English and Chinese. All UI labels must be localized.

3. Frontend Architecture
3.1 Global State (Zustand)
Create a store useWorkflowStore with the following structure:

TypeScript

interface ModelConfig {
  baseUrl: string;  // e.g., https://api.deepseek.com
  apiKey: string;   // e.g., sk-xxxx
  modelName: string; // e.g., deepseek-chat, gemini-1.5-pro
}

interface WorkflowState {
  // Configs (Persist to localStorage)
  logicConfig: ModelConfig; // For Step 1
  visionConfig: ModelConfig; // For Step 2
  
  // App State
  language: 'en' | 'zh';
  currentStep: 1 | 2 | 3; // 1: Architect, 2: Renderer, 3: Editor
  paperContent: string; // User Input
  generatedSchema: string; // Output of Step 1 (Editable)
  generatedImage: string | null; // Output of Step 2
  
  // Actions
  setLogicConfig: (config: ModelConfig) => void;
  // ... other setters
}
3.2 UI Layout & Features
Header:

Logo: "Academic Illustrator".

Right Side: Language Toggle (EN/CN) + Settings Button (Gear Icon).

Settings Modal:

Tab 1: Logic Model (Step 1) -> Inputs for URL, Key, Model Name.

Tab 2: Vision Model (Step 2) -> Inputs for URL, Key, Model Name.

Validation: Provide visual feedback if keys are missing when user tries to generate.

Main View (Stepper):

Step 1 (The Architect): Textarea for Paper Abstract + "Generate Blueprint" button.

Step 2 (The Review): Split screen. Left = Read-only Input; Right = Monaco Editor/Textarea to edit the [VISUAL SCHEMA] Markdown. Button: "Render Image".

Step 3 (The Renderer): Image Display Canvas + Chat Interface for refinement.

4. Backend Architecture (Python)
4.1 Prompt Asset File (prompts_config.py)
ACTION REQUIRED: Create this file and paste the content from Section 5 exactly. Do not change a word.

4.2 API Endpoints
Endpoints must accept config objects in the request body to initialize clients dynamically.

Endpoint 1: POST /api/generate-schema

Input: { paper_content: string, config: ModelConfig }

Logic:

Initialize OpenAI Client using config.baseUrl and config.apiKey.

Load ARCHITECT_PROMPT_TEMPLATE.

Format prompt: prompt = ARCHITECT_PROMPT_TEMPLATE.format(paper_content=paper_content)

Call LLM using config.modelName.

Output: JSON { schema: string }

Endpoint 2: POST /api/render-image

Input: { visual_schema: string, config: ModelConfig }

Logic:

Initialize Client (Handle logic: if URL contains 'googleapis', use Gemini SDK, otherwise use OpenAI SDK).

Load RENDERER_PROMPT_TEMPLATE.

Format prompt: prompt = RENDERER_PROMPT_TEMPLATE.format(visual_schema_content=visual_schema)

Call Model.

Output: JSON { imageUrl: string } or Base64.

5. THE IMMUTABLE PROMPTS (Copy Exact Content)
You must use the following strings in prompts_config.py.

Python

# prompts_config.py

# ==========================================
# STEP 1: THE ARCHITECT (DO NOT MODIFY)
# ==========================================
ARCHITECT_PROMPT_TEMPLATE = """
# Role
你是一位 CVPR/NeurIPS 顶刊的**视觉架构师**。你的核心能力是将抽象的论文逻辑转化为**具体的、结构化的、几何级的视觉指令**。

# Objective
阅读我提供的论文内容，输出一份 [VISUAL SCHEMA]。这份 Schema 将被直接发送给 AI 绘图模型，因此必须使用**强硬的物理描述**。

# Phase 1: Layout Strategy Selector (关键步骤：布局决策)
在生成 Schema 之前，请先分析论文逻辑，从以下**布局原型**中选择最合适的一个（或组合）：
1. Linear Pipeline: 左→右流向 (适合 Data Processing, Encoding-Decoding)。
2. Cyclic/Iterative: 中心包含循环箭头 (适合 Optimization, RL, Feedback Loops)。
3. Hierarchical Stack: 上→下或下→上堆叠 (适合 Multiscale features, Tree structures)。
4. Parallel/Dual-Stream: 上下平行的双流结构 (适合 Multi-modal fusion, Contrastive Learning)。
5. Central Hub: 一个核心模块连接四周组件 (适合 Agent-Environment, Knowledge Graphs)。

# Phase 2: Schema Generation Rules
1. Dynamic Zoning: 根据选择的布局，定义 2-5 个物理区域 (Zones)。不要局限于 3 个。
2. Internal Visualization: 必须定义每个区域内部的“物体” (Icons, Grids, Trees)，禁止使用抽象概念。
3. Explicit Connections: 如果是循环过程，必须明确描述 "Curved arrow looping back from Zone X to Zone Y"。

# Output Format (The Golden Schema)
请严格遵守以下 Markdown 结构输出：

---BEGIN PROMPT---

[Style & Meta-Instructions]
High-fidelity scientific schematic, technical vector illustration, clean white background, distinct boundaries, academic textbook style. High resolution 4k, strictly 2D flat design with subtle isometric elements.

[LAYOUT CONFIGURATION]
* **Selected Layout**: [例如：Cyclic Iterative Process with 3 Nodes]
* **Composition Logic**: [例如：A central triangular feedback loop surrounded by input/output panels]
* **Color Palette**: Professional Pastel (Azure Blue, Slate Grey, Coral Orange, Mint Green).

[ZONE 1: LOCATION - LABEL]
* **Container**: [形状描述, e.g., Top-Left Panel]
* **Visual Structure**: [具体描述, e.g., A stack of documents]
* **Key Text Labels**: "[Text 1]"

[ZONE 2: LOCATION - LABEL]
* **Container**: [形状描述, e.g., Central Circular Engine]
* **Visual Structure**: [具体描述, e.g., A clockwise loop connecting 3 internal modules: A (Gear), B (Graph), C (Filter)]
* **Key Text Labels**: "[Text 2]", "[Text 3]"

[ZONE 3: LOCATION - LABEL]
... (Add Zone 4/5 if necessary based on layout)

[CONNECTIONS]
1. [描述连接线, e.g., A curved dotted arrow looping from Zone 2 back to Zone 1 labeled "Feedback"]
2. [描述连接线, e.g., A wide flow arrow from Zone 2 to Zone 3]

---END PROMPT---

# Input Data
{paper_content}
"""

# ==========================================
# STEP 2: THE RENDERER (DO NOT MODIFY)
# ==========================================
RENDERER_PROMPT_TEMPLATE = """
**Style Reference & Execution Instructions:**

1. **Art Style (Visio/Illustrator Aesthetic):**
   Generate a **professional academic architecture diagram** suitable for a top-tier computer science paper (CVPR/NeurIPS).
   * **Visuals:** Flat vector graphics, distinct geometric shapes, clean thin outlines, and soft pastel fills (Azure Blue, Slate Grey, Coral Orange).
   * **Layout:** Strictly follow the spatial arrangement defined below.
   * **Vibe:** Technical, precise, clean white background. NOT hand-drawn, NOT photorealistic, NOT 3D render, NO shadows/shading.

2. **CRITICAL TEXT CONSTRAINTS (Read Carefully):**
   * **DO NOT render meta-labels:** Do not write words like "ZONE 1", "LAYOUT CONFIGURATION", "Input", "Output", or "Container" inside the image. These are structural instructions for YOU, not text for the image.
   * **ONLY render "Key Text Labels":** Only text inside double quotes (e.g., "[Text]") listed under "Key Text Labels" should appear in the diagram.
   * **Font:** Use a clean, bold Sans-Serif font (like Roboto or Helvetica) for all labels.

3. **Visual Schema Execution:**
   Translate the following structural blueprint into the final image:

{visual_schema_content}
"""
6. Implementation Steps
Setup: Initialize Next.js 15 project and Python backend.

Config: Implement prompts_config.py with the exact content above.

Store: Build the Zustand store with localStorage persistence for logicConfig and visionConfig.

UI: Build the SettingsModal first to handle BYOK, then build the 3-step interface with i18n support.

API: Implement the Python endpoints to accept dynamic config and call LLMs.

Integration: Connect Frontend to Backend.

Start by initializing the project structure and creating the prompts_config.py file.
🎨 附加指令：UI/UX 设计与审美规范 (Design Specifications)
Instruction to AI: In addition to the functional logic, you must strictly adhere to the following design system to ensure a "High-End Academic SaaS" aesthetic. The UI should feel like a tool built by Vercel, Linear, or OpenAI.

1. 核心视觉风格 (Core Aesthetic)
Vibe: Minimalist, "Clean Lab" feel, Distraction-free.

Background: Do NOT use pure white (#ffffff) for the main background. Use bg-slate-50/50 or bg-zinc-50 to create subtle depth.

Surface: Use pure white (#ffffff) only for functional cards (Input areas, Canvas, Settings).

Borders: Ultra-thin borders (border border-slate-200) are preferred over heavy shadows.

Glassmorphism: Use backdrop-blur-md bg-white/80 for the Sticky Header and Floating Action Bars.

2. 颜色系统 (Color Palette - Tailwind)
Primary (Action): indigo-600 (Main Buttons) / indigo-50 (Active States).

Reason: Indigo feels more "intellectual" and "modern" than standard Blue.

Neutral (Text):

Headings: slate-900 (High contrast).

Body: slate-600 (Readable, not harsh).

Placeholders/Muted: slate-400.

Status Colors:

Success: emerald-600 (e.g., "Schema Generated").

Processing: amber-500 (e.g., "Rendering...").

Error: rose-600.

3. 关键组件设计 (Component Specs)
A. 字体排印 (Typography)

Use next/font/google with Inter or Geist Sans.

Headings: font-semibold tracking-tight. (Tight tracking makes it look modern).

Monospace: Use JetBrains Mono or Fira Code for the Markdown Editor ([VISUAL SCHEMA]) area.

B. 步骤条 (The Stepper)

Do NOT use a standard horizontal list.

Design: Use a minimal timeline or segmented control.

Active Step: Highlighted text + colored indicator dot.

Inactive Step: Grayed out text (text-slate-400).

Motion: Smooth transition when switching steps using framer-motion (layoutId).

C. 设置面板 (Settings Modal)

Look: Clean dialog with a sidebar for tabs (Logic / Vision) and a content area.

Inputs: h-10, rounded-md, border-slate-200, focus:ring-2 focus:ring-indigo-500/20.

Password Fields: Must include a "Show/Hide" eye icon.

D. 主画布区域 (The Canvas - Step 3)

Background: A subtle "dot pattern" or "grid pattern" (use Tailwind SVG patterns) to denote a workspace.

Image Container: A white card with shadow-sm, centered.

Chat Overlay: A floating panel on the right side, strictly distinct from the image.

4. 动效与微交互 (Micro-Interactions)
Loading States:

Do NOT use a generic spinner for the main generation.

Use Skeleton Loaders: For the Markdown editor while generating text.

Use a Progress Bar: Or a "Thinking..." pulse effect when rendering the image.

Transitions: Use framer-motion for:

Opening/Closing the Settings Modal (Scale + Fade).

Switching between "Architect" and "Renderer" views (Slide x-axis).

Buttons: Add active:scale-95 transition-transform to give tactile feedback on click.

5. 代码示例：Shadcn/Tailwind 配置
Ensure your tailwind.config.ts includes these extensions for the "Academic" look:

TypeScript

// tailwind.config.ts snippet
theme: {
  extend: {
    fontFamily: {
      sans: ["var(--font-sans)", ...fontFamily.sans],
      mono: ["var(--font-mono)", ...fontFamily.mono],
    },
    colors: {
      border: "hsl(var(--border))",
      input: "hsl(var(--input))",
      ring: "hsl(var(--ring))",
      background: "hsl(var(--background))",
      foreground: "hsl(var(--foreground))",
      primary: {
        DEFAULT: "hsl(var(--primary))",
        foreground: "hsl(var(--primary-foreground))",
      },
      // ... match shadcn css variables
    },
    borderRadius: {
      lg: "var(--radius)", // Suggest 0.5rem or 0.75rem for modern look
      md: "calc(var(--radius) - 2px)",
      sm: "calc(var(--radius) - 4px)",
    },
    animation: {
      "accordion-down": "accordion-down 0.2s ease-out",
      "accordion-up": "accordion-up 0.2s ease-out",
      "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite", // For "Thinking" state
    },
  },
}
🎨 附加指令：UI/UX 设计与审美规范 (Design Specifications)
Instruction to AI: In addition to the functional logic, you must strictly adhere to the following design system to ensure a "High-End Academic SaaS" aesthetic. The UI should feel like a tool built by Vercel, Linear, or OpenAI.

1. 核心视觉风格 (Core Aesthetic)
Vibe: Minimalist, "Clean Lab" feel, Distraction-free.

Background: Do NOT use pure white (#ffffff) for the main background. Use bg-slate-50/50 or bg-zinc-50 to create subtle depth.

Surface: Use pure white (#ffffff) only for functional cards (Input areas, Canvas, Settings).

Borders: Ultra-thin borders (border border-slate-200) are preferred over heavy shadows.

Glassmorphism: Use backdrop-blur-md bg-white/80 for the Sticky Header and Floating Action Bars.

2. 颜色系统 (Color Palette - Tailwind)
Primary (Action): indigo-600 (Main Buttons) / indigo-50 (Active States).

Reason: Indigo feels more "intellectual" and "modern" than standard Blue.

Neutral (Text):

Headings: slate-900 (High contrast).

Body: slate-600 (Readable, not harsh).

Placeholders/Muted: slate-400.

Status Colors:

Success: emerald-600 (e.g., "Schema Generated").

Processing: amber-500 (e.g., "Rendering...").

Error: rose-600.

3. 关键组件设计 (Component Specs)
A. 字体排印 (Typography)

Use next/font/google with Inter or Geist Sans.

Headings: font-semibold tracking-tight. (Tight tracking makes it look modern).

Monospace: Use JetBrains Mono or Fira Code for the Markdown Editor ([VISUAL SCHEMA]) area.

B. 步骤条 (The Stepper)

Do NOT use a standard horizontal list.

Design: Use a minimal timeline or segmented control.

Active Step: Highlighted text + colored indicator dot.

Inactive Step: Grayed out text (text-slate-400).

Motion: Smooth transition when switching steps using framer-motion (layoutId).

C. 设置面板 (Settings Modal)

Look: Clean dialog with a sidebar for tabs (Logic / Vision) and a content area.

Inputs: h-10, rounded-md, border-slate-200, focus:ring-2 focus:ring-indigo-500/20.

Password Fields: Must include a "Show/Hide" eye icon.

D. 主画布区域 (The Canvas - Step 3)

Background: A subtle "dot pattern" or "grid pattern" (use Tailwind SVG patterns) to denote a workspace.

Image Container: A white card with shadow-sm, centered.

Chat Overlay: A floating panel on the right side, strictly distinct from the image.

4. 动效与微交互 (Micro-Interactions)
Loading States:

Do NOT use a generic spinner for the main generation.

Use Skeleton Loaders: For the Markdown editor while generating text.

Use a Progress Bar: Or a "Thinking..." pulse effect when rendering the image.

Transitions: Use framer-motion for:

Opening/Closing the Settings Modal (Scale + Fade).

Switching between "Architect" and "Renderer" views (Slide x-axis).

Buttons: Add active:scale-95 transition-transform to give tactile feedback on click.

5. 代码示例：Shadcn/Tailwind 配置
Ensure your tailwind.config.ts includes these extensions for the "Academic" look:

TypeScript

// tailwind.config.ts snippet
theme: {
  extend: {
    fontFamily: {
      sans: ["var(--font-sans)", ...fontFamily.sans],
      mono: ["var(--font-mono)", ...fontFamily.mono],
    },
    colors: {
      border: "hsl(var(--border))",
      input: "hsl(var(--input))",
      ring: "hsl(var(--ring))",
      background: "hsl(var(--background))",
      foreground: "hsl(var(--foreground))",
      primary: {
        DEFAULT: "hsl(var(--primary))",
        foreground: "hsl(var(--primary-foreground))",
      },
      // ... match shadcn css variables
    },
    borderRadius: {
      lg: "var(--radius)", // Suggest 0.5rem or 0.75rem for modern look
      md: "calc(var(--radius) - 2px)",
      sm: "calc(var(--radius) - 4px)",
    },
    animation: {
      "accordion-down": "accordion-down 0.2s ease-out",
      "accordion-up": "accordion-up 0.2s ease-out",
      "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite", // For "Thinking" state
    },
  },
}
7. Critical Experience & Robustness Enhancements (Mandatory)
Instruction to AI: You must implement the following features to ensure the application is production-ready, robust, and mobile-friendly.

7.1 Session Persistence & "Anti-Loss" Mechanism
Problem: Users lose their detailed Prompt/Schema edits on page refresh.

Solution:

Update WorkflowStore to persist paperContent and generatedSchema to localStorage (in addition to Configs).

Implement a _hasHydrated flag to prevent UI flickering during hydration.

Add a "Reset Project" button in the Header to explicitly clear the current session and start over.

7.2 Robust Markdown Parsing (Step 2 Safety)
Problem: Users might accidentally delete the ---BEGIN PROMPT--- tags in the editor, causing the Backend Regex to fail.

Solution:

Frontend Validation: On clicking "Render Image", strictly validate that the editor content contains both ---BEGIN PROMPT--- and ---END PROMPT---.

Error State: If tags are missing, block the request and show a Toast Warning: "Invalid Schema Format: Please preserve the BEGIN/END tags."

Backend Fallback: Wrap the API logic in a try/catch block. If parsing fails, return a friendly JSON error instead of a 500 crash.

7.3 Export & History Features (Step 3)
Problem: Users need to save their work, and AI generation involves trial and error.

Solution:

Download Actions: In the Canvas area (Step 3), add distinct buttons:

Download Image (Saves the generated PNG/JPG).

Export Schema (Downloads the current Markdown as a .md file for future use).

Session History: Add a simple history array to the Store.

UI: Show a minimal "History Sidebar" or "Previous Versions" list in Step 3, allowing users to switch back to a previously generated image in the current session.

7.4 Mobile Responsiveness (Step 2 Layout)
Problem: The "Split Screen" (Left: Input / Right: Editor) is unusable on mobile screens.

Solution:

Desktop (md:): Maintain the Split View (Side-by-side).

Mobile (Default): Use a Tabbed Interface.

Tab A: "Source Input" (Read-only).

Tab B: "Blueprint Editor" (Monaco Editor).

Ensure the Monaco Editor container has a fixed height (e.g., h-[500px]) on mobile to prevent scrolling issues.