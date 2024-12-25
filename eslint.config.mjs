import globals from "globals";
import pluginJs from "@eslint/js";
import eslintConfigESLint from "eslint-config-eslint";
import eslintConfigPrettier from "eslint-config-prettier";

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...eslintConfigESLint,
  eslintConfigPrettier,
  { files: ["**/*.js"], languageOptions: { sourceType: "commonjs" } },
  { languageOptions: { globals: { ...globals.browser } } },
  pluginJs.configs.recommended,
  { ignores: ["node_modules/**", "src/lib/*"] },
  {
    rules: {
      strict: "off",
      "jsdoc/require-jsdoc": "off",
      "no-unused-vars": "off",
      "no-undef": "off",
      "no-labels": "off",
    },
  },
];
