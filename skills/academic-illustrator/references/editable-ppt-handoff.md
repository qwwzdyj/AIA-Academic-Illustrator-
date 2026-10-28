# 从最终图片衔接可编辑 PPT

用户明确需要可编辑 PPT/PPTX 时才读取本文件。普通图片生成不需要 `editppt` 或拆解 Skill。本文件只负责交接输入，不定义另一套拆解流程。

## 入口检查

1. 确认用户要求的是对象级可编辑 PPT，而不是仅需要在幻灯片里放一张图片。
2. 确认已选定并检查的最终图像在本地真实存在。多图按用户要求确定页序，不包含失败草稿。
3. 在当前可用 Skill 列表中找到 `image-to-editable-ppt` 并读取它的 `SKILL.md`。不要假定某个用户的绝对安装路径；必要时在 `${CODEX_HOME:-$HOME/.codex}/skills` 中查找。
4. 从该 Skill 的 Entry Contract 和 Pre-Run Check 开始执行；缺少 `editppt` 时也按它的安装流程处理。不要跳过前置检查、OCR 选择或必要的用户交互。

## 交接信息

将以下信息传给拆解流程：

```text
任务：把下列已生成的学术图重建为对象级可编辑 PPTX，保持图意与布局。
输入图像：<按页序排列的真实绝对路径>
输出目录：<用户指定或当前任务的输出目录>
内容依据：<schema.md 路径，以及其中的精确文字清单>
必须保持：<模块名称、箭头方向、公式、数值、颜色语义等>
已知图片问题：<qa.md 里尚未解决的问题，如无则写无>
执行依据：当前已安装的 image-to-editable-ppt/SKILL.md 及其引用文件。
         完整执行其任务流，不继承学术主图阶段的后端限制或修正轮次。
```

蓝图和 QA 是辅助资料，不是另一套页面对象规则。不要把 `schema.md` 当成 `editppt` 的页面 manifest 或坐标文件，也不要给 CLI 编造“文本清单”参数。内容更正只传递用户已确认的要求，重建方式仍由拆解 Skill 决定。

## 唯一执行依据

以下是需要读取的原始契约入口，不是它们的替代实现；以当前安装版本中的完整规则为准：

| 环节 | `image-to-editable-ppt` 内的权威来源 |
| --- | --- |
| 运行工具、初始化、OCR 与用户选择 | `SKILL.md` 的 Entry Contract / Phase 1；`references/cli-helper.md` |
| 图像后端、允许的回退事件、素材记录 | `SKILL.md` 的 Image Backend Selection；`references/manifest-schema.md` 的 `image_backend` 契约 |
| 单页本地认领、多页 page worker、页面执行边界 | `SKILL.md` 的 Roles / Phase 2；`prompts/page-worker.md` |
| 用户明确要求独立项目任务时的批次模式 | `references/project-task-batching.md` |
| 背景、前景素材、原生形状、公式、文字和修复/警告边界 | `references/page-decision-tree.md` |
| `record`、失败恢复、`finalize` 与交付校验 | `SKILL.md` 的 Phase 3 / Phase 4 / State Principles / Delivery Principles；`references/manifest-schema.md` |

不要把原任务流改写为自定义脚本，不跳过原流程要求的页面认领或 page worker，不增加二次页面视觉 QA，不手写状态文件，也不另外禁用或扩大它的图像后端回退。具体操作、权限处理和完成条件均由上述原始契约决定。

交付时保留已完成的学术图片、蓝图与提示词，并附上拆解流程实际产生的 PPTX 和验证结果。若拆解流程报告未完成，明确说明未完成阶段，不把图片型 PPT 称为对象级可编辑成品。
