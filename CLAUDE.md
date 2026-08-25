# 项目守则

## TypeScript 类型

- 类型问题尽量用简单方式去处理，不要将类型推导链搞得过于复杂。
- 能让 Vue 自动推断的就不要手动标注（如 `useTemplateRef` 不带泛型参数）。
- 优先用运行时可行的方案，而非在类型体操上死磕。
- `shared/utils/mockdata.ts` 的类型错误暂时忽略（缺少 `id`, `config`, `options` 等字段），后续统一处理 mock 数据。
