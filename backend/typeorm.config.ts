import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { Lead } from 'src/leads/entities/lead.entity';
import { Property } from 'src/properties/entities/property.entity';

config();

export default new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: false,
    entities: [Lead, Property],
    migrations: ['dist/src/db/migrations/*.js'],
    synchronize: true,
});