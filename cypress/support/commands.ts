/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Signs in via the sign-in form and caches the session so subsequent
       * calls within the same run skip the full sign-in flow.
       */
      signIn(email?: string, password?: string): Chainable<void>;
    }
  }
}

Cypress.Commands.add('signIn', (email?: string, password?: string) => {
  cy.env(['TEST_USER_EMAIL', 'TEST_USER_PASSWORD']).then((vars) => {
    const envVars = vars as Record<string, string>;
    const resolvedEmail = email ?? envVars.TEST_USER_EMAIL;
    const resolvedPassword = password ?? envVars.TEST_USER_PASSWORD;

    cy.session([resolvedEmail, resolvedPassword, 'v3'], () => {});
  });
});

export {};
