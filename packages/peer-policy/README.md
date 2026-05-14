# @methii-oss/peer-policy

> Single source of truth for shared peer dependency versions across Methii OSS packages

호스트 프로젝트(`methii/apps/web`)와 OSS 피처 패키지(Oon, FACET, depix, fizzex, aperi21, patjuk, trama 등)가 **동일한 메이저/마이너 버전**을 사용하도록 강제하는 버전 매트릭스와 검증 도구입니다.

> **목표**: 호스트가 피처 패키지를 번들링할 때 **중복 번들 0%, 버전 불일치 0%**를 달성합니다.

## 설치

```bash
pnpm add -D @methii-oss/peer-policy
```

## 매트릭스 구성

| 카테고리 | 패키지 |
|---|---|
| React 생태계 | `react`, `react-dom` |
| 캔버스/3D/모션 | `konva`, `react-konva`, `three`, `@types/three`, `gsap`, `framer-motion` |
| Tiptap | `@tiptap/core`, `@tiptap/pm`, `@tiptap/react`, `@tiptap/starter-kit` |
| 상태/스키마 | `zustand`, `zod`, `immer` |
| DnD | `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` |
| 스타일링 | `clsx`, `class-variance-authority`, `tailwind-merge`, `tailwind-variants`, `tailwindcss` |
| 폼 | `react-hook-form`, `@hookform/resolvers` |
| i18n | `i18next`, `react-i18next`, `i18next-browser-languagedetector`, `i18next-resources-to-backend` |
| 에디터/입력 | `monaco-editor`, `@monaco-editor/react`, `cmdk`, `embla-carousel-react`, `react-virtuoso`, `react-image-crop` |
| 알림/UI 보조 | `sonner`, `@floating-ui/react` |
| 시각화 | `recharts`, `d3-force`, `d3-hierarchy`, `polygon-clipping` |
| 도메인 | `katex`, `axios`, `marked`, `@phosphor-icons/react`, `jsep` |
| 저장/유틸 | `idb`, `uuid`, `modern-screenshot` |

**서브패키지 패턴** (bundle external 일괄 적용):
- `@radix-ui/*`, `@tiptap/*`, `@dnd-kit/*`, `@phosphor-icons/*`
- `react/*`, `react-dom/*` (jsx-runtime 등 서브경로)
- `node:*` (노드 빌트인)

정확한 버전 범위는 [`src/matrix.ts`](./src/matrix.ts) 참고. 호스트(`@methii/web`)가 사용하는 정확한 버전을 caret floor로 잡습니다 — 호스트가 `^19.2.5`를 쓰면 매트릭스도 `^19.2.5`. floor를 호스트와 일치시켜야 OSS 피처가 더 낮은 minor를 명시하다가 호스트 빌드 시점에 깜짝 충돌하는 케이스를 막을 수 있습니다.

> **주의**: `monaco-editor`, `katex` 등 0.x 버전 패키지는 minor가 곧 major(`^0.16.x ↔ ^0.17.x`는 호환 불가)이므로, 호스트가 minor를 올릴 때 반드시 매트릭스를 함께 갱신해야 합니다.

## CLI 사용

각 피처 패키지의 `package.json`을 검증합니다.

```bash
pnpm exec methii-oss-check-peers
# 또는 명시
pnpm exec methii-oss-check-peers ./packages/core/package.json
```

CI에 통합:

```yaml
# .github/workflows/ci.yml
- run: pnpm exec methii-oss-check-peers
```

종료 코드:
- `0` 위반 없음
- `1` 위반 있음 (정책 위반 — 머지 차단)
- `2` 파일 읽기/파싱 실패

## 검출 항목

| 종류 | 설명 |
|---|---|
| `dep-should-be-peer` | 매트릭스 패키지가 `dependencies`에 선언됨 — 번들에 포함되어 중복 발생 위험 |
| `peer-range-mismatch` | `peerDependencies`의 버전 범위가 매트릭스와 다름 |

## 프로그래밍 사용

```ts
import {
  PEER_POLICY,
  validatePackage,
  getMatrixExternals,
  detectMatrixModule,
} from '@methii-oss/peer-policy'

// 1. 매트릭스 자체에 접근
console.log(PEER_POLICY.exact['react']) // ^19.2.5

// 2. package.json 검증
import pkg from './package.json' with { type: 'json' }
const violations = validatePackage(pkg)
if (violations.length > 0) process.exit(1)

// 3. Vite external 옵션 생성
import { defineConfig } from 'vite'
export default defineConfig({
  build: {
    rollupOptions: {
      external: getMatrixExternals(),
    },
  },
})

// 4. Bundle guard용 module id 검사
const hit = detectMatrixModule('/path/to/node_modules/react/index.js')
// → 'react'
```

`@methii-oss/vite-config-lib`의 `defineLibConfig`는 위 helper들을 이미 내장 통합하고 있어 직접 호출할 일은 드뭅니다.

## 매트릭스 갱신

매트릭스 갱신은 **호스트 의존성 메이저 bump와 동기**해야 합니다. 절차:

1. `methii/apps/web`의 해당 패키지 버전을 올림
2. 본 매트릭스(`src/matrix.ts`)에 동일 메이저/마이너 caret 범위로 반영
3. changeset 작성 (minor bump 권장)
4. publish 후 각 피처 패키지가 본 패키지를 업데이트하여 peer 범위 재정렬

## 라이선스

MIT &copy; day1company
