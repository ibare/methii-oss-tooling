# @methii-oss/vite-config-lib

> Vite library mode preset for Methii OSS packages with peer-dependency externalization

Methii OSS 라이브러리 패키지를 위한 Vite 빌드 프리셋입니다. 가장 큰 가치는 **소비자의 `peerDependencies`를 자동으로 external 처리**하여, React/Radix 등이 라이브러리 번들에 중복 포함되는 사고를 원천 차단한다는 점입니다.

## 설치

```bash
pnpm add -D @methii-oss/vite-config-lib vite
```

`vite`는 peerDependency 입니다(`^5.0.0 || ^6.0.0`).

## 사용

```ts
// vite.config.ts
import { defineLibConfig } from '@methii-oss/vite-config-lib'

export default defineLibConfig({
  entry: 'src/index.ts',
})
```

소비자 패키지의 `package.json`에 `peerDependencies`로 선언된 패키지는 모두 external 처리되어 번들에서 제외됩니다.

```jsonc
// 소비자 패키지의 package.json
{
  "peerDependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  }
}
```

## 옵션

| 옵션 | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `entry` | `string \| Record<string, string>` | `'src/index.ts'` | 빌드 진입점 |
| `formats` | `Array<'es' \| 'cjs'>` | `['es']` | 출력 포맷 |
| `additionalExternals` | `Array<string \| RegExp>` | `[]` | 매트릭스 + peerDependencies에 추가로 external 처리할 패턴 |
| `dts` | `boolean` | `true` | `.d.ts` 자동 생성 여부 |
| `packageJsonPath` | `string` | `'package.json'` | peerDependencies를 읽을 package.json 경로 |
| `dedupe` | `string[]` | `[]` | `react`/`react-dom` 기본 dedupe에 추가할 패키지 (예: `'konva'`, `'react-konva'`) |
| `bundleGuard` | `boolean` | `true` | 매트릭스 패키지가 dist에 포함되면 빌드 실패 |
| `policy` | `PeerPolicy` | 매트릭스 기본 | 테스트용 커스텀 정책 |

## 자동 external 처리되는 패턴

`@methii-oss/peer-policy`의 매트릭스를 기반으로 다음이 **자동으로** external 처리됩니다:

- 매트릭스 exact 키: `react`, `react-dom`, `konva`, `react-konva`, `three`, `zustand`, `zod`, `@tiptap/core` 등 (전체 목록은 peer-policy 패키지 참고)
- 매트릭스 패턴: `@radix-ui/*`, `@tiptap/*`, `@dnd-kit/*`, `@phosphor-icons/*`, `react/*`, `react-dom/*`
- 노드 빌트인: `node:*`
- 소비자 `package.json`의 모든 `peerDependencies` 키 (매트릭스 밖에서 자유롭게 추가 가능)
- `additionalExternals` 옵션

매트릭스에 속한 패키지는 **반드시** `peerDependencies`로 선언되어야 합니다. `dependencies`로 잘못 선언한 경우 `@methii-oss/peer-policy`의 CLI(`methii-oss-check-peers`)와 본 패키지의 bundle guard가 각각 검출합니다.

## Bundle Guard

기본 활성. 빌드 후 dist에 매트릭스 패키지(react, konva, @radix-ui/* 등)가 코드 형태로 포함되어 있는지 검사하고, 발견 시 빌드를 **실패**시킵니다.

이중 안전망 구조:
1. **External 자동 처리** — peerDependencies와 매트릭스 항목을 자동으로 external 처리해 애초에 번들에 포함되지 않도록 함
2. **Bundle Guard** — 위 처리를 우회한 경우(예: 실수로 dependency에 react 넣음)를 빌드 시 탐지

비활성화는 `bundleGuard: false` (테스트/디버깅용; 프로덕션 라이브러리에서는 권장하지 않음).

## 호스트 dedupe 정합성

호스트(`methii/apps/web`)는 `vite.config.ts`에서 `react`, `react-dom`, `konva`, `react-konva` 등을 `resolve.dedupe`로 잡고 있습니다. 본 프리셋도 기본 `react`/`react-dom`/jsx-runtime을 dedupe로 설정하며, 캔버스 기반 패키지(depix, patjuk 등)는 `dedupe: ['konva', 'react-konva']`를 추가하길 권장합니다.

```ts
export default defineLibConfig({
  dedupe: ['konva', 'react-konva'],
})
```

## ⚠️ vendor-* manualChunks 금지

라이브러리 자체에는 해당 없지만, **소비자 앱**(데모, 스토리북, 호스트 web)이 본 패키지들을 번들링할 때 `vendor-react` 등의 수동 청크 분리는 **금지**입니다.

> React/scheduler는 CJS 포맷이라 Rollup이 CJS→ESM interop 헬퍼를 생성합니다.
> 이 헬퍼가 `vendor-react` 외 다른 `vendor-*` 청크에 배치되면, 청크 간 순환 의존성이 발생하여 런타임에 `Cannot read properties of undefined (reading 'createContext')` 크래시가 납니다.

(호스트 `methii/apps/web/vite.config.ts`가 이 함정으로 실제 디버깅 비용을 치름.) npm 패키지는 Rollup 자동 청킹에 위임하고, 워크스페이스 패키지만 명시적 청크로 분리하세요.

## 출력

- ES 빌드: `dist/<name>.js`
- CJS 빌드: `dist/<name>.cjs` (활성화 시)
- 타입: `dist/<name>.d.ts` (`dts: true`일 때, 기본값)
- Source map: 항상 생성
- Minify: **끔** (소비자가 minify; 디버깅 편의)

## 라이선스

MIT © day1company
