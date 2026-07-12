describe('Consultation Booking', () => {
  beforeEach(() => {
    cy.signInStudent();
    cy.visit('/student/book');
    cy.waitForHydration();
  });

  it('displays the booking form', () => {
    cy.contains('Consultation details').should('be.visible');
    cy.get('#first-name').should('be.visible');
    cy.get('#last-name').should('be.visible');
    cy.get('#reason').should('be.visible');
    cy.get('#date').should('be.visible');
    cy.get('#time').should('be.visible');
    cy.contains('button[type="submit"]', 'Book consultation').should('be.visible');
  });

  it('pre-fills the first and last name fields from the signed-in user', () => {
    cy.get('#first-name').should('not.have.value', '');
    cy.get('#last-name').should('not.have.value', '');
  });

  it('disables the first and last name fields', () => {
    cy.get('#first-name').should('be.disabled');
    cy.get('#last-name').should('be.disabled');
  });

  it('navigates back to the dashboard via the Cancel button', () => {
    cy.contains('button', 'Cancel').click();
    cy.url().should('include', '/student/dashboard');
    cy.url().should('not.include', '/book');
  });

  it('shows a validation error when submitting without a reason', () => {
    cy.get('#time').type('10:00');
    cy.contains('button[type="submit"]', 'Book consultation').click();
    cy.contains('Reason for consultation is required').should('be.visible');
  });

  it('shows a validation error when submitting without a date', () => {
    cy.get('#reason').type('Career advice');
    cy.contains('button[type="submit"]', 'Book consultation').click();
    cy.contains('Pick a date').should('be.visible');
  });

  it('books a consultation and redirects to the dashboard', () => {
    cy.get('#reason').type('Career advice');
    cy.get('#date').click();
    cy.get('[data-day]').not('[disabled]').last().click();
    cy.get('#time').type('10:00');
    cy.contains('button[type="submit"]', 'Book consultation').click();
    cy.url().should('include', '/student/dashboard');
  });
});
