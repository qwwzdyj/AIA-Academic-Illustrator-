# 视觉蓝图：从论文逻辑到空间设计

在生成或实质修改蓝图时读取。借鉴 AIA 的布局选择与分区方法；不是让模型逐字复述模板。

## 内容先于布局

先明确一句话的图意，以及输入、处理模块、输出、创新点和有依据的反馈关系。训练与推理、离线与在线、数据流与控制流不要混在同一条未标记的箭头上。

不要画原文未提到的实验提升、额外模型层、数据库或因果关系。只有摘要时按摘要可支持的粒度绘图，不猜完整网络结构。无法确认但影响图意的关系先澄清；不影响图意的设计假设写在蓝图标记外。

## 布局选择

| 论文逻辑 | 常用布局 | 需要明确的关系 |
| --- | --- | --- |
| 顺序处理、编码解码 | Linear Pipeline，左到右 | 每个阶段的输入输出与主流向 |
| 优化、强化学习、迭代反馈 | Cyclic / Iterative | 回路起点、终点、反馈含义 |
| 多尺度、树结构、抽象层级 | Hierarchical Stack | 层级方向与跨层连接 |
| 多模态、对比学习、并行分支 | Parallel / Dual-Stream | 分支对齐、共享/独立模块、融合位置 |
| Agent 与环境、中心协调模块 | Central Hub | 中心与外围的方向、消息类型 |

按内容选一种或有意义地组合，通常分成 2–5 个区域即可。这个数量是可读性建议，不是强制配额。简单图不要为了凑数制造模块。

区域中应出现具体对象：如文档堆、token 方块、特征网格、节点图、分层特征图、检索结果列表，而不只是抽象词汇。装饰对象也不得暗示不存在的方法步骤。

## 蓝图模板

下面的尖括号是编写提示，交付前用具体内容替换；删除不适用的可选项。`---BEGIN PROMPT---` 内只放交给绘图工具的视觉要求。

```markdown
# <图表名称>

## 绘图范围与依据（不渲染）
- 核心信息：<图要让读者理解什么>
- 依据：<已读取文件/章节/页码/用户段落；不要伪造位置>
- 设计假设或未确认项：<如无则省略>

---BEGIN PROMPT---

[STYLE & CANVAS]
- Use case: scientific-educational / infographic-diagram
- Canvas: <用户要求，或适合该图的构图比例>
- Style: clean academic schematic; flat vector-like appearance;
  crisp thin outlines; white background; no photorealism or 3D rendering.
- Typography: readable sans-serif, consistent label hierarchy.
- Palette: <具体角色与颜色映射，避免单靠颜色区分关键含义>

[LAYOUT CONFIGURATION]
- Selected layout: <布局名称>
- Composition logic: <相对位置、主流向、留白和对齐>
- Reading order: <从哪里开始，依次看什么>

[ZONE 1: <位置与语义>]
- Container: <边框/背景/区域形状和相对大小>
- Visual structure: <区域内具体对象、数量和排列>
- Key text labels: "<必须出现的精确文字>"

[ZONE 2: <位置与语义>]
- Container: <具体说明>
- Visual structure: <具体说明>
- Key text labels: "<精确文字>"

[CONNECTIONS]
1. <源对象> → <目标对象>；<实线/虚线/曲线、箭头端点>；标签 "<有需要才写>"。
2. <如果有反馈，明确回路方向、经过的区域和反馈语义>。

[EXACT TEXT INVENTORY]
- "<标题，如果需要在图中显示>"
- "<所有需要显示的模块、连线、图例文字，与前面一致>"

[CONSTRAINTS]
- Render only the exact text inventory; section headings and zone IDs
  are instructions, not text to draw.
- Keep modules and arrow endpoints unambiguous; no overlapping labels.
- <需要保持的领域约束、公式、数值、参考图角色>

---END PROMPT---
```

“Input”“Output”“Encoder”等可以是合法标签；只有它们不在精确文字清单中时才排除。不要沿用原提示词中一律禁止 Input/Output 的做法。

## 参考图与输出风格

参考图可以指导配色、线条、字体层级和间距。内容依据优先于风格图；不要复制风格图的无关文字、标识或模块。存在多个参考图时，明确各自控制的维度，避免互相矛盾。

若最终要拆成可编辑 PPT，优先选取清晰分离的文本、几何图形和连线，避免文字压在复杂纹理上、强阴影、难以分离的交叠效果。这提升可重建性，但不把栅格图变成原生矢量。

## 出图前自检

- 每个重要模块和关系是否能在输入材料中找到依据？
- 主流程、反馈、分支合并和训练/推理界限是否清楚？
- 标签是否精确，重复术语是否一致，是否不必要地堆入长句？
- 图中的视觉编码是否表达真实含义，而不是装饰性暗示？
- 内容是否适合一张图？若确实过密，先缩减次要细节，不擅自生成多页。
