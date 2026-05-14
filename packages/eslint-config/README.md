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
- `no-console: warn`, `no-debugger: warn`, `prefer-const: error`
- `consistent-type-imports`, `no-unused-vars` (언더스코어 prefix 허용)
- 기본 ignore: `node_modules`, `dist`, `build`, `coverage`, `.turbo`

`react`:
- 위 모두 +
- `eslint-plugin-react` recommended
- `eslint-plugin-react-hooks` recommended
- React 17+ new JSX transform 가정 (`react/react-in-jsx-scope: off`)
- `react/prop-types: off` (TypeScript 사용 가정)

## 라이선스

MIT © day1company
