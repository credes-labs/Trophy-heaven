/**
 * Shared flat ESLint config for the Legacy Crafts monorepo.
 * Consumed by apps/packages via `require("@legacy-crafts/config/eslint")`.
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
