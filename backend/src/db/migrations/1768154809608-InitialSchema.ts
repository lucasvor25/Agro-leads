import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1768154809608 implements MigrationInterface {
    name = 'InitialSchema1768154809608'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "properties" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "city" character varying NOT NULL, "culture" character varying NOT NULL, "area" numeric(10,2) NOT NULL, "geometry" jsonb, "obs" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "lat" numeric(10,6), "lng" numeric(10,6), "leadId" integer, CONSTRAINT "PK_2d83bfa0b9fcd45dee1785af44d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "leads" ("id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "cpf" character varying(14) NOT NULL, "email" character varying(100) NOT NULL, "phone" character varying(20) NOT NULL, "city" character varying NOT NULL, "state" character varying, "status" character varying NOT NULL DEFAULT 'Novo', "area" numeric(10,2) NOT NULL, "obs" text, "isPriority" boolean NOT NULL DEFAULT false, "lastContact" TIMESTAMP NOT NULL DEFAULT now(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_566c24505f913062e1026bff97f" UNIQUE ("cpf"), CONSTRAINT "PK_cd102ed7a9a4ca7d4d8bfeba406" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "properties" ADD CONSTRAINT "FK_674f2eedff05d9042b23e989455" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "properties" DROP CONSTRAINT "FK_674f2eedff05d9042b23e989455"`);
        await queryRunner.query(`DROP TABLE "leads"`);
        await queryRunner.query(`DROP TABLE "properties"`);
    }

}
