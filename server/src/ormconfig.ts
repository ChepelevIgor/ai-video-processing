// ormconfig.ts
import { DataSourceOptions } from 'typeorm';


const config: DataSourceOptions = {
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'pass',
    database: 'mydb',
    synchronize: true,
};

export default config;
