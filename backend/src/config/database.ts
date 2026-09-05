import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(
  'fileversex',
  'root',
  '',
  {
    host: 'localhost',
    dialect: 'mysql',
    logging: false
  }
);

export default sequelize;