describe('Admin View', () => {
  beforeEach(() => {
    cy.signInAdmin();
    cy.visit('/admin/dashboard');
    cy.waitForHydration();
  });

  it('displays the stats panel with all three stat labels', () => {
    cy.contains('Total consultations').should('be.visible');
    cy.contains('Upcoming').should('be.visible');
    cy.contains('Students').should('be.visible');
  });

  it('displays the records table controls', () => {
    cy.contains('Consultation records').should('be.visible');
    cy.get('input[placeholder="Search student or reason"]').should('be.visible');
    cy.get('[aria-label="Refresh table"]').should('be.visible');
  });

  it('filters by status via the status select', () => {
    cy.get('[role="combobox"]').click();
    cy.contains('[role="option"]', 'Cancelled').click();
    cy.get('[role="combobox"]').should('contain.text', 'Cancelled');
  });

  it('shows an empty state when the search matches nothing', () => {
    cy.get('input[placeholder="Search student or reason"]').type('zzznoresultszzz');
    cy.contains('No matching consultations').should('be.visible');
  });

  it('clears the search via the clear button', () => {
    cy.get('input[placeholder="Search student or reason"]').type('zzz');
    cy.get('[aria-label="Clear search"]').click();
    cy.get('input[placeholder="Search student or reason"]').should('have.value', '');
  });

  it('rejects student credentials on the admin portal', () => {
    cy.visit('/auth/sign-in');
    cy.waitForHydration();
    cy.contains('button', 'Go to the admin portal').click();
    cy.env(['TEST_USER_EMAIL', 'TEST_USER_PASSWORD']).then((vars) => {
      const envVars = vars as Record<string, string>;
      cy.get('#email').type(envVars.TEST_USER_EMAIL);
      cy.get('#password').type(envVars.TEST_USER_PASSWORD);
      cy.contains('button[type="submit"]', 'Enter admin portal').click();
      cy.contains('Invalid login credentials').should('be.visible');
      cy.url().should('not.include', '/admin/dashboard');
    });
  });

  it('rejects admin credentials on the student portal', () => {
    cy.visit('/auth/sign-in');
    cy.waitForHydration();
    cy.env(['TEST_ADMIN_EMAIL', 'TEST_ADMIN_PASSWORD']).then((vars) => {
      const envVars = vars as Record<string, string>;
      cy.get('#email').type(envVars.TEST_ADMIN_EMAIL);
      cy.get('#password').type(envVars.TEST_ADMIN_PASSWORD);
      cy.contains('button[type="submit"]', 'Sign in').click();
      cy.contains('Invalid login credentials').should('be.visible');
      cy.url().should('not.include', '/student/dashboard');
    });
  });
});
