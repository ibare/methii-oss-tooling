import base from '@methii-oss/eslint-config/base'

export default [
  ...base,
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      'packages/eslint-config/*.js',
    ],
  },
  {
    files: ['**/src/cli.ts', '**/bin/**'],
    rules: {
      'no-console': 'off',
    },
  },
]
