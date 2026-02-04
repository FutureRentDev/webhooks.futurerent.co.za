import { Knex } from "knex";

export const apiRolesSchema = (table: Knex.CreateTableBuilder) => {
  table.increments("id").primary(); // auto_increment primary key
  table.string("name", 100).notNullable().unique();
};
