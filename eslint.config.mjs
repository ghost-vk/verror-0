import eslintJs from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import eslintPluginImport from "eslint-plugin-import";
import typescriptEslint from "typescript-eslint";


export default [
  {
    ...eslintJs.configs.recommended,
    ...typescriptEslint.configs.recommended.map((config) => ({
      ...config,
    })),
    // languageOptions: { parserOptions: { projectService: true } },
    files: backFiles,
    plugins: {
      import: eslintPluginImport,
    },
    rules: {
      "@typescript-eslint/explicit-function-return-type": 1,
      "@typescript-eslint/explicit-module-boundary-types": 0,
      "@typescript-eslint/no-explicit-any": 0,
      "@typescript-eslint/no-unused-vars": 1,
      "import/order": [
        1,
        {
          "newlines-between": "never",
          alphabetize: { order: "asc", caseInsensitive: true },
          groups: ["builtin", "external", "internal", "parent", "sibling"],
        },
      ],
    },
  },

  eslintConfigPrettier,
];
