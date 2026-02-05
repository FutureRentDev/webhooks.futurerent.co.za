import type { Knex } from "knex";
import { apiSchema, apiRolesSchema, customerSchema, expoTokensSchema } from "./schemas";
import {
  createUpdateAccountNameTrigger,
  createSetAccountNameTrigger,
  dropUpdateAccountNameTrigger,
  dropSetAccountNameTrigger,
  createSetTitleTrigger,
  createUpdateTitleTrigger,
  dropSetTitleTrigger,
  dropUpdateTitleTrigger,
} from "../functions";

export async function up(knex: Knex): Promise<void> {
  if (!(await knex.schema.hasTable("api_roles"))) {
    await knex.schema.createTable("api_roles", apiRolesSchema);
  }
  if (!(await knex.schema.hasTable("api_users"))) {
    await knex.schema.createTable("api_users", apiSchema);
  }
  if (!(await knex.schema.hasTable("customers"))) {
    await knex.schema.createTable("customers", customerSchema);
  }
  if (!(await knex.schema.hasTable("expo_tokens"))) {
    await knex.schema.createTable("expo_tokens", expoTokensSchema);
  }

  // 🔁 Run raw SQL trigger functions
  await knex.raw(createUpdateAccountNameTrigger);
  await knex.raw(createSetAccountNameTrigger);
  await knex.raw(createSetTitleTrigger);
  await knex.raw(createUpdateTitleTrigger);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("api_users");
  await knex.schema.dropTableIfExists("api_roles");
  await knex.schema.dropTableIfExists("customers");
  await knex.schema.dropTableIfExists("expo_tokens");

  await knex.raw(dropSetAccountNameTrigger);
  await knex.raw(dropUpdateAccountNameTrigger);
  await knex.raw(dropSetTitleTrigger);
  await knex.raw(dropUpdateTitleTrigger);
}
