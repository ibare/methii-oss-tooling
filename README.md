# methii-oss-tooling

> Shared developer tooling for Methii OSS packages

Methii 생태계에서 OSS로 공개되는 패키지들이 공통으로 사용하는 개발자 인프라 패키지 모음입니다.

**핵심 목표**: 호스트 프로젝트(`methii/apps/web`)가 OSS 피처 패키지(Oon, FACET, depix, fizzex, aperi21, patjuk, trama 등)를 번들링할 때 **중복 번들 0%, 버전 불일치 0%**를 달성합니다.

## 포함된 패키지

| 패키지 | 설명 |
|---|---|
| [`@methii-oss/peer-policy`](./packages/peer-policy) | 공유 의존성 버전 매트릭스(SSOT) + 검증 CLI |
| [`@methii-oss/vite-config-lib`](./packages/vite-config-lib) | Vite 라이브러리 빌드 프리셋 (auto-external + bundle guard) |
| [`@methii-oss/tsconfig`](./packages/tsconfig) | 공유 TypeScript 설정 (base / lib / react-lib) |
| [`@methii-oss/eslint-config`](./packages/eslint-config) | ESLint flat config 프리셋 (base / react) |

## 안전망 구조

피처 패키지가 호스트에 통합될 때 발생할 수 있는 사고를 다층으로 차단합니다:

1. **매트릭스 (peer-policy)** — 공유 패키지 버전을 단일 진실의 출처로 고정
2. **자동 external (vite-config-lib)** — 매트릭스 + peerDependencies를 자동으로 번들에서 제외
3. **Bundle guard (vite-config-lib)** — 자동 external을 우회한 케이스를 빌드 시 탐지하여 실패
4. **검증 CLI (peer-policy)** — package.json 정합성을 CI에서 검증

## 누구를 위한 저장소인가

- **Methii OSS 피처 패키지 개발자** — Fizzex, FACET 등 독립 저장소에서 본 툴링을 의존성으로 사용
- **methii/apps/web 본체** — 동일 툴링을 사용하여 OSS 패키지와 일관된 빌드/린트 경험 유지

각 툴링 패키지의 API는 외부 OSS 사용자가 처음 봤을 때도 자연스럽도록 설계되었습니다.

## 마이그레이션

기존 OSS 피처 리포를 본 툴링으로 갈아타려면 [MIGRATION.md](./MIGRATION.md)의 단계별 절차를 따르세요.

## 로컬 개발

요구사항: Node 22.13 이상, pnpm 11 이상.

```bash
pnpm install
pnpm typecheck
pnpm build
pnpm lint
```

### 새 changeset 추가

변경사항이 사용자에게 영향을 주는 경우 PR과 함께 changeset을 동봉합니다.

```bash
pnpm changeset
```

대화형 프롬프트에 따라 영향 받는 패키지와 semver bump 종류(patch/minor/major)를 선택하고, 변경 요약을 작성하면 `.changeset/*.md` 파일이 생성됩니다.

## 릴리스 흐름

### 일반 릴리스 (자동화)

1. PR에 changeset이 포함된 채로 `main`에 머지
2. GitHub Actions의 `release` 워크플로가 자동으로 "Version Packages" PR 생성
3. 해당 PR을 머지하면 버전 bump + 변경 로그가 갱신되고, npm에 자동 publish (provenance 서명 포함)

### 첫 publish 절차 (한 번만)

이 절차는 `0.1.0` 첫 등록 시 한 번만 수행합니다. 이후로는 위 자동화 흐름을 사용합니다.

1. npm 계정에 `@methii-oss` 스코프 권한 확보 (조직 생성 또는 본인 스코프 활성화)
2. npm Automation 토큰 발급 → GitHub 리포 Settings → Secrets and variables → Actions → `NPM_TOKEN` 등록
3. `main` 브랜치를 GitHub에 푸시
4. GitHub Actions → **Release** 워크플로 → **Run workflow** → `initial-publish: true` 체크 → 실행
5. npm 레지스트리에서 4개 패키지(`@methii-oss/peer-policy`, `vite-config-lib`, `tsconfig`, `eslint-config`)가 `0.1.0`으로 등록되었는지 확인
6. 이후로는 일반 릴리스 흐름 사용 — `initial-publish` 플래그는 다시 사용하지 말 것 (재실행 시 npm이 409로 거부)

## 라이선스

MIT © day1company
