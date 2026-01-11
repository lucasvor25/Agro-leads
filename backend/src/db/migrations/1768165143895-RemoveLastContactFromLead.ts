import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveLastContactFromLead1768165143895 implements MigrationInterface {
    name = 'RemoveLastContactFromLead1768165143895'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "leads" DROP COLUMN "lastContact"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "leads" ADD "lastContact" TIMESTAMP NOT NULL DEFAULT now()`);
    }

}
