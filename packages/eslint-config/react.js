import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import globals from 'globals'
import base from './base.js'

const REACT_FC_BAN = [
  {
    selector: "TSTypeReference[typeName.name='FC']",
    message:
      'React.FC 패턴을 사용하지 마세요. function Component(props: Props) 형태를 사용하세요.',
  },
  {
    selector:
      "TSTypeReference[typeName.object.name='React'][typeName.property.name='FC']",
    message:
      'React.FC 패턴을 사용하지 마세요. function Component(props: Props) 형태를 사용하세요.',
  },
]

/** @type {import('eslint').Linter.Config[]} */
const config = [
  ...base,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    settings: {
      react: { version: 'detect' },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
    },
    rules: {
      ...react.configs.recommended.rules,
      // React 17+ 자동 JSX transform — React import 불필요
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.flatConfigs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'no-restricted-syntax': ['error', ...REACT_FC_BAN],
    },
  },
]

export default config
