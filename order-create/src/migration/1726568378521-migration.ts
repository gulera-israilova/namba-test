import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1726568378521 implements MigrationInterface {
  name = 'Migration1726568378521';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "surname" character varying, "middleName" character varying, "name" character varying NOT NULL, "login" character varying NOT NULL, "hash" character varying(500) NOT NULL, "key" character varying(500) NOT NULL, CONSTRAINT "UQ_a62473490b3e4578fd683235c5e" UNIQUE ("login"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "product" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL DEFAULT '', "description" character varying NOT NULL DEFAULT '', "price" integer, "created_by_id" uuid, "updated_by_id" uuid, CONSTRAINT "PK_bebc9158e480b949565b4dc7a82" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "order_product" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP, "order_id" uuid NOT NULL, "product_id" uuid NOT NULL, CONSTRAINT "PK_539ede39e518562dfdadfddb492" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "order" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "number" integer, "created_by_id" uuid, "updated_by_id" uuid, CONSTRAINT "PK_1031171c13130102495201e3e20" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD CONSTRAINT "FK_53345ffb00a286f308561c0d1c4" FOREIGN KEY ("created_by_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD CONSTRAINT "FK_5f8db60eb78716efc0dc2ad784a" FOREIGN KEY ("updated_by_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_product" ADD CONSTRAINT "FK_ea143999ecfa6a152f2202895e2" FOREIGN KEY ("order_id") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_product" ADD CONSTRAINT "FK_400f1584bf37c21172da3b15e2d" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order" ADD CONSTRAINT "FK_baf41162b735ea17e1bf967c9e5" FOREIGN KEY ("created_by_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order" ADD CONSTRAINT "FK_2cf0186a06ae00e4a2e54b70f29" FOREIGN KEY ("updated_by_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
        `ALTER TABLE "order_product" ADD "quantity" integer NOT NULL DEFAULT '1'`,
    );

    await queryRunner.query(
        `CREATE TYPE "public"."order_status_enum" AS ENUM('CREATED', 'UPDATED')`,
    );
    await queryRunner.query(
        `ALTER TABLE "order" ADD "status" "public"."order_status_enum"`,
    );

    await queryRunner.query(`
    INSERT INTO "user" (id, created_at, login, name, surname, "middleName", key, hash)
    VALUES ('9a0e516f-9e79-4ddf-8792-01a57776a7e6', now(), 'user', 'user', 'user', 'user', '7ddPObKjJm', 'd3fc6be95ed143a7d712d6b5f80869c305b018fcd8871d797fbb12bbb64b19c0');
  `);

    await queryRunner.query(`
   INSERT INTO product (id, created_at, name, description, price)
   VALUES 
  ('ae796564-bc9e-4e8e-b41c-b1ce54e8d5c7', now(), 'Phone', 'Phone description', 1000),
  ('0734a5e3-12c4-442c-8f82-c52c5ca454a7', now(), 'Computer', 'Computer description', 2000);


  `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "status"`);
    await queryRunner.query(`DROP TYPE "public"."order_status_enum"`);
    await queryRunner.query(
        `ALTER TABLE "order_product" DROP COLUMN "quantity"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order" DROP CONSTRAINT "FK_2cf0186a06ae00e4a2e54b70f29"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order" DROP CONSTRAINT "FK_baf41162b735ea17e1bf967c9e5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_product" DROP CONSTRAINT "FK_400f1584bf37c21172da3b15e2d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_product" DROP CONSTRAINT "FK_ea143999ecfa6a152f2202895e2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" DROP CONSTRAINT "FK_5f8db60eb78716efc0dc2ad784a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" DROP CONSTRAINT "FK_53345ffb00a286f308561c0d1c4"`,
    );
    await queryRunner.query(`DROP TABLE "order"`);
    await queryRunner.query(`DROP TABLE "order_product"`);
    await queryRunner.query(`DROP TABLE "product"`);
    await queryRunner.query(`DROP TABLE "user"`);
  }
}
