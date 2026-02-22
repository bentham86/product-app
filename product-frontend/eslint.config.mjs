import nextVitals from "eslint-config-next/core-web-vitals"
import { globalIgnores } from "eslint/config"

export default [
  globalIgnores([
    ".next/**",
    "node_modules/**",
    "out/**",
    "build/**",
    "coverage/**",
    "*.config.js",
    "*.config.mjs",
    "next-env.d.ts",
  ]),
  ...nextVitals,
]
