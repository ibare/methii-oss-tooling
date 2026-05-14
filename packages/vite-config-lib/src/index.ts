import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig, type Plugin, type UserConfig } from 'vite'
import dts from 'vite-plugin-dts'
import {
  PEER_POLICY,
  detectMatrixModule,
  getMatrixExternals,
  type PeerPolicy,
} from '@methii-oss/peer-policy'

export interface LibConfigOptions {
  /** 진입점 파일 경로 (default: 'src/index.ts') */
  entry?: string | Record<string, string>
  /** 빌드 포맷 (default: ['es']) */
  formats?: Array<'es' | 'cjs'>
  /** 추가 external 패턴 (매트릭스 + peerDependencies에 더해짐) */
  additionalExternals?: Array<string | RegExp>
  /** .d.ts 생성 여부 (default: true) */
  dts?: boolean
  /** package.json 경로 (default: 'package.json') */
  packageJsonPath?: string
  /**
   * Vite resolve.dedupe 추가 항목.
   * 매트릭스 기본 dedupe(react, react-dom, jsx-runtime)에 더해진다.
   * 호스트와 동일 인스턴스를 강제하려는 패키지를 명시.
   */
  dedupe?: string[]
  /**
   * Bundle guard 활성화 여부 (default: true).
   * 매트릭스에 속한 패키지가 dist에 코드로 포함되면 빌드를 실패시킨다.
   */
  bundleGuard?: boolean
  /** 매트릭스 커스터마이즈 (테스트용) */
  policy?: PeerPolicy
}

interface PackageJsonShape {
  peerDependencies?: Record<string, string>
}

function bundleGuardPlugin(policy: PeerPolicy): Plugin {
  return {
    name: 'methii-oss-bundle-guard',
    apply: 'build',
    generateBundle(_options, bundle) {
      const violations: string[] = []
      const seen = new Set<string>()

      for (const [chunkName, asset] of Object.entries(bundle)) {
        if (asset.type !== 'chunk') continue
        for (const moduleId of Object.keys(asset.modules)) {
          const hit = detectMatrixModule(moduleId, policy)
          if (hit === null) continue
          const key = `${hit}::${chunkName}`
          if (seen.has(key)) continue
          seen.add(key)
          violations.push(`  - [${hit}] chunk='${chunkName}'\n      module: ${moduleId}`)
        }
      }

      if (violations.length > 0) {
        this.error(
          `[methii-oss-bundle-guard] 매트릭스 패키지가 dist에 포함되었습니다. ` +
            `이 패키지는 peerDependencies로 선언되어 external 처리되어야 합니다.\n` +
            violations.join('\n'),
        )
      }
    },
  }
}

export function defineLibConfig(options: LibConfigOptions = {}): UserConfig {
  const {
    entry = 'src/index.ts',
    formats = ['es'],
    additionalExternals = [],
    dts: enableDts = true,
    packageJsonPath = 'package.json',
    dedupe: extraDedupe = [],
    bundleGuard = true,
    policy = PEER_POLICY,
  } = options

  const pkg = JSON.parse(
    readFileSync(resolve(process.cwd(), packageJsonPath), 'utf-8'),
  ) as PackageJsonShape
  const peerDeps = Object.keys(pkg.peerDependencies ?? {})

  // External: 매트릭스(공통) + 패키지 자신의 peerDependencies + 사용자 추가분
  const external: Array<string | RegExp> = [
    ...getMatrixExternals(policy),
    ...peerDeps,
    ...additionalExternals,
  ]

  // 호스트(methii/apps/web)가 dedupe하는 항목과 동일하게 정렬.
  // 라이브러리 자신의 빌드에는 영향이 없지만, demo/storybook 등 함께 쓰이는
  // 컨슈머 빌드와의 정합성을 위해 기본값으로 export한다.
  const dedupe = Array.from(
    new Set([
      'react',
      'react-dom',
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
      ...extraDedupe,
    ]),
  )

  const plugins: Array<Plugin | Plugin[]> = []
  if (enableDts) {
    plugins.push(dts({ insertTypesEntry: true }))
  }
  if (bundleGuard) {
    plugins.push(bundleGuardPlugin(policy))
  }

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
          preserveModules: false,
        },
      },
      sourcemap: true,
      // 라이브러리는 소비자가 다시 minify하므로 디버깅 편의를 위해 끔
      minify: false,
    },
    resolve: {
      dedupe,
    },
    plugins,
  })
}
