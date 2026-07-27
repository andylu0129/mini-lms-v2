import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Generated test coverage report, not source.
    "coverage/**",
  ]),
  {
    // Cypress's Chainable augmentation requires declaration merging into its
    // ambient global namespace; there's no ES module equivalent for it.
    files: ["cypress/support/**/*.ts"],
    rules: {
      "@typescript-eslint/no-namespace": "off",
    },
  },
  {
    // Chai's fluent assertions (e.g. `expect(x).to.be.true`) read as unused
    // member expressions to this rule, but the assertion happens via getters.
    files: ["cypress/**/*.ts"],
    rules: {
      "@typescript-eslint/no-unused-expressions": "off",
    },
  },
  {
    // Cypress requires this exact setupNodeEvents(on, config) signature even
    // when no listeners are registered yet.
    files: ["cypress.config.ts"],
    rules: {
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    },
  },
  {
    // import/no-anonymous-default-export exists so React Fast Refresh can
    // identify components by name; it doesn't apply to plain build config
    // objects that are never bundled into the app.
    files: ["vitest.config.ts", "cypress.config.ts"],
    rules: {
      "import/no-anonymous-default-export": "off",
    },
  },
]);

export default eslintConfig;
