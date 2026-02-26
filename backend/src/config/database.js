import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const commonOptions = {
  logging: false
};

const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      dialectOptions:
        process.env.NODE_ENV === 'production'
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
