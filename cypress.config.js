const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: 'https://ua.sinoptik.ua',
    defaultCommandTimeout: 7000,

    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
