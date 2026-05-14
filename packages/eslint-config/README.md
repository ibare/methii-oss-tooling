# @methii-oss/eslint-config

> ESLint flat config preset for Methii OSS packages

Methii OSS 패키지를 위한 ESLint v9 flat config 프리셋입니다. TypeScript 공용 베이스(`base`)와 React 확장(`react`) 두 가지를 제공합니다.

## 설치

```bash
pnpm add -D @methii-oss/eslint-config eslint
```

`eslint`는 peerDependency 입니다(`^9.0.0`).

## 사용

```js
// eslint.config.js
import base from '@methii-oss/eslint-config/base'

export default [
  ...base,
  {
    // 프로젝트 고유 규칙
  },
]
```

React 라이브러리/앱:

```js
// eslint.config.js
import react from '@methii-oss/eslint-config/react'

export default [
  ...react,
  {
    // 프로젝트 고유 규칙
  },
]
```

## Exports

| Export | 용도 |
|---|---|
| `@methii-oss/eslint-config/base` | TypeScript 공용 베이스 (`@eslint/js` recommended + `typescript-eslint` recommended) |
| `@methii-oss/eslint-config/react` | `base` + `eslint-plugin-react` + `react-hooks` recommended |

## 포함된 규칙 요약

`base`:
- `@eslint/js` recommended
- `typescript-eslint` recommended (type-checked 비활성, 성능 우선)
- `no-console: error`, `no-debugger: error`, `prefer-const: error`
- `@typescript-eslint/consistent-type-imports: error` (inline `import type` 강제)
- `@typescript-eslint/no-unused-vars: error` (언더스코어 prefix `_var` 허용)
- 기본 ignore: `node_modules`, `dist`, `build`, `coverage`, `.turbo`, `*.min.js`

> CLI/`bin/` 파일에서 `console`을 정당하게 쓰는 경우, 소비자 측 `eslint.config.js`에서 해당 파일 override로 `no-console: 'off'`를 두면 됩니다.

`react`:
- 위 모두 +
- `eslint-plugin-react` recommended + **`jsx-runtime` config** (React 17+ 자동 JSX transform)
- `eslint-plugin-react-hooks` recommended
- `eslint-plugin-jsx-a11y` recommended (접근성)
- `react/react-in-jsx-scope: off`, `react/prop-types: off` (TypeScript 사용 가정)
- `no-restricted-syntax: error` — **`React.FC` 패턴 금지** (`function Component(props: Props)` 형태 사용)

## 라이선스

MIT © day1company
