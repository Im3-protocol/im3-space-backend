const fs = require('fs');
const path = require('path');

const readMeetConfig = (slug) => {
  const customConfigPath = path.resolve(__dirname, `../config/slug/${slug}.config.json`);
  const defaultConfigPath = path.resolve(__dirname, '../config/slug/default.config.json');

  const configPath = fs.existsSync(customConfigPath) ? customConfigPath : defaultConfigPath;

  return JSON.parse(fs.readFileSync(configPath, 'utf8'));
};

module.exports = readMeetConfig;
