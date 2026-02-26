import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const commonOptions = {
  logging: false
};

const useSsl = process.env.DB_SSL === 'true' || (
  process.env.NODE_ENV === 'production' && process.env.DB_SSL !== 'false'
);

const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      dialectOptions: useSsl
        ? {
            ssl: {
              require: true,
              rejectUnauthorized: false
            }
          }
        : {},
      ...commonOptions
    })
  : new Sequelize({
      dialect: 'sqlite',
      storage: './database.sqlite',
      ...commonOptions
    });

export default sequelize;
