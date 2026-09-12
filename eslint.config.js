// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    // `.expo/types` est régénéré par le serveur de dev : il n'a pas à être linté.
    ignores: ['dist/*', 'dist-web/*', '.expo/*'],
  },
]);
