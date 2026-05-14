import { PEER_POLICY, type PeerPolicy } from './matrix.js'

/**
 * Vite/Rollup의 `external` 옵션에 그대로 전달할 수 있는 패턴 배열을 반환합니다.
 * - 매트릭스 exact 키 (정확한 패키지명)
 * - 매트릭스 patterns (서브패키지 그룹 정규식)
 * - 노드 빌트인 (`/^node:/`)
 */
export function getMatrixExternals(policy: PeerPolicy = PEER_POLICY): Array<string | RegExp> {
  return [
    ...Object.keys(policy.exact),
    ...policy.patterns,
    policy.nodeBuiltins,
  ]
}

/**
 * 절대경로 형태의 module id(예: Rollup이 제공하는 `chunk.modules` 키)에서
 * 매트릭스에 해당하는 패키지가 발견되면 그 이름을 반환합니다.
 *
 * node_modules 경로 안에서 패키지명을 추출하여 매트릭스와 대조합니다.
 * pnpm의 `.pnpm/<hash>/node_modules/<pkg>` 구조와 일반 `node_modules/<pkg>` 구조 모두 지원.
 */
export function detectMatrixModule(
  moduleId: string,
  policy: PeerPolicy = PEER_POLICY,
): string | null {
  // node_modules/(.pnpm/<hash>/node_modules/)?(@scope/name | name)/...
  const match = moduleId.match(
    /[\\/]node_modules[\\/](?:\.pnpm[\\/][^\\/]+[\\/]node_modules[\\/])?(@[^\\/]+[\\/][^\\/]+|[^\\/]+)/,
  )
  if (!match) return null
  const pkgName = match[1]
  if (pkgName === undefined) return null

  if (pkgName in policy.exact) return pkgName
  // 패턴 매칭 시 패키지명에 trailing slash를 붙여 `/^@radix-ui\//` 같은 패턴이 매칭되도록 한다.
  const probe = `${pkgName}/`
  for (const pattern of policy.patterns) {
    if (pattern.test(probe)) return pkgName
  }
  return null
}
