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
  /*
  testPathIgnorePatterns: [
    "/node_modules/",
    "/dist/",
    "__tests__/common.ts",
    "__tests__/getGenere/.test.ts",
    "__tests__/artistiSimili/.test.ts",
    "__tests__/getGeneri/.test.ts",
    "__tests__/albumSearch/.test.ts",
    "__tests__/braniAlbum/.test.ts",
    "__tests__/artistiSearch/.test.ts", //TODO: togliere, è provvisorio!
  ]*/
};
