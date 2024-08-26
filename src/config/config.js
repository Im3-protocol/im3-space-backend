const dotenv = require('dotenv');
const path = require('path');
const Joi = require('joi');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
    PORT: Joi.number().default(3000),
    MONGODB_URL: Joi.string().required().description('Mongo DB url'),
    MESSAGE_TO_SIGN: Joi.string().required().description('A message to sign with user wallet'),
    IM3_API_KEY: Joi.string().required().description('IM3 API key'),
    IM3_API_SECRET: Joi.string().required().description('IM3 API secret'),
    IM3_WEBSOCKET_URL: Joi.string().required().description('IM3 WEBSOCKET_URL'),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  mongoose: {
    url: envVars.MONGODB_URL + (envVars.NODE_ENV === 'test' ? '-test' : ''),
    options: {
      // useCreateIndex: true,
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    },
  },
  messageToSign: envVars.MESSAGE_TO_SIGN,
  im3: {
    apiKey: envVars.IM3_API_KEY,
    apiSecret: envVars.IM3_API_SECRET,
    websocketUrl: envVars.IM3_WEBSOCKET_URL,
  },
};
