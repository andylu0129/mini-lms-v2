describe('Sign Up', () => {
  beforeEach(() => {
    cy.visit('/auth/sign-up');
    cy.waitForHydration();
  });

  it('displays the sign-up form', () => {
    cy.contains('h1', 'Create your account').should('be.visible');
    cy.get('#first-name').should('be.visible');
    cy.get('#last-name').should('be.visible');
    cy.get('#email').should('be.visible');
    cy.get('#password').should('be.visible');
    cy.get('#confirm-password').should('be.visible');
    cy.contains('button[type="submit"]', 'Create account').should('be.visible');
  });

  it('navigates to sign-in page via the sign-in link', () => {
    cy.contains('a', 'Sign in').click();
    cy.url().should('include', '/auth/sign-in');
  });

  it('shows validation errors when submitting an empty form', () => {
    cy.contains('button[type="submit"]', 'Create account').click();
    cy.contains('First name is required').should('be.visible');
  });

  it('shows an error when passwords do not match', () => {
    cy.get('#first-name').type('John');
    cy.get('#last-name').type('Doe');
    cy.get('#email').type('john@example.com');
    cy.get('#password').type('Password1!');
    cy.get('#confirm-password').type('DifferentPassword1!');
    cy.contains('button[type="submit"]', 'Create account').click();
    cy.contains('Passwords do not match').should('be.visible');
  });

  it('shows the success screen for a new registration', () => {
    const unique = Date.now();
    cy.get('#first-name').type('Test');
    cy.get('#last-name').type('User');
    cy.get('#email').type(`test+${unique}@example.com`);
    cy.get('#password').type('Password1!');
    cy.get('#confirm-password').type('Password1!');
    cy.contains('button[type="submit"]', 'Create account').click();
    cy.contains('Check your email').should('be.visible');
  });

  it('shows the success screen even when the email is already registered', () => {
    cy.get('#first-name').type('John');
    cy.get('#last-name').type('Doe');
    cy.env(['TEST_USER_EMAIL']).then((vars) => {
      cy.get('#email').type((vars as Record<string, string>).TEST_USER_EMAIL);
    });
    cy.get('#password').type('Password1!');
    cy.get('#confirm-password').type('Password1!');
    cy.contains('button[type="submit"]', 'Create account').click();
    cy.contains('Check your email').should('be.visible');
  });
});
