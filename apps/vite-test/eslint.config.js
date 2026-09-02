import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    // Scaffold shadcn/base-ui y rutas de TanStack: exportan constantes junto a
    // componentes (buttonVariants, use-sidebar, Route…) por diseño. El HMR
    // limitado de react-refresh es un trade-off aceptado ahí.
    files: [
      'src/components/ui/**',
      'src/hooks/**',
      'src/routes/**',
    ],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
])
