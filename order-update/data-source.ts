import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import {entities} from "./src/entities";
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
  subscribers: ['dist/src/subscriber/*.js'],
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
