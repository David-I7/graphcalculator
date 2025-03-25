import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config({
  files: ["**/*.ts"],
  extends: [js.configs.recommended, ...tseslint.configs.recommended],
  languageOptions: {
    globals: globals.node,
    ecmaVersion: 2020,
  },
});
