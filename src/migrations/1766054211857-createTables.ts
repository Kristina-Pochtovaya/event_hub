import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTables1766054211857 implements MigrationInterface {
    name = 'CreateTables1766054211857'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD "deletedAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "events" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "events" ADD "deletedAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "users" ADD "password" character varying(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP CONSTRAINT "FK_2dab1a1c63ff25f08fff8149c5d"`);
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP CONSTRAINT "PK_a87248d73155605cf782be9ee5e"`);
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD CONSTRAINT "PK_a87248d73155605cf782be9ee5e" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP COLUMN "eventId"`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD "eventId" uuid`);
        await queryRunner.query(`ALTER TABLE "events" DROP CONSTRAINT "PK_40731c7151fe4be3116e45ddf73"`);
        await queryRunner.query(`ALTER TABLE "events" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "events" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "events" ADD CONSTRAINT "PK_40731c7151fe4be3116e45ddf73" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD CONSTRAINT "FK_2dab1a1c63ff25f08fff8149c5d" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP CONSTRAINT "FK_2dab1a1c63ff25f08fff8149c5d"`);
        await queryRunner.query(`ALTER TABLE "events" DROP CONSTRAINT "PK_40731c7151fe4be3116e45ddf73"`);
        await queryRunner.query(`ALTER TABLE "events" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "events" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "events" ADD CONSTRAINT "PK_40731c7151fe4be3116e45ddf73" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP COLUMN "eventId"`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD "eventId" integer`);
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP CONSTRAINT "PK_a87248d73155605cf782be9ee5e"`);
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD CONSTRAINT "PK_a87248d73155605cf782be9ee5e" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD CONSTRAINT "FK_2dab1a1c63ff25f08fff8149c5d" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "password"`);
        await queryRunner.query(`ALTER TABLE "events" DROP COLUMN "deletedAt"`);
        await queryRunner.query(`ALTER TABLE "events" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP COLUMN "deletedAt"`);
    }

}
