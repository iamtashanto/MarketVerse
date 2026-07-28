import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import jsxA11y from "eslint-plugin-jsx-a11y";
import globals from "globals";

/**
 * Accessibility lint runs in the same pass as everything else and fails the
 * build — not a manual, periodic audit. See docs/FRONTEND_ARCHITECTURE.md §16.
 */
export default [
  js.configs.recommended,
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: { ecmaVersion: "latest", sourceType: "module", ecmaFeatures: { jsx: true } },
      globals: { ...globals.browser, ...globals.es2021 },
    },
    plugins: {
      "@typescript-eslint": tseslint,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "jsx-a11y": jsxA11y,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,
      "react-refresh/only-export-components": "warn",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      // TypeScript already catches undefined identifiers (and understands
      // ambient lib.dom types like RequestInit that ESLint's plain scope
      // analysis doesn't) — this rule is redundant and produces false
      // positives on type-only references. Off for .ts/.tsx, per
      // typescript-eslint's own guidance.
      "no-undef": "off",
    },
  },
  { ignores: ["dist/**", "node_modules/**"] },
];
