# 内置生图调用与输出约定

只在本 Skill 的学术主图生成或编辑阶段（步骤 1–4）读取。以当前工具公开的参数为准；这是 Codex 工具调用，不是 OpenAI SDK 或网页 API。PPT 拆解阶段的生图、素材和回退规则全部由 `image-to-editable-ppt` 决定，本文件不覆盖它。

## 绘图提示词

从 `schema.md` 中提取 BEGIN/END 标记之间的具体视觉要求，嵌入下面的渲染说明。不要把材料来源、审核笔记或 Markdown 编辑器的解释文字一起画出来。

```text
Create one publication-quality academic diagram from the visual blueprint below.
Use clean flat vector-like graphics, distinct geometry, crisp thin outlines,
balanced spacing, and a restrained professional palette. The output is a raster
image with a vector-like visual style, not SVG.

Follow the scientific relationships and spatial arrangement exactly.
Render only text explicitly listed in EXACT TEXT INVENTORY, verbatim, in the
specified language. Do not render blueprint headings, zone numbers, or instructions.
Keep labels readable and arrows visibly connected to their intended endpoints.
Do not invent modules, numerical results, citations, or scientific claims.
Default to a clean white background unless the blueprint specifies otherwise.

<此处加入具体蓝图，不留占位符>
```

如果有参考图，再写明“Image 1 controls style only”“Image 2 is the content reference”等各自的实际角色。参考图只提供风格时，禁止复制其中的标签或把原图当作要编辑的内容目标。

对局部编辑则改为明确的编辑提示词：指出待编辑目标、要改的文字/箭头/模块，以及必须保持不变的布局、内容、配色和比例。不要给局部修正附带一套互相冲突的新设计。

保存实际发送的完整提示词为 `render-prompt.txt`；修正时另存 `edit-prompt-01.txt` 等，使最终结果可追溯。

## 输入参数

当前常见工具名为 `image_gen.imagegen`；在 `functions.exec` 中可能暴露为 `tools.image_gen__imagegen`。使用实际可调用的工具，不模拟返回值。

- `prompt`：完整绘图或编辑要求。
- `transparent_background`：普通学术图为 `false`；用户要求透明背景时为 `true`。编辑时保留原有透明性，除非用户明确更改。
- 无任何图片输入的全新生成：不传 `referenced_image_paths` 和 `num_last_images_to_include`。
- 所有参考图/编辑目标均有本地文件：先逐张 `view_image` 查看，再通过 `referenced_image_paths` 传真实绝对路径。
- 至少一张所需输入没有本地路径：用能包含所有所需输入的最小 `num_last_images_to_include`（最多 5），并明确每张图的用途。
- 两种图片引用参数不能同时使用。无法完整包含所需输入时，请用户重新附上缺失图片，不悄悄丢弃参考图。

这里没有 `model`、`n`、`size`、`quality` 或保存路径参数。图像比例、清晰度和细节目标写在 `prompt` 中；不能把“请求 4K”当成“已得到 4K”。底层生成模型由内置能力管理。

## Code-mode 示例

以下展示无图片输入的调用形式；先把说明性文字替换为实际完整提示词。

```javascript
// @exec: {"yield_time_ms": 120000, "max_output_tokens": 1000}
const result = await tools.image_gen__imagegen({
  prompt: "具体的渲染说明 + 完整视觉蓝图",
  transparent_background: false
});
generatedImage(result);
```

只有调用返回 `Script running with cell ID ...` 后才对那个 cell 使用 `functions.wait`，等待同一个调用完成，后续等待也使用 120000 ms。不要在等待期间再次提交同一个生成任务。

按工具要求通过 `generatedImage(result)` 展示结果；不要将完整 Base64 用 `text()`/日志输出。若工具在另一种环境直接返回原生图像，按该环境的工具契约展示，不硬套这个包装。

## 保存、检查与失败处理

1. 从工具实际返回的资产定位本次生成的文件；内置图片通常存于 `$CODEX_HOME` 下。不要猜文件名、搜索并误用其他任务的最新图片，或假定默认输出在系统临时目录。
2. 有本地路径时检查输出，复制选定文件到任务输出目录，保留真实格式；项目引用不要仅指向生成缓存。
3. 只有原生预览、没有可用本地文件时，使用环境支持的资产获取方式。获取不到则交付预览并说明尚无可供 PPT 重建的文件，不伪造下载路径，也不绕过远程媒体访问限制。
4. 文字校对、模块关系等以实际图像为准。尺寸可通过图像元数据读取；元数据检查不等于视觉检查。
5. 工具不可用、缺少结果或持续失败：保留蓝图和提示词并说明真实状态，不切到 Gemini、第三方代理、Codex OAuth CLI 或外部 OpenAI API。

生成图片本身不需要用户提供模型 API Key；不要为了这个工作流读取本地凭证或让用户配置外部生图服务。
