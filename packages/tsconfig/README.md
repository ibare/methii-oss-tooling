# @methii-oss/tsconfig

> Shared TypeScript configurations for Methii OSS packages

Methii 생태계에서 OSS 패키지가 공통으로 사용하는 TypeScript 설정 프리셋입니다. 세 가지 변형을 제공합니다.

## 설치

```bash
pnpm add -D @methii-oss/tsconfig typescript
```

## 변형

| 파일 | 용도 |
|---|---|
| `base.json` | 모든 환경의 공통 기반. 스크립트·CLI·일반 TS 프로젝트 |
| `lib.json` | TypeScript 라이브러리 빌드용. `declaration` + `sourceMap` 활성화 |
| `react-lib.json` | React 컴포넌트 라이브러리용. JSX(`react-jsx`) + DOM lib |

## 사용

각 프로젝트의 `tsconfig.json`에서 `extends`로 참조합니다.

```jsonc
// 일반 TypeScript 라이브러리
{
  "extends": "@methii-oss/tsconfig/lib.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src"]
}
```

```jsonc
// React 컴포넌트 라이브러리
{
  "extends": "@methii-oss/tsconfig/react-lib.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src"]
}
```

```jsonc
// 그 외 (스크립트, 도구 등)
{
  "extends": "@methii-oss/tsconfig/base.json"
}
```

## 주요 옵션

`base.json`에서 강제하는 핵심 옵션:

- `target: ES2022`, `module: ESNext`, `moduleResolution: bundler`
- `strict: true`, `noUncheckedIndexedAccess: true`, `noImplicitOverride: true`
- `isolatedModules: true`, `verbatimModuleSyntax: true`
- `esModuleInterop: true`, `skipLibCheck: true`, `forceConsistentCasingInFileNames: true`

`lib.json` 추가:
- `declaration: true`, `declarationMap: true`, `sourceMap: true`

`react-lib.json` 추가:
- `jsx: react-jsx`, `jsxImportSource: react`
- `lib: ["ES2022", "DOM", "DOM.Iterable"]`

## 라이선스

MIT © day1company
