import { Knex } from "knex";

export const expoTokensSchema = (table: Knex.CreateTableBuilder) => {
    table.increments("id").primary();
    table.enu("device_type", ["android", "ios"]).notNullable();
    table.string("device_make", 255).notNullable();
    table.string("expo_token", 255).unique().nullable();
    table.boolean("isGranted").nullable().defaultTo(false);
    table
        .integer("customer_id")
        .unsigned()
        .nullable()
        .references("id")
        .inTable("customers")
        .onDelete("CASCADE");
};
