import { Sequelize } from 'sequelize';

// Load environment variables (Next.js handles this, but explicit for clarity)
import dotenv from 'dotenv';
dotenv.config();

const environment = process.env.NODE_ENV || 'development';
const flag_logging = process.env.DB_LOGGING === 'true';

const customLogger = (sql, timing) => {
    console.log(sql);
};

let sequelize;

if (environment === 'development') {
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 5432,
      dialect: 'postgres',
      logging: flag_logging === true ? customLogger : false,
      benchmark: false, // Disable query timing logs
    }
  );
} else if (environment === 'production') {
    sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 5432,
      dialect: 'postgres',
      dialectOptions: {
        ssl: { require: true, rejectUnauthorized: false },  // Always use SSL
      },
      logging: flag_logging === true ? customLogger : false,
      benchmark: false, // Disable query timing logs
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    }
  );
} else {
  throw new Error(`Unsupported environment: ${environment}`);
}

// sequelize = new Sequelize({
//   dialect: 'sqlite',
//   storage: process.env.DB_STORAGE || './db/database.sqlite',
//   logging: customLogger,
//   benchmark: false, // Disable query timing logs
// });


export default sequelize;
