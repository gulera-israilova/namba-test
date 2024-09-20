import { DataSource, DataSourceOptions } from 'typeorm';
import { entities } from './src/entities';
import { migrations } from './src/migration';
import * as dotenv from 'dotenv';
dotenv.config();
export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_POSTGRES_HOST,
  port: +process.env.DB_POSTGRES_PORT,
  username: process.env.DB_POSTGRES_USER,
  password: process.env.DB_POSTGRES_PASSWORD,
  database: process.env.DB_POSTGRES_DATABASE,
  synchronize: false,
  logging: false,
  entities: entities,
  migrations: migrations,
  subscribers: ['dist/src/subscriber/*.js'],
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
