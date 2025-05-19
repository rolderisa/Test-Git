import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// create __dirname manually
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// now load env
dotenv.config({ path: path.resolve(__dirname, '../.env') });



import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  String(process.env.DB_PASSWORD),
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT), // 👈 Force it into a real number
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
  }
);

console.log('ENV DB_USER:', process.env.DB_USER);
console.log('ENV DB_PASSWORD:', process.env.DB_PASSWORD);


export { sequelize };
