/* eslint-disable @typescript-eslint/no-explicit-any */
// This file is used to getting enums values

import db from "../knex";

async function getEnumValues(table: string): Promise<Record<string, string[]>> {
  const columns = await db.raw(`SHOW COLUMNS FROM \`${table}\``);
  const enumFields: Record<string, string[]> = {};

  columns[0].forEach((col: any) => {
    const type = col.Type;
    if (type.startsWith('enum(')) {
      const matches = type.match(/^enum\((.*)\)$/);
      if (matches && matches[1]) {
        const values = matches[1]
          .split(',')
          .map((v: string) => v.trim().replace(/^'|'$/g, ''));
        enumFields[col.Field] = values;
      }
    }
  });

  return enumFields;
}

export default getEnumValues;
