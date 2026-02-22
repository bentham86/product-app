import nextJest from "next/jest.js"

const createJestConfig = nextJest({ dir: "./" })

/** @type {import('jest').Config} */
const customJestConfig = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testMatch: ["**/__tests__/**/*.test.[jt]s?(x)"],
  testPathIgnorePatterns: [
    "<rootDir>/node_modules/",
    "<rootDir>/.next/",
    "<rootDir>/.next/standalone/",
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  collectCoverageFrom: [
    "components/**/*.{ts,tsx}",
    "hooks/**/*.{ts,tsx}",
    "services/**/*.ts",
    "!**/*.d.ts",
  ],
}

export default createJestConfig(customJestConfig)
