import { MigrationInterface, QueryRunner } from 'typeorm';

export class PostGisMigration1715000000000 implements MigrationInterface {
    name = 'PostGisMigration1715000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Primeiro, garante que o postgis está instalado no DB
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS postgis`);

        // Remove as colunas antigas e inutilizáveis agora
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "lat"`);
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "lng"`);

        // Remove e recria a coluna de geometria utilizando os tipos PostGIS Geometry nativo do SRID 4326.
        // Como o tipo antigo era type: 'jsonb', precisamos retipar:
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "geometry"`);
        await queryRunner.query(`ALTER TABLE "properties" ADD "geometry" geometry(Geometry,4326)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "geometry"`);
        await queryRunner.query(`ALTER TABLE "properties" ADD "geometry" jsonb`);
        await queryRunner.query(`ALTER TABLE "properties" ADD "lng" numeric(10,6)`);
        await queryRunner.query(`ALTER TABLE "properties" ADD "lat" numeric(10,6)`);
        
        await queryRunner.query(`DROP EXTENSION IF EXISTS postgis`);
    }
}
