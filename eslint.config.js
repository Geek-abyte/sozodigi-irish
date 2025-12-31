import js from "@eslint/js";
import next from "@next/eslint-plugin-next";
import prettier from "eslint-plugin-prettier";
import react from "eslint-plugin-react";

export default [
  js.configs.recommended,
  {
    plugins: {
      next,
      prettier,
      react, // ✅ needed for JSX parsing + linting
    },
    languageOptions: {
      globals: {
        // Browser globals
        window: "readonly",
        document: "readonly",
        navigator: "readonly",
        localStorage: "readonly",
        sessionStorage: "readonly",
        fetch: "readonly",
        AbortController: "readonly",
        console: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        // Node.js globals
        process: "readonly",
        Buffer: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        global: "readonly",
        module: "readonly",
        require: "readonly",
        exports: "readonly",
      },
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true, // ✅ enables JSX parsing
        },
      },
    },
    settings: {
      react: {
        version: "detect", // ✅ auto-detect React version
      },
    },
    rules: {
      "prettier/prettier": "warn",
      "react/react-in-jsx-scope": "off",
      "no-unused-vars": "warn",
      "no-prototype-builtins": "off",
    },
  },
];
