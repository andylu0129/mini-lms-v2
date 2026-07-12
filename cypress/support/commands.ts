/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      signInStudent(email?: string, password?: string): Chainable<void>;
      signInAdmin(): Chainable<void>;
      /**
       * Waits until React has hydrated the page. Interactions dispatched
       * earlier land on server-rendered HTML whose handlers don't exist yet
       * (clicks focus but do nothing, keystrokes never reach React state).
       */
      waitForHydration(): Chainable<void>;
    }
  }
}

Cypress.Commands.add('waitForHydration', () => {
  cy.document().should((doc) => {
    const isHydrated = (element: Element | null) =>
      element !== null && Object.keys(element).some((key) => key.startsWith('__reactFiber'));
    expect(isHydrated(doc.body) || isHydrated(doc.body.firstElementChild), 'page is hydrated').to.be.true;
  });
});

Cypress.Commands.add('signInStudent', (email?: string, password?: string) => {
  cy.env(['TEST_USER_EMAIL', 'TEST_USER_PASSWORD']).then((vars) => {
    const envVars = vars as Record<string, string>;
    const resolvedEmail = email ?? envVars.TEST_USER_EMAIL;
    const resolvedPassword = password ?? envVars.TEST_USER_PASSWORD;

    cy.session([resolvedEmail, resolvedPassword, 'v3'], () => {
      cy.visit('/auth/sign-in');
      cy.waitForHydration();
      cy.get('#email').type(resolvedEmail);
      cy.get('#password').type(resolvedPassword);
      cy.contains('button[type="submit"]', 'Sign in').click();
      cy.url().should('include', '/student/dashboard');
    });
  });
});

Cypress.Commands.add('signInAdmin', () => {
  cy.env(['TEST_ADMIN_EMAIL', 'TEST_ADMIN_PASSWORD']).then((vars) => {
    const envVars = vars as Record<string, string>;
    const adminEmail = envVars.TEST_ADMIN_EMAIL;
    const adminPassword = envVars.TEST_ADMIN_PASSWORD;

    cy.session([adminEmail, adminPassword, 'admin-v1'], () => {
      cy.visit('/auth/sign-in');
      cy.waitForHydration();
      cy.contains('button', 'Go to the admin portal').click();
      cy.get('#email').type(adminEmail);
      cy.get('#password').type(adminPassword);
      cy.contains('button[type="submit"]', 'Enter admin portal').click();
      cy.url().should('include', '/admin/dashboard');
    });
  });
});

export {};
