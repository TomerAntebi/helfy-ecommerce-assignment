import dotenv from 'dotenv';

// Load .env file before any other module reads process.env.
// In Docker, variables are injected by docker-compose and dotenv is a no-op.
dotenv.config();

const required = (name: string): string => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
};

export const config = {
  PORT: Number(process.env.PORT) || 4000,
  DB_HOST: required('DB_HOST'),
  DB_PORT: Number(process.env.DB_PORT) || 3306,
  DB_NAME: required('DB_NAME'),
  DB_USER: required('DB_USER'),
  DB_PASSWORD: required('DB_PASSWORD'),
  DB_CONNECTION_LIMIT: Number(process.env.DB_CONNECTION_LIMIT) || 10,
  JWT_SECRET: required('JWT_SECRET'),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  // In Docker, nginx proxies /api to the backend (same origin for the browser).
  // For local Vite dev (npm run dev), set CORS_ORIGIN=http://localhost:5173.
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
};
