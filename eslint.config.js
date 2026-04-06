import js from "@eslint/js";

export default [
  js.configs.recommended,

  {
    files: ["**/*.js"],

    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        console: "readonly",
        process: "readonly",
      },
    },

    rules: {
      // errors
      "no-undef": "error",

      // warnings
      "no-unused-vars": "off", // handled by plugin
      "unused-imports/no-unused-imports": "warn",

      // style
      "no-console": "off",
    },

    plugins: {
      "unused-imports": require("eslint-plugin-unused-imports"),
    },
  },
];
