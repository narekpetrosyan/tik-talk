const eslint = require("@eslint/js");
const tsEslint = require("typescript-eslint");
const angular = require("angular-eslint");
const eslintPluginPrettier = require('eslint-plugin-prettier/recommended')
const globals = require("globals");

module.exports = tsEslint.config(
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      sourceType: "module",
    },
    files: ["**/*.ts"],
    extends: [
      eslint.configs.recommended,
      ...tsEslint.configs.recommended,
      ...tsEslint.configs.stylistic,
      ...angular.configs.tsRecommended,
      eslintPluginPrettier,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      "@angular-eslint/directive-selector": [
        "error",
        {
          type: "attribute",
          prefix: "app",
          style: "camelCase",
        },
      ],
      "@angular-eslint/component-selector": [
        "error",
        {
          type: "element",
          prefix: "app",
          style: "kebab-case",
        },
      ],
    },
  },
  {
    files: ["**/*.html"],
    extends: [
      ...angular.configs.templateRecommended,
      ...angular.configs.templateAccessibility,
      eslintPluginPrettier
    ],
    rules: {},
  },
);
