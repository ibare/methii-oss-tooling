# 마이그레이션 가이드

> Methii OSS 피처 패키지(Oon, FACET, depix, fizzex, aperi21, patjuk, trama 등)를 `@methii-oss/*` 툴링으로 갈아타기 위한 단계별 절차

이 가이드는 **기존 자체 빌드/린트/타입 설정을 사용하던 OSS 피처 리포**가 본 툴링 4개 패키지(`peer-policy`, `vite-config-lib`, `tsconfig`, `eslint-config`)로 이행할 때 따라야 할 순서를 정리합니다.

## 도달 상태

마이그레이션 후 각 피처 리포는:

- **공유 매트릭스 패키지를 `dependencies`로 갖지 않음** — 모두 `peerDependencies`로 위임
- 호스트(`methii/apps/web`)가 번들링해도 React/Konva/Tiptap 등이 중복 포함되지 않음
- 빌드/린트/타입 검사 출력이 호스트와 동일한 규칙에 맞춰짐
- CI에서 `methii-oss-check-peers`가 정합성을 자동 검증

## 사전 준비

- Node 22.13 이상
- pnpm 11 이상
- 본 툴링 패키지가 npm에 publish되어 있어야 함 (이미 `0.1.0`+ 등록 완료)

## 1단계 — 툴링 의존성 추가

```bash
pnpm add -D \
  @methii-oss/peer-policy \
  @methii-oss/vite-config-lib \
  @methii-oss/tsconfig \
  @methii-oss/eslint-config \
  eslint \
  typescript \
  vite
```

`eslint`/`typescript`/`vite`는 peerDependency 이므로 명시 설치합니다.

## 2단계 — tsconfig 마이그레이션

기존 `tsconfig.json`을 다음으로 교체합니다.

```jsonc
// React 컴포넌트 라이브러리 (FACET, depix, patjuk 등)
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
// 비-React 라이브러리 (fizzex 등)
{
  "extends": "@methii-oss/tsconfig/lib.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src"]
}
```

새로 강제되는 옵션 때문에 기존 코드에서 에러가 나올 수 있습니다:

- `noFallthroughCasesInSwitch` — `switch` 폴스루 발견 시 명시적 `// fallthrough` 주석 또는 `break` 필요
- `noUncheckedSideEffectImports` — `import './foo'` 형태가 실제 파일을 찾지 못하면 에러
- `erasableSyntaxOnly` — `enum`, parameter property(`constructor(private x)`), namespace 등 런타임 잔재가 있으면 에러. 각각 `as const` object / 명시적 필드 / module로 치환
- `noUnusedLocals` / `noUnusedParameters` (lib에서만) — 미사용 식별자는 `_` 접두사로 표시

## 3단계 — ESLint 마이그레이션

ESLint v9 flat config로 전환합니다. 기존 `.eslintrc.*`는 삭제하고 `eslint.config.js`를 추가합니다.

```js
// eslint.config.js — React 라이브러리
import react from '@methii-oss/eslint-config/react'

export default [
  ...react,
  {
    // 프로젝트 고유 규칙이 있으면 여기서 override
  },
]
```

```js
// eslint.config.js — 비-React 라이브러리
import base from '@methii-oss/eslint-config/base'

export default [...base]
```

CLI/`bin/` 파일에서 `console`을 정당하게 쓰는 경우 override:

```js
export default [
  ...base,
  {
    files: ['bin/**/*.{js,ts}', 'scripts/**/*.{js,ts}'],
    rules: { 'no-console': 'off' },
  },
]
```

React 컴포넌트에서 `React.FC` 패턴을 쓰던 코드는 `function Component(props: Props)` 형태로 변환해야 합니다(린트 규칙으로 차단).

## 4단계 — Vite 설정 마이그레이션

`vite.config.ts`를 다음으로 교체합니다.

```ts
import { defineLibConfig } from '@methii-oss/vite-config-lib'

export default defineLibConfig({
  entry: 'src/index.ts',
})
```

캔버스 기반 패키지(depix, patjuk 등 — `konva`/`react-konva` 사용):

```ts
export default defineLibConfig({
  entry: 'src/index.ts',
  dedupe: ['konva', 'react-konva'],
})
```

`peerDependencies`에 선언된 모든 패키지가 자동으로 external 처리됩니다. 별도 `external` 옵션 작성 불필요.

## 5단계 — package.json 정리 (가장 중요)

매트릭스 대상 패키지를 `dependencies`에서 빼고 `peerDependencies` + `devDependencies`로 이동시킵니다.

**Before:**

```jsonc
{
  "dependencies": {
    "react": "^19.0.0",
    "konva": "^10.0.0",
    "react-konva": "^19.0.0",
    "lodash-es": "^4.17.21"
  }
}
```

**After:**

```jsonc
{
  "peerDependencies": {
    "react": "^19.2.5",
    "konva": "^10.2.5",
    "react-konva": "^19.2.3"
  },
  "devDependencies": {
    "react": "^19.2.5",
    "konva": "^10.2.5",
    "react-konva": "^19.2.3"
  },
  "dependencies": {
    "lodash-es": "^4.17.21"
  }
}
```

규칙:

- **매트릭스 항목** → `peerDependencies` 필수 (`dependencies` 금지). 매트릭스의 caret 범위와 정확히 일치해야 함
- 매트릭스 항목은 로컬 개발/테스트를 위해 `devDependencies`에도 함께 둠
- **매트릭스 외 항목** → 자유 (`dependencies`로 두면 번들에 포함됨)

매트릭스 전체 목록은 [`packages/peer-policy/src/matrix.ts`](./packages/peer-policy/src/matrix.ts) 참고.

## 6단계 — CI에 정합성 검증 추가

`.github/workflows/ci.yml`에 한 줄 추가:

```yaml
- name: Check peer policy
  run: pnpm exec methii-oss-check-peers
```

종료 코드:
- `0` 위반 없음
- `1` 위반 있음 — 머지 차단
- `2` 파일 읽기/파싱 실패

## 7단계 — 검증

로컬에서 순서대로 실행해 모두 통과하는지 확인:

```bash
pnpm install           # peerDeps 경고가 사라졌는지 확인
pnpm exec methii-oss-check-peers
pnpm typecheck
pnpm lint
pnpm build             # bundle guard가 dist에 매트릭스 패키지 포함 시 실패시킴
```

호스트 통합 dry-run:

1. `methii/apps/web`의 `pnpm-workspace.yaml`에서 본 OSS 패키지를 워크스페이스 참조로 임시 연결
2. 호스트 빌드(`pnpm build`)
3. `dist/` 내부에 본 패키지 코드가 **소비자 측 단일 인스턴스로** 들어가고, react/konva 등은 호스트의 것이 사용되는지 확인

## 흔히 마주치는 이슈

### `dep-should-be-peer` 위반

매트릭스 패키지가 `dependencies`에 남아있습니다. 5단계로 돌아가 `peerDependencies`로 이동시키세요.

### `peer-range-mismatch` 위반

`peerDependencies`의 caret 범위가 매트릭스와 다릅니다. 매트릭스(`packages/peer-policy/src/matrix.ts`)의 값을 그대로 복사해서 맞추세요.

### Bundle guard 실패

빌드 결과 `dist/`에 react/konva 등의 코드가 포함되었습니다. 거의 항상 5단계 미완료가 원인입니다.

### `react-jsx` 변환 오류

`react-lib.json`은 `jsx: react-jsx`를 강제합니다. `import React from 'react'` 후 미사용으로 빨간 줄이 나면, 그 import 자체가 불필요한 코드입니다(자동 JSX transform). 삭제하세요.

### `erasableSyntaxOnly`가 `enum`을 거부

```ts
// Before
enum Direction { Up, Down }

// After
const Direction = { Up: 'Up', Down: 'Down' } as const
type Direction = typeof Direction[keyof typeof Direction]
```

### `React.FC` 린트 차단

```tsx
// Before
const Button: React.FC<Props> = (props) => <button {...props} />

// After
function Button(props: Props) {
  return <button {...props} />
}
```

## 매트릭스 갱신이 필요한 경우

피처 패키지가 매트릭스에 없는 공유 의존성을 새로 도입해야 하면, 본 툴링 리포에 PR을 보내 매트릭스를 먼저 갱신합니다.

```bash
# methii-oss-tooling 리포에서
# 1. packages/peer-policy/src/matrix.ts에 항목 추가
# 2. changeset 생성
pnpm changeset
# 3. PR → 머지 → 자동 publish 후 피처 리포에서 버전 bump
```

호스트와 매트릭스를 동시에 갱신해야 하는 경우는 `README.md`의 "매트릭스 갱신" 절차를 참고하세요.
