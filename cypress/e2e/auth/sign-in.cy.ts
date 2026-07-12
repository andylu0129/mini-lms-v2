describe('Sign In', () => {
  beforeEach(() => {
    cy.visit('/auth/sign-in');
    cy.waitForHydration();
  });

  it('displays the sign-in form', () => {
    cy.contains('h1', 'Student sign in').should('be.visible');
    cy.get('#email').should('be.visible');
    cy.get('#password').should('be.visible');
    cy.contains('button[type="submit"]', 'Sign in').should('be.visible');
  });

  it('redirects unauthenticated users to sign-in when visiting the dashboard', () => {
    cy.visit('/student/dashboard');
    cy.url().should('include', '/auth/sign-in');
  });

  it('navigates to sign-up page via the sign-up link', () => {
    cy.contains('a', 'Create an account').click();
    cy.url().should('include', '/auth/sign-up');
  });

  it('toggles between the student and admin portals', () => {
    cy.contains('button', 'Go to the admin portal').click();
    cy.contains('h1', 'Admin portal').should('be.visible');
    cy.contains('button', 'Student sign in').click();
    cy.contains('h1', 'Student sign in').should('be.visible');
  });

  it('shows an error message for invalid credentials', () => {
    cy.get('#email').type('wrong@example.com');
    cy.get('#password').type('WrongPassword1!');
    cy.contains('button[type="submit"]', 'Sign in').click();
    cy.contains('Invalid login credentials').should('be.visible');
  });

  it('redirects to the dashboard after a successful sign-in', () => {
    cy.env(['TEST_USER_EMAIL', 'TEST_USER_PASSWORD']).then((vars) => {
      const envVars = vars as Record<string, string>;
      cy.get('#email').type(envVars.TEST_USER_EMAIL);
      cy.get('#password').type(envVars.TEST_USER_PASSWORD);
      cy.contains('button[type="submit"]', 'Sign in').click();
      cy.url().should('include', '/student/dashboard');
    });
  });
});
