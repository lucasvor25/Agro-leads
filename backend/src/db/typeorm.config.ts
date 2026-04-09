import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { Lead } from '../leads/entities/lead.entity';
import { Property } from '../properties/entities/property.entity';
import { User } from '../users/entities/user.entity';

config();

export default new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5433', 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: false,
    entities: [Lead, Property, User],
    migrations: ['dist/db/migrations/*.js'],
    synchronize: false,
    migrationsRun: true
});