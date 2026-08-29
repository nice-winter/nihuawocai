# 项目守则

## Git 提交

- 改完代码不要着急提交，先询问用户确认
- 只有在用户明确确认或明确指示"完成后直接提交"时才提交改动
- 如果误提交了，立即用 `git reset --soft HEAD~1` 撤回

### Commit Message 格式

```
<type>(<scope>): <subject>
```

**Type：** `feat` / `fix` / `refactor` / `style` / `chore` / `perf` / `docs` / `test`

**Scope 清单：**

| Scope        | 说明           | Scope     | 说明        |
| ------------ | -------------- | --------- | ----------- |
| `ui`         | 通用 UI 组件   | `api`     | API 接口    |
| `modal`      | 弹窗相关       | `service` | 业务服务    |
| `ws`         | WebSocket 相关 | `i18n`    | 国际化      |
| `store`      | Pinia 状态管理 | `config`  | 配置文件    |
| `composable` | 组合式函数     | `deps`    | 依赖更新    |
| `page`       | 页面路由       | `docker`  | Docker 相关 |
| `types`      | 类型定义       | `style`   | 样式/动画   |
| `assets`     | 静态资源       |           |             |

**规则：**

1. scope 用小写，单词间无空格
2. 如果改动跨多个模块，可以省略 scope 或用主要改动模块
3. subject 用中文，简洁明了，不超过 50 字

## TypeScript

- 类型问题尽量用简单方式去处理，不要将类型推导链搞得过于复杂
- 能让 Vue 自动推断的就不要手动标注（如 `useTemplateRef` 不带泛型参数）
- 优先用运行时可行的方案，而非在类型体操上死磕
- `shared/utils/mockdata.ts` 的类型错误暂时忽略，后续统一处理 mock 数据

## 项目架构参考

需要理解项目架构时，查阅以下文档：

- **Shared 类型结构** → [docs/shared-types.md](docs/shared-types.md)
- **服务端架构** → [docs/server-architecture.md](docs/server-architecture.md)
