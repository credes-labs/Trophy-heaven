/**
 * Shared flat ESLint config for the Trophy Heaven monorepo.
 * Consumed by apps/packages via `require("@trophy-heaven/config/eslint")`.
 */
const tseslint = require("typescript-eslint")

module.exports = tseslint.config(
  {
    ignores: ["**/dist/**", "**/build/**", "**/.next/**", "**/.medusa/**", "**/coverage/**"],
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
