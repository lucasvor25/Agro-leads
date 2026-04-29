import { Controller, Post, Headers, ForbiddenException, Logger, HttpCode } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

/**
 * Rota de manutenção TEMPORÁRIA para resetar o schema do banco de dados.
 *
 * ⚠️  REMOVA ESTE ARQUIVO APÓS USO ⚠️
 *
 * Como usar:
 *   POST https://<seu-backend>.onrender.com/api/db-reset
 *   Header: x-reset-key: <valor de DB_RESET_KEY no Render>
 *
 * Configure a variável de ambiente DB_RESET_KEY=<uma-senha-aleatoria> no Render
 * antes de fazer o deploy com este arquivo.
 */
@Controller('db-reset')
export class DbResetController {
  private readonly logger = new Logger(DbResetController.name);

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  @Post()
  @HttpCode(200)
  async reset(@Headers('x-reset-key') key: string) {
    const expectedKey = process.env.DB_RESET_KEY;

    if (!expectedKey || key !== expectedKey) {
      throw new ForbiddenException('Chave inválida.');
    }

    this.logger.warn('⚠️  Iniciando reset do schema do banco de dados...');

    const queries = [
      `DROP TABLE IF EXISTS "migrations" CASCADE`,
      `ALTER TABLE IF EXISTS "properties" DROP CONSTRAINT IF EXISTS "FK_674f2eedff05d9042b23e989455"`,
      `ALTER TABLE IF EXISTS "properties" DROP CONSTRAINT IF EXISTS "FK_properties_lead"`,
      `ALTER TABLE IF EXISTS "properties" DROP CONSTRAINT IF EXISTS "FK_properties_user"`,
      `ALTER TABLE IF EXISTS "leads"      DROP CONSTRAINT IF EXISTS "FK_leads_user"`,
      `DROP TABLE IF EXISTS "properties"`,
      `DROP TABLE IF EXISTS "leads"`,
      `DROP TABLE IF EXISTS "user"`,
    ];

    for (const sql of queries) {
      try {
        await this.dataSource.query(sql);
        this.logger.log(`✅ OK: ${sql}`);
      } catch (err) {
        this.logger.warn(`⚠️  Ignorado: ${sql} — ${err.message}`);
      }
    }

    this.logger.warn('✅ Reset concluído. Reiniciando para aplicar as migrations...');

    // Força reinicialização para as migrations rodarem na próxima tentativa
    setTimeout(() => process.exit(0), 500);

    return {
      message: 'Schema resetado com sucesso. O servidor irá reiniciar para aplicar as migrations.',
    };
  }
}
