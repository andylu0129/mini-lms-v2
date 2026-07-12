describe('Student Dashboard', () => {
  beforeEach(() => {
    cy.signInStudent();
    cy.visit('/student/dashboard');
    cy.waitForHydration();
  });

  it('displays a personalised welcome message', () => {
    cy.contains('Welcome back').should('be.visible');
  });

  it('displays the stats panel with all three stat labels', () => {
    cy.contains('Upcoming').should('be.visible');
    cy.contains('Completed').should('be.visible');
    cy.contains('Total booked').should('be.visible');
  });

  it('navigates to the consultation booking page via the Book consultation button', () => {
    cy.contains('a', 'Book consultation').click();
    cy.url().should('include', '/student/book');
  });

  it('sets the Upcoming tab as active by default', () => {
    cy.contains('[role="tab"]', 'Upcoming').should('have.attr', 'aria-selected', 'true');
  });

  it('switches the active tab when the Past tab is clicked', () => {
    cy.contains('[role="tab"]', 'Past').click();
    cy.contains('[role="tab"]', 'Past').should('have.attr', 'aria-selected', 'true');
    cy.contains('[role="tab"]', 'Upcoming').should('have.attr', 'aria-selected', 'false');
  });

  it('signs out via the account menu and redirects to the sign-in page', () => {
    cy.get('button[aria-haspopup="menu"]').click();
    cy.contains('[role="menuitem"]', 'Sign out').click();
    cy.url().should('include', '/auth/sign-in');
  });
});
