# 项目守则

## Git 提交

- 改完代码不要着急提交，先询问用户确认
- 只有在用户明确确认或明确指示"完成后直接提交"时才提交改动
- 如果误提交了，立即用 `git reset --soft HEAD~1` 撤回

### Commit Message 格式

```
<type>(<scope>): <subject>
```

**Type：**

- `feat`: 新功能
- `fix`: 修复 bug
- `refactor`: 重构（不影响功能）
- `style`: 样式/代码格式
- `chore`: 构建/工具/配置
- `perf`: 性能优化
- `docs`: 文档
- `test`: 测试

**Scope 清单：**

- `ui`: 通用 UI 组件 (app/components/ui)
- `modal`: 弹窗相关 (app/components/modal)
- `ws`: WebSocket 相关 (server/ws)
- `store`: Pinia 状态管理 (app/stores)
- `composable`: 组合式函数 (app/composables)
- `page`: 页面路由 (app/pages)
- `api`: API 接口 (server/api)
- `service`: 业务服务 (server/services)
- `i18n`: 国际化
- `config`: 配置文件
- `deps`: 依赖更新
- `docker`: Docker 相关
- `types`: 类型定义
- `style`: 样式/动画
- `assets`: 静态资源

**规则：**

1. scope 用小写，单词间无空格
2. 如果改动跨多个模块，可以省略 scope 或用主要改动模块
3. subject 用中文，简洁明了，不超过 50 字

## TypeScript 类型

- 类型问题尽量用简单方式去处理，不要将类型推导链搞得过于复杂。
- 能让 Vue 自动推断的就不要手动标注（如 `useTemplateRef` 不带泛型参数）。
- 优先用运行时可行的方案，而非在类型体操上死磕。
- `shared/utils/mockdata.ts` 的类型错误暂时忽略（缺少 `id`, `config`, `options` 等字段），后续统一处理 mock 数据。
