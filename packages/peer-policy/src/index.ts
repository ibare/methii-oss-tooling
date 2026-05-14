export { PEER_POLICY, type PeerPolicy } from './matrix.js'
export {
  validatePackage,
  isMatrixPackage,
  type PackageJsonShape,
  type ValidateOptions,
  type Violation,
  type ViolationKind,
} from './validate.js'
export { getMatrixExternals, detectMatrixModule } from './external.js'
