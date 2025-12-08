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
2. Internal Visualization: 必须定义每个区域内部的"物体" (Icons, Grids, Trees)，禁止使用抽象概念。
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

# ==========================================
# STEP 2 EXTENDED: WITH REFERENCE IMAGES
# ==========================================
RENDERER_WITH_REFERENCES_TEMPLATE = """
**Style Reference & Execution Instructions:**

1. **Art Style (Reference-Guided):**
   I have provided reference images of academic diagrams that I like. Please study their:
   - Color palette and color harmony
   - Layout structure and spacing
   - Typography and label styling
   - Icon/shape design language
   - Overall aesthetic feel
   
   Generate a **professional academic architecture diagram** that matches the aesthetic quality of these references, suitable for a top-tier computer science paper (CVPR/NeurIPS).
   * **Visuals:** Flat vector graphics, distinct geometric shapes, clean thin outlines, and soft pastel fills.
   * **Layout:** Strictly follow the spatial arrangement defined in the schema below.
   * **Vibe:** Technical, precise, clean background. NOT hand-drawn, NOT photorealistic, NOT 3D render.

2. **CRITICAL TEXT CONSTRAINTS (Read Carefully):**
   * **DO NOT render meta-labels:** Do not write words like "ZONE 1", "LAYOUT CONFIGURATION", "Input", "Output", or "Container" inside the image.
   * **ONLY render "Key Text Labels":** Only text inside double quotes listed under "Key Text Labels" should appear in the diagram.
   * **Font:** Use a clean, bold Sans-Serif font for all labels.

3. **Visual Schema Execution:**
   Translate the following structural blueprint into the final image:

{visual_schema_content}
"""
