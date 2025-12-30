import path from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

export default [
  ...compat.extends("next/core-web-vitals", "next/typescript", "prettier"),
  {
    plugins: ["import", "prettier", "react-hooks", "react-perf", "@typescript-eslint"],
    rules: {
      "prettier/prettier": "error",
      "react/jsx-no-bind": "off",
      "react/react-in-jsx-scope": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "react-perf/jsx-no-new-object-as-prop": "off",
      "react-perf/jsx-no-new-function-as-prop": "off",
      "react-perf/jsx-no-new-array-as-prop": "off",
      "react-perf/jsx-no-new-element-as-prop": "off",
      "react-perf/jsx-no-new-string-as-prop": "off",
      "react-hooks/exhaustive-deps": "warn",
      "import/order": [
        "error",
        {
          groups: ["builtin", "external", "internal", ["index", "sibling", "parent"]],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
    },
  },
  {
    ignores: [".next/**", "out/**", "build/**", "next-env.d.ts", "node_modules/**"],
  },
];
