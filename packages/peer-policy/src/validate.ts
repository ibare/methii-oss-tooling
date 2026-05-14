import { PEER_POLICY, type PeerPolicy } from './matrix.js'

export interface PackageJsonShape {
  name?: string
  dependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
  peerDependenciesMeta?: Record<string, { optional?: boolean }>
  devDependencies?: Record<string, string>
}

export type ViolationKind =
  /** 매트릭스 패키지가 dependencies에 선언됨 → 번들에 포함되어 중복 발생 위험 */
  | 'dep-should-be-peer'
  /** peerDependencies의 범위가 매트릭스와 불일치 */
  | 'peer-range-mismatch'

export interface Violation {
  kind: ViolationKind
  package: string
  expected?: string
  actual?: string
  message: string
}

export interface ValidateOptions {
  policy?: PeerPolicy
}

export function validatePackage(
  pkg: PackageJsonShape,
  opts: ValidateOptions = {},
): Violation[] {
  const policy = opts.policy ?? PEER_POLICY
  const violations: Violation[] = []
  const deps = pkg.dependencies ?? {}
  const peers = pkg.peerDependencies ?? {}

  for (const [name, version] of Object.entries(deps)) {
    if (isMatrixPackage(name, policy)) {
      violations.push({
        kind: 'dep-should-be-peer',
        package: name,
        actual: version,
        message: `'${name}'는 dependencies가 아닌 peerDependencies로 선언해야 합니다 (중복 번들 방지).`,
      })
    }
  }

  for (const [name, version] of Object.entries(peers)) {
    const expected = policy.exact[name]
    if (expected !== undefined && version !== expected) {
      violations.push({
        kind: 'peer-range-mismatch',
        package: name,
        expected,
        actual: version,
        message: `'${name}'의 peer 범위가 매트릭스와 다릅니다.`,
      })
    }
  }

  return violations
}

export function isMatrixPackage(name: string, policy: PeerPolicy = PEER_POLICY): boolean {
  if (name in policy.exact) return true
  return policy.patterns.some((p) => p.test(name))
}
