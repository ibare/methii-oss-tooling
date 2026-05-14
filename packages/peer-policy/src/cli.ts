#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { validatePackage, type PackageJsonShape } from './validate.js'

const args = process.argv.slice(2)
const target = args[0] ?? 'package.json'
const absPath = resolve(process.cwd(), target)

let pkg: PackageJsonShape
try {
  pkg = JSON.parse(readFileSync(absPath, 'utf-8')) as PackageJsonShape
} catch (e) {
  console.error(`[peer-policy] package.json 읽기 실패: ${absPath}`)
  console.error(e instanceof Error ? e.message : String(e))
  process.exit(2)
}

const violations = validatePackage(pkg)
const label = pkg.name ?? target

if (violations.length === 0) {
  console.log(`[peer-policy] OK  ${label}: 위반 없음.`)
  process.exit(0)
}

console.error(`[peer-policy] FAIL  ${label}: ${violations.length}건 위반 발견`)
for (const v of violations) {
  console.error(`  - [${v.kind}] ${v.package}`)
  console.error(`    ${v.message}`)
  if (v.expected !== undefined) console.error(`    expected: ${v.expected}`)
  if (v.actual !== undefined) console.error(`    actual:   ${v.actual}`)
}
process.exit(1)
