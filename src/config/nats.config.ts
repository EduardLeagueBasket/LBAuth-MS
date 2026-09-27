import { envs } from './envs';

export const natsConfig = {
  name: 'AUTH_SERVICE',
  transport: 'nats',
  options: {
    servers: envs.natsServers,
    queue: 'auth-queue',
  },
};
