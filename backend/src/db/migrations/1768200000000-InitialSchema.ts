import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration consolidada — estado final do schema.
 *
 * Substitui as 3 migrations anteriores que tinham dependência de ordem:
 *   - 1715000000000-PostGisMigration (tentava dropar lat/lng antes da tabela existir)
 *   - 1768154809608-InitialSchema
 *   - 1768165143895-RemoveLastContactFromLead
 *
 * Esta migration cria tudo já no estado correto:
 *   - Extensão PostGIS habilitada
 *   - Tabela "users"
 *   - Tabela "leads" sem lastContact, com user_id, com unique em cpf e email
 *   - Tabela "properties" com geometry PostGIS nativo (sem lat/lng), com user_id
 */
export class InitialSchema1768200000000 implements MigrationInterface {
    name = 'InitialSchema1768200000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Habilitar PostGIS
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS postgis`);

        // 2. Tabela de usuários
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "user" (
                "id"        SERIAL        NOT NULL,
                "name"      varchar       NOT NULL,
                "email"     varchar       NOT NULL,
                "password"  varchar       NOT NULL,
                "role"      varchar       NOT NULL DEFAULT 'user',
                "createdAt" TIMESTAMP     NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP     NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_user_email" UNIQUE ("email"),
                CONSTRAINT "PK_user" PRIMARY KEY ("id")
            )
        `);

        // 3. Tabela de leads
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "leads" (
                "id"         SERIAL          NOT NULL,
                "name"       varchar(100)    NOT NULL,
                "cpf"        varchar(14)     NOT NULL,
                "email"      varchar(100)    NOT NULL,
                "phone"      varchar(20)     NOT NULL,
                "city"       varchar         NOT NULL,
                "state"      varchar,
                "status"     varchar         NOT NULL DEFAULT 'Novo',
                "area"       numeric(10,2)   NOT NULL,
                "obs"        text,
                "isPriority" boolean         NOT NULL DEFAULT false,
                "createdAt"  TIMESTAMP       NOT NULL DEFAULT now(),
                "updatedAt"  TIMESTAMP       NOT NULL DEFAULT now(),
                "user_id"    integer,
                CONSTRAINT "UQ_leads_cpf"   UNIQUE ("cpf"),
                CONSTRAINT "UQ_leads_email" UNIQUE ("email"),
                CONSTRAINT "PK_leads"       PRIMARY KEY ("id")
            )
        `);

        // 4. Tabela de propriedades (geometry PostGIS nativo, sem lat/lng)
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "properties" (
                "id"        SERIAL          NOT NULL,
                "name"      varchar         NOT NULL,
                "city"      varchar         NOT NULL,
                "culture"   varchar         NOT NULL,
                "area"      numeric(10,2)   NOT NULL,
                "geometry"  geometry(Geometry,4326),
                "obs"       text,
                "createdAt" TIMESTAMP       NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP       NOT NULL DEFAULT now(),
                "leadId"    integer,
                "user_id"   integer,
                CONSTRAINT "PK_properties" PRIMARY KEY ("id")
            )
        `);

        // 5. Foreign keys
        await queryRunner.query(`
            ALTER TABLE "leads"
                ADD CONSTRAINT "FK_leads_user"
                FOREIGN KEY ("user_id") REFERENCES "user"("id")
                ON DELETE SET NULL
        `);

        await queryRunner.query(`
            ALTER TABLE "properties"
                ADD CONSTRAINT "FK_properties_lead"
                FOREIGN KEY ("leadId") REFERENCES "leads"("id")
                ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "properties"
                ADD CONSTRAINT "FK_properties_user"
                FOREIGN KEY ("user_id") REFERENCES "user"("id")
                ON DELETE SET NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "properties" DROP CONSTRAINT IF EXISTS "FK_properties_user"`);
        await queryRunner.query(`ALTER TABLE "properties" DROP CONSTRAINT IF EXISTS "FK_properties_lead"`);
        await queryRunner.query(`ALTER TABLE "leads"      DROP CONSTRAINT IF EXISTS "FK_leads_user"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "properties"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "leads"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "user"`);
        await queryRunner.query(`DROP EXTENSION IF EXISTS postgis`);
    }
}
