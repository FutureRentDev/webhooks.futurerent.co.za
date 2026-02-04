import { Knex } from "knex";

export const apiSchema = (table: Knex.CreateTableBuilder) => {
  table.increments("id").primary(); // auto_increment primary key
  table.string("name", 255).notNullable().unique();
  table.string("token", 255).notNullable().unique();
table.integer("role_id").unsigned().nullable().index();
  table.string("ip", 50).notNullable();
  table.string("username", 255).unique().nullable();
  table.string("password", 255).nullable();
  table.boolean("needsAuth").notNullable().defaultTo(true); // tinyint(1) default 1
  table.boolean("isDeleted").notNullable().defaultTo(false); // tinyint(1) default 0
};
