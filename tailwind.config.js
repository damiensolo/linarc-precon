const path = require('path');
const baseConfig = require('../linarc-design-components/tailwind.config.js');

module.exports = {
  ...baseConfig,
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
    '../linarc-design-components/src/**/*.{vue,js,ts,jsx,tsx}',
  ],
};
