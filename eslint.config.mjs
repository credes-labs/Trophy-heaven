import tseslint from "typescript-eslint"

/**
 * Root flat ESLint config for the Trophy Heaven monorepo. Packages/apps run
 * `eslint src`, and ESLint resolves up to this config. Apps may add their own
 * eslint.config.* to layer framework rules (Next.js) on top.
 */
export default tseslint.config(
  {
    ignores: [
      "**/dist/**",
      "**/build/**",
      "**/.next/**",
      "**/.medusa/**",
      "**/coverage/**",
      "**/node_modules/**",
      "docs/**",
    ],
  },
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/consistent-type-imports": "warn",
    },
  }
)
