import 'dotenv/config';

import * as joi from 'joi';

interface EnvVars {
  PORT: number;
  NATS_SERVERS: string[];
  SALT: number;
  JWT_SECRET: string;
  MAIL_HOST: string;
  MAIL_PORT: number;
  MAIL_USER: string;
  MAIL_PASS: string;
  MAIL_FROM: string;
}

const envVarsSchema = joi
  .object({
    PORT: joi.number().required(),
    NATS_SERVERS: joi.array().items(joi.string()).required(),
    SALT: joi.number().required(),
    JWT_SECRET: joi.string().required(),
    MAIL_HOST: joi.string().required(),
    MAIL_PORT: joi.number().required(),
    MAIL_USER: joi.string().required(),
    MAIL_PASS: joi.string().required(),
    MAIL_FROM: joi.string().required(),
  })
  .unknown();

const { error, value } = envVarsSchema.validate({
  ...process.env,
  PORT: process.env.PORT,
  NATS_SERVERS: process.env.NATS_SERVERS?.split(','),
  SALT: process.env.SALT,
  JWT_SECRET: process.env.JWT_SECRET,
  MAIL_HOST: process.env.MAIL_HOST,
  MAIL_PORT: process.env.MAIL_PORT,
  MAIL_USER: process.env.MAIL_USER,
  MAIL_PASS: process.env.MAIL_PASS,
  MAIL_FROM: process.env.MAIL_FROM,
});

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const envVars: EnvVars = value;

export const envs = {
  port: envVars.PORT,
  natsServers: envVars.NATS_SERVERS,
  salt: envVars.SALT,
  jwtSecret: envVars.JWT_SECRET,
  mailHost: envVars.MAIL_HOST,
  mailPort: envVars.MAIL_PORT,
  mailUser: envVars.MAIL_USER,
  mailPass: envVars.MAIL_PASS,
  mailFrom: envVars.MAIL_FROM,
};
