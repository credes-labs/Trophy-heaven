import tseslint from "typescript-eslint"

/**
 * Storefront lint config. Next.js 16 removed `next lint`; we lint with
 * typescript-eslint directly. Framework correctness (RSC boundaries, image
 * usage) is enforced by `next build`. Keeps CI stable under ESLint 9 flat config.
 */
export default tseslint.config(
  {
    ignores: [".next/**", "node_modules/**", "next-env.d.ts"],
  },
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  }
)
