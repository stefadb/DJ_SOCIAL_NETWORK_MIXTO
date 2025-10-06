const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
  },
  testMatch: [
    "**/__tests__/**/GET multipla/*.test.ts",
    "**/__tests__/**/GET singola/*.test.ts",
    "**/__tests__/deezer_api_tests/**/*.test.ts"
  ],
  
  testPathIgnorePatterns: [
    "/node_modules/",
    "/dist/",
    "__tests__/entities_crud_tests/visualizzazione/GET multipla/.test.ts",
  ]
};
