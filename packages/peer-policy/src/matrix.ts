/**
 * Methii OSS 공유 의존성 버전 매트릭스 (단일 진실의 출처).
 *
 * 호스트 프로젝트(methii/apps/web)와 OSS 피처 패키지(Oon, FACET, depix, fizzex,
 * aperi21, patjuk, trama 등)가 동일한 메이저/마이너 버전을 사용하도록 강제하여
 * 중복 번들 및 버전 불일치를 차단합니다.
 *
 * 범위 책정 원칙:
 *   - 호스트(methii/apps/web)가 현재 사용하는 정확한 버전을 caret floor로 잡는다.
 *     호스트가 ^19.2.5를 쓰고 있으면 매트릭스도 ^19.2.5로 floor를 끌어올려서,
 *     OSS 패키지가 더 낮은 패치를 명시하다가 호스트 빌드 시점에 깜짝 충돌을
 *     일으키는 케이스를 막는다.
 *   - 메이저 버전 불일치는 곧 잠재적 ABI 충돌이므로 가장 엄격하게 본다.
 *   - 0.x 패키지는 minor가 곧 major(^0.16.x ↔ ^0.17.x는 호환 불가)이므로
 *     호스트가 minor를 올릴 때 반드시 매트릭스를 함께 갱신해야 한다.
 *   - 매트릭스에 없는 패키지는 자유 (각 패키지가 알아서 관리).
 */

export interface PeerPolicy {
  /** 정확한 패키지명 → 필수 semver 범위 */
  readonly exact: Readonly<Record<string, string>>
  /**
   * 서브패키지 패턴 (예: @radix-ui/*).
   * 각 서브패키지의 버전은 케이스별로 다르므로 범위는 검증하지 않지만,
   * bundle external/guard 대상으로는 일괄 처리한다.
   */
  readonly patterns: ReadonlyArray<RegExp>
  /** 항상 external 처리되어야 하는 노드 빌트인 */
  readonly nodeBuiltins: RegExp
}

export const PEER_POLICY: PeerPolicy = {
  exact: Object.freeze({
    // ---- React 생태계 ----
    'react': '^19.2.5',
    'react-dom': '^19.2.5',

    // ---- 캔버스/3D/모션 ----
    'konva': '^10.2.5',
    'react-konva': '^19.2.3',
    'three': '^0.183.0',
    '@types/three': '^0.183.0',
    'gsap': '^3.15.0',
    'framer-motion': '^12.38.0',

    // ---- Tiptap ----
    '@tiptap/core': '^3.22.5',
    '@tiptap/pm': '^3.22.5',
    '@tiptap/react': '^3.22.5',
    '@tiptap/starter-kit': '^3.22.5',

    // ---- 상태/스키마/불변성 ----
    'zustand': '^5.0.12',
    'zod': '^4.4.1',
    'immer': '^10.2.0',

    // ---- DnD ----
    '@dnd-kit/core': '^6.3.1',
    '@dnd-kit/sortable': '^10.0.0',
    '@dnd-kit/utilities': '^3.2.2',

    // ---- 스타일링 ----
    'clsx': '^2.1.1',
    'class-variance-authority': '^0.7.1',
    'tailwind-merge': '^3.5.0',
    'tailwind-variants': '^2.1.0',
    'tailwindcss': '^4.2.4',

    // ---- 폼 ----
    'react-hook-form': '^7.74.0',
    '@hookform/resolvers': '^5.2.2',

    // ---- i18n ----
    'i18next': '^25.10.10',
    'react-i18next': '^16.6.6',
    'i18next-browser-languagedetector': '^8.2.1',
    'i18next-resources-to-backend': '^1.2.1',

    // ---- 에디터/입력 ----
    // monaco-editor는 0.x → minor가 곧 major. 호스트가 0.53.x로 올라가면
    // 반드시 매트릭스도 함께 갱신해야 중복 번들을 피한다.
    'monaco-editor': '^0.52.2',
    '@monaco-editor/react': '^4.7.0',
    'cmdk': '^1.1.1',
    'embla-carousel-react': '^8.6.0',
    'react-virtuoso': '^4.18.6',
    'react-image-crop': '^11.0.10',

    // ---- 알림/UI 보조 ----
    'sonner': '^2.0.7',
    '@floating-ui/react': '^0.27.19',

    // ---- 시각화 ----
    'recharts': '^3.8.1',
    'd3-force': '^3.0.0',
    'd3-hierarchy': '^3.1.2',
    'polygon-clipping': '^0.15.7',

    // ---- 도메인 라이브러리 ----
    'katex': '^0.16.45',
    'axios': '^1.15.2',
    'marked': '^16.4.2',
    '@phosphor-icons/react': '^2.1.10',
    'jsep': '^1.0.0',

    // ---- 저장/유틸 ----
    'idb': '^8.0.3',
    'uuid': '^11.1.1',
    'modern-screenshot': '^4.7.0',
  }),
  patterns: Object.freeze([
    /^@radix-ui\//,
    /^@tiptap\//,
    /^@dnd-kit\//,
    /^@phosphor-icons\//,
    // React 서브경로 (jsx-runtime, jsx-dev-runtime 등)
    /^react\//,
    /^react-dom\//,
  ]),
  nodeBuiltins: /^node:/,
}
