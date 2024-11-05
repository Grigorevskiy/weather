import dayjs from 'dayjs';
import localeUk from 'dayjs/locale/uk';

dayjs.locale(localeUk);

const generateForecastData = (daysAhead) => {
  return Array.from({ length: daysAhead }, (_, i) => {
    const date = dayjs().add(i, 'day');
    return {
      dayHref: i === 0 
        ? `${Cypress.config('baseUrl')}/погода-київ`
        : `${Cypress.config('baseUrl')}/погода-київ/${date.format('YYYY-MM-DD')}`,
      dayName: date.format('dddd').toLowerCase(),
      dayDate: date.format('DD'),
      monthName: date.format('MMMM').toLowerCase(),
      formattedDate: date.format('YYYY-MM-DD')
    };
  });
};

const normalizeApostrophe = (text) => text.replace(/’/g, 'ʼ');

describe('Weather Forecast Tests for Kyiv', () => {
  before(() => {
    cy.visit('/');
  });

  const forecastData = generateForecastData(10);

  const verifyForecastDetails = (dayData) => {
    cy.contains(normalizeApostrophe(dayData.dayName)).should('exist');
    cy.contains(dayData.dayDate).should('exist');
    cy.contains(dayData.monthName).should('exist');
  };

  const verifyForecast = ({ dayHref, dayName, dayDate, monthName, formattedDate }, isFirstDay) => {
    if (!isFirstDay) {
      cy.intercept('GET', `${Cypress.config('baseUrl')}/stats/visit/*/${formattedDate}*`).as('weatherRequest');
    }

    cy.get(`a[href="${dayHref}"]`).within(() => {
      cy.get('p').contains(normalizeApostrophe(dayName)).click();

      if (!isFirstDay) {
        cy.wait('@weatherRequest').its('response.statusCode').should('eq', 200);
      }

      verifyForecastDetails({ dayName, dayDate, monthName });
    });

    if (!isFirstDay) {
      cy.get('.kQfVVnhb').within(() => {
        verifyForecastDetails({ dayName, dayDate, monthName });
      });
    }
  };

  it('Search for Kyiv and verify forecasts', () => {
    cy.get('input[type="search"]').type('Київ');
    cy.contains('Київ').click();

    forecastData.forEach((dayData, index) => {
      verifyForecast(dayData, index === 0);
      if (index === 6) {
        cy.intercept('GET', `${Cypress.config('baseUrl')}/stats/visit/*/10-*`).as('tenDaysRequest');

        cy.get('a').contains('10 днів').click();

        cy.wait('@tenDaysRequest').its('response.statusCode').should('eq', 200);
      }
    });
  });
});
