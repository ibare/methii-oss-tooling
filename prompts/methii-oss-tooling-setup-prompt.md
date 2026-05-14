# methii-oss-tooling 프로젝트 셋업 프롬프트

## 1. 목적과 컨텍스트

`methii-oss-tooling`은 Methii 생태계에서 OSS로 공개될 패키지들이 공통으로 쓰는 **개발자 인프라 패키지 모음**이다. 사용자에게 보이지 않는 plumbing으로, `@methii-oss/tsconfig`, `@methii-oss/vite-config-lib`, `@methii-oss/eslint-config` 같은 패키지들을 한 저장소(pnpm workspace)에서 함께 관리하고 npm public registry에 publish한다.

이 저장소의 **첫 번째 소비자는 Methii의 OSS 피처 패키지들**(Fizzex, FACET 등 — 각각 독립 저장소, 독립 라이프사이클)이며, **methii/apps/web** 본체도 동일한 툴링을 사용한다. 따라서 각 툴링 패키지의 API는 "외부 OSS 사용자가 처음 봤을 때도 자연스러워야 한다"는 기준으로 설계한다.

## 2. 결정 사항 (변경 금지)

다음은 이미 결정된 사항이다. 임의로 바꾸지 말 것.

| 항목 | 값 |
|---|---|
| 패키지 매니저 | pnpm 9 이상 (`packageManager` 필드로 명시) |
| Node 버전 | 20 LTS (`.nvmrc`, `engines.node` 모두 명시) |
| 모듈 시스템 | ESM-first (`"type": "module"`) |
| 언어 | TypeScript (필요한 패키지만; JSON/config는 그대로) |
| TypeScript moduleResolution | `bundler` |
| 릴리스 도구 | Changesets |
| CI | GitHub Actions |
| 라이선스 | MIT |
| npm scope | `@methii-oss` (public) |
| ESLint | v9 flat config |
| 루트 package.json | `"private": true` |
| 각 패키지 package.json | `"private": false`, `"publishConfig.access": "public"` |
| 초기 버전 | 모두 `0.1.0` |

## 3. 최종 디렉터리 구조

```
methii-oss-tooling/
├── .changeset/
│   ├── config.json
│   └── README.md
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── release.yml
├── .gitignore
├── .npmrc
├── .nvmrc
├── LICENSE
├── README.md
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.json
└── packages/
    ├── tsconfig/
    │   ├── base.json
    │   ├── lib.json
    │   ├── react-lib.json
    │   ├── package.json
    │   ├── LICENSE
    │   └── README.md
    ├── vite-config-lib/
    │   ├── src/
    │   │   └── index.ts
    │   ├── package.json
    │   ├── tsconfig.json
    │   ├── LICENSE
    │   └── README.md
    └── eslint-config/
        ├── base.js
        ├── react.js
        ├── package.json
        ├── LICENSE
        └── README.md
```

## 4. 작업 순서

각 작업은 **순서대로** 수행한다. 각 작업의 "완료 조건"을 만족시킨 다음에 다음 작업으로 이동.

### 작업 1: 루트 워크스페이스 셋업

**생성할 파일**

- `package.json`
  - `"name": "methii-oss-tooling"`, `"private": true`, `"type": "module"`
  - `"packageManager": "pnpm@9.x.x"` (최신 9.x 사용)
  - `"engines": { "node": ">=20" }`
  - scripts: `build`, `lint`, `test`, `typecheck`, `changeset`, `version-packages`, `release`
  - devDependencies (workspace 공용): `typescript`, `@types/node`, `@changesets/cli`, `eslint`, `prettier`
- `pnpm-workspace.yaml`
  ```yaml
  packages:
    - 'packages/*'
  ```
- `tsconfig.json` — `references`로 각 패키지 tsconfig를 가리키는 빈 솔루션 파일
- `.nvmrc` — `20`
- `.npmrc` — `auto-install-peers=true`, `strict-peer-dependencies=false` (개발 편의)
- `.gitignore` — Node, IDE, dist, .turbo, .cache 표준 항목
- `LICENSE` — MIT, copyright holder는 `day1compay`
- `README.md` — 저장소 목적, 포함된 패키지 표, 기여 방법, 라이선스

**완료 조건**

- `pnpm install`이 에러 없이 끝남
- `pnpm -r exec node -v`가 모든 패키지 위치에서 동작 (workspace 인식 확인)

---

### 작업 2: `@methii-oss/tsconfig`

가장 단순한 패키지이므로 먼저 만든다.

**`packages/tsconfig/package.json`**

```jsonc
{
  "name": "@methii-oss/tsconfig",
  "version": "0.1.0",
  "description": "Shared TypeScript configurations for Methii OSS packages",
  "license": "MIT",
  "publishConfig": { "access": "public" },
  "files": ["*.json"],
  "exports": {
    "./base.json": "./base.json",
    "./lib.json": "./lib.json",
    "./react-lib.json": "./react-lib.json"
  }
}
```

**`base.json`** — 모든 변형의 공통 베이스

핵심 옵션:
- `target: "ES2022"`, `module: "ESNext"`, `moduleResolution: "bundler"`
- `strict: true`, `noUncheckedIndexedAccess: true`, `noImplicitOverride: true`
- `isolatedModules: true`, `verbatimModuleSyntax: true`
- `esModuleInterop: true`, `skipLibCheck: true`, `forceConsistentCasingInFileNames: true`
- `resolveJsonModule: true`, `allowSyntheticDefaultImports: true`

**`lib.json`** — 라이브러리 빌드용 (`extends: ./base.json`)

추가 옵션:
- `declaration: true`, `declarationMap: true`, `sourceMap: true`
- `outDir: "./dist"`, `rootDir: "./src"`
- `composite: false` (라이브러리 자체는 솔루션 빌드 대상 아님)

**`react-lib.json`** — React 라이브러리용 (`extends: ./lib.json`)

추가 옵션:
- `jsx: "react-jsx"`, `jsxImportSource: "react"`
- `lib: ["ES2022", "DOM", "DOM.Iterable"]`

**`README.md`**

세 가지 변형의 용도와 사용 예시:
```jsonc
// 일반 TS 라이브러리
{ "extends": "@methii-oss/tsconfig/lib.json" }

// React 컴포넌트 라이브러리
{ "extends": "@methii-oss/tsconfig/react-lib.json" }

// 그 외 (스크립트, 도구)
{ "extends": "@methii-oss/tsconfig/base.json" }
```

**완료 조건**

- 임시 테스트 디렉터리에 `tsconfig.json`을 만들어 `extends`로 참조한 뒤 `tsc --noEmit` 통과 확인

---

### 작업 3: `@methii-oss/vite-config-lib`

이 패키지가 이 저장소의 **핵심 가치**다. Vite 라이브러리 빌드 설정을 표준화하고, 무엇보다 **peerDependencies를 자동으로 external 처리**하여 React/Radix 등이 번들에 중복 포함되는 사고를 원천 차단한다.

**`packages/vite-config-lib/package.json`**

```jsonc
{
  "name": "@methii-oss/vite-config-lib",
  "version": "0.1.0",
  "description": "Vite library mode preset for Methii OSS packages with peer-dep externalization",
  "license": "MIT",
  "type": "module",
  "publishConfig": { "access": "public" },
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "files": ["dist"],
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "typecheck": "tsc --noEmit"
  },
  "peerDependencies": {
    "vite": "^5.0.0 || ^6.0.0"
  },
  "dependencies": {
    "vite-plugin-dts": "^4.0.0"
  },
  "devDependencies": {
    "@methii-oss/tsconfig": "workspace:*",
    "typescript": "catalog:" /* 또는 명시 버전 */,
    "vite": "^6.0.0"
  }
}
```

**`tsconfig.json`**

```jsonc
{
  "extends": "@methii-oss/tsconfig/lib.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src"]
}
```

**`src/index.ts`** — 다음 동작을 구현하는 `defineLibConfig` 함수를 export

```ts
import { defineConfig, type UserConfig } from 'vite'
import dts from 'vite-plugin-dts'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

export interface LibConfigOptions {
  /** 진입점 파일 경로 (default: 'src/index.ts') */
  entry?: string | Record<string, string>
  /** 빌드 포맷 (default: ['es']) */
  formats?: Array<'es' | 'cjs'>
  /** 추가 external 패턴 (정규식 또는 문자열) */
  additionalExternals?: Array<string | RegExp>
  /** .d.ts 생성 여부 (default: true) */
  dts?: boolean
  /** package.json 경로 (default: 'package.json') */
  packageJsonPath?: string
}

export function defineLibConfig(options: LibConfigOptions = {}): UserConfig {
  const {
    entry = 'src/index.ts',
    formats = ['es'],
    additionalExternals = [],
    dts: enableDts = true,
    packageJsonPath = 'package.json',
  } = options

  // 1) 소비자의 package.json에서 peerDependencies를 읽는다
  const pkg = JSON.parse(
    readFileSync(resolve(process.cwd(), packageJsonPath), 'utf-8')
  )
  const peerDeps = Object.keys(pkg.peerDependencies ?? {})

  // 2) peerDeps + 일반적인 서브패스 패턴 + 사용자 추가분으로 external 구성
  const external: Array<string | RegExp> = [
    ...peerDeps,
    // React 서브경로 (jsx-runtime 등)
    /^react\//,
    /^react-dom\//,
    // 모노레포 스타일 스코프 (Radix 등)
    /^@radix-ui\//,
    // Node 빌트인
    /^node:/,
    ...additionalExternals,
  ]

  return defineConfig({
    build: {
      lib: {
        entry,
        formats,
        fileName: (format, name) =>
          format === 'es' ? `${name}.js` : `${name}.cjs`,
      },
      rollupOptions: {
        external,
        output: {
          // 의존성이 동일 청크에 합쳐지지 않도록
          preserveModules: false,
        },
      },
      sourcemap: true,
      // 라이브러리는 minify 끄는 게 디버깅에 유리 (소비자가 minify)
      minify: false,
    },
    plugins: enableDts
      ? [
          dts({
            insertTypesEntry: true,
            rollupTypes: false,
          }),
        ]
      : [],
  })
}
```

**중요한 설계 결정**:
- `peerDependencies`에서 external을 자동 추출 → 사용자가 vite.config에서 external을 또 적을 필요가 없음
- `react-dom/client`, `react/jsx-runtime` 같은 서브경로 import도 정규식으로 잡음
- `@radix-ui/*`를 패턴으로 잡아두어 Radix 서브패키지를 일일이 peer에 안 넣어도 external 처리됨
- `additionalExternals`로 escape hatch 제공

**`README.md`**

설치/사용/옵션 표를 명시. 사용 예:

```ts
// 소비자의 vite.config.ts
import { defineLibConfig } from '@methii-oss/vite-config-lib'

export default defineLibConfig({
  entry: 'src/index.ts',
})
```

**완료 조건**

- `pnpm --filter @methii-oss/vite-config-lib build` 성공
- 임시 샘플 패키지에서 사용 → `vite build` → dist에 React가 번들되지 않은 것을 `grep -c "react"` 비슷한 방식으로 검증
- 샘플 패키지에서 `.d.ts` 파일이 dist에 생성되는지 확인

---

### 작업 4: `@methii-oss/eslint-config`

**`packages/eslint-config/package.json`**

```jsonc
{
  "name": "@methii-oss/eslint-config",
  "version": "0.1.0",
  "description": "ESLint flat config preset for Methii OSS packages",
  "license": "MIT",
  "type": "module",
  "publishConfig": { "access": "public" },
  "exports": {
    "./base": "./base.js",
    "./react": "./react.js"
  },
  "files": ["base.js", "react.js"],
  "peerDependencies": {
    "eslint": "^9.0.0"
  },
  "dependencies": {
    "@eslint/js": "^9.0.0",
    "typescript-eslint": "^8.0.0",
    "eslint-plugin-react": "^7.35.0",
    "eslint-plugin-react-hooks": "^5.0.0",
    "globals": "^15.0.0"
  }
}
```

**`base.js`** — TypeScript 프로젝트 공통

- `@eslint/js` recommended
- `typescript-eslint` recommended (type-checked는 옵션, 기본은 끄기 — 성능)
- 일반적인 룰: `no-console: warn`, `no-debugger: warn`, `prefer-const: error`

**`react.js`** — React 라이브러리/앱용

- `base`를 spread
- `eslint-plugin-react` + `react-hooks` recommended
- JSX 환경 globals
- React 17+ new JSX transform (`react/react-in-jsx-scope: off`)

**`README.md`**

사용 예:

```js
// 소비자의 eslint.config.js
import react from '@methii-oss/eslint-config/react'

export default [
  ...react,
  {
    // 프로젝트 고유 규칙
  },
]
```

**완료 조건**

- 임시 샘플 React TS 파일에 `eslint --no-warn-ignored` 통과

---

### 작업 5: Changesets & CI

**`.changeset/config.json`**

```jsonc
{
  "$schema": "https://unpkg.com/@changesets/config/schema.json",
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "fixed": [],
  "linked": [],
  "access": "public",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": []
}
```

**`.changeset/README.md`** — Changesets 표준 안내문

**`.github/workflows/ci.yml`**

- 트리거: push, pull_request
- Node 20, pnpm cache 활성화
- 단계: `pnpm install --frozen-lockfile` → `pnpm typecheck` → `pnpm lint` → `pnpm build`

**`.github/workflows/release.yml`**

- 트리거: `main` 브랜치 push
- `changesets/action@v1` 사용
  - `publish: pnpm release`
  - `version: pnpm version-packages`
- npm publish를 위한 `NPM_TOKEN` 시크릿 가정
- 처음에는 publish job을 주석 처리하거나 dry-run으로 두고, 첫 수동 publish 후 활성화 (TODO 주석 명시)

**루트 package.json scripts**

```jsonc
{
  "scripts": {
    "build": "pnpm -r --filter=./packages/* build",
    "typecheck": "pnpm -r --filter=./packages/* typecheck",
    "lint": "eslint packages",
    "changeset": "changeset",
    "version-packages": "changeset version",
    "release": "pnpm build && changeset publish"
  }
}
```

**완료 조건**

- `pnpm changeset --empty` 실행 시 빈 changeset 파일 생성됨
- CI YAML이 `actionlint` 또는 GitHub Actions UI에서 문법 에러 없이 인식됨

---

### 작업 6: 문서화 & 최종 검증

**루트 `README.md`** 구성:

1. 한 줄 설명: "Shared developer tooling for Methii OSS packages"
2. 포함 패키지 표 (이름, 한 줄 설명, npm 배지 자리)
3. 누구를 위한 저장소인가 (Methii OSS 피처 패키지 개발자 + 본체)
4. 로컬 개발 방법
   - `pnpm install`
   - 새 changeset 추가하는 법
5. 릴리스 흐름 (Changeset PR → merge → 자동 publish)
6. 라이선스: MIT

각 패키지의 `README.md`는 다음을 포함해야 함:
- 설치 명령
- 최소한의 사용 예시
- 옵션/exports 표

**최종 검증 — 통합 스모크 테스트**

저장소 밖에 임시 폴더를 만들고 (예: `/tmp/methii-oss-smoke/`) 다음을 수행:

1. `npm init -y`
2. `pnpm add -D @methii-oss/tsconfig @methii-oss/vite-config-lib @methii-oss/eslint-config vite typescript` (로컬 yalc 또는 file: 경로 사용)
3. `tsconfig.json`에 `"extends": "@methii-oss/tsconfig/react-lib.json"` 설정
4. `src/index.ts`에 React 컴포넌트 하나 export
5. `vite.config.ts`에서 `defineLibConfig` 호출
6. `package.json`에 `peerDependencies` 추가: react, react-dom
7. `pnpm dlx vite build`
8. **검증 포인트**:
   - `dist/index.js`에 `react`, `react-dom` 문자열이 import 형태로만 등장하고 React 런타임 코드가 번들되지 않았는지 확인
   - `dist/index.d.ts`가 생성되었는지 확인
   - `eslint .`가 노이즈 없이 통과하는지 확인

이 스모크 테스트 결과를 최종 보고에 포함할 것.

## 5. 검증 체크리스트 (한 번에 보기)

작업 완료 시 다음을 모두 만족해야 한다.

- [ ] `pnpm install`이 깨끗하게 통과
- [ ] `pnpm -r typecheck`가 깨끗하게 통과
- [ ] `pnpm -r build`가 깨끗하게 통과
- [ ] `pnpm lint`가 깨끗하게 통과
- [ ] 각 패키지의 `package.json`에 `name`, `version`, `license`, `publishConfig`, `exports`, `files`가 모두 명시
- [ ] 루트 `README.md`와 각 패키지 `README.md`가 의미 있는 내용으로 작성됨
- [ ] LICENSE 파일이 루트와 각 패키지에 존재 (또는 루트에만 두고 package.json에 license 필드로 명시)
- [ ] `.changeset/config.json`이 존재하고 access가 `public`
- [ ] CI workflow가 문법적으로 유효
- [ ] 통합 스모크 테스트(작업 6 마지막)가 통과

## 6. 하지 말 것 (Non-goals)

다음은 **이 작업의 범위 밖**이며, 시키지 않은 일을 하지 말 것:

- npm registry에 실제 publish하지 말 것 (배포는 추후 수동으로 진행)
- `@methii-oss/vitest-preset`, `@methii-oss/prettier-config` 등 명시되지 않은 추가 패키지를 만들지 말 것 (후속 작업)
- Husky, lint-staged, commitlint 등 git hook 도구를 추가하지 말 것 (현 단계 불필요)
- Turborepo, Nx 등 빌드 오케스트레이터를 추가하지 말 것 (pnpm workspace만으로 충분)
- README에 가짜 npm 배지나 가짜 다운로드 카운트 이미지를 넣지 말 것
- 결정 사항 표(섹션 2)의 어떤 항목도 임의로 변경하지 말 것 — 변경이 필요하다고 판단되면 작업 시작 전에 보고하고 확인을 받을 것
- 코드 안에 `// TODO`, `// FIXME`를 남발하지 말 것. 정말 필요한 곳에만 명시적 이유와 함께 남길 것

## 7. 보고 양식

작업이 끝나면 다음 형식으로 한 번에 보고할 것:

```
## 완료 보고

### 생성된 파일 목록
(트리 형태)

### 검증 결과
- pnpm install: ✅/❌
- pnpm typecheck: ✅/❌
- pnpm build: ✅/❌
- pnpm lint: ✅/❌
- 통합 스모크 테스트: ✅/❌ (구체적 결과)

### 결정 사항에서 벗어난 부분
(없으면 "없음")

### 다음 단계 제안
(예: 첫 번째 피처 패키지 onboarding, npm publish 등)
```
