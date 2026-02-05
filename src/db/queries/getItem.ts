/* eslint-disable @typescript-eslint/no-explicit-any */
import db from '../knex';
import relationMap from '../tableRelations';
import getEnumValues from '../functions/getEnums';

/**
 * Get Data from table, allows pagination and returns all enum values from the table
 * 
 * @param tableName - The name of the table to get data
 * @param column - The column to of the table we looking at
 * @param value - The value of the column
 */

async function getItem(
  tableName: string,
  column: string,
  value: any
): Promise<any> {
  try {
    const baseItem = await db(tableName).where(column, value).first();
    const enum_keys = await getEnumValues(tableName);

    console.log(baseItem, 'baseItem')
    if (!baseItem) {
      throw new Error(`No record found in ${tableName} where ${column} = ${value}`);
    }


    if (baseItem.isDeleted === 1 || baseItem.isDeleted === true) {
      throw new Error(`Record in ${tableName} where ${column} = ${value} is deleted.`);
    }
    
    const relations = relationMap[tableName] || [];

    for (const relation of relations) {
      let relatedItems: any[];

      if (relation.customJoin) {
        relatedItems = await relation.customJoin(baseItem);
      } else {
        relatedItems = await db(relation.table)
          .where(relation.foreignKey!, baseItem[relation.localKey!]);
      }

      // Handle nested relations (e.g., vehicle inside subscriptions)
      if (relation.nestedRelations) {
        for (const nestedKey in relation.nestedRelations) {
          const nestedRels = relation.nestedRelations[nestedKey];

          for (const relatedItem of relatedItems) {
            for (const nested of nestedRels) {
              let nestedData: any;

              if (nested.customJoin) {
                nestedData = await nested.customJoin(relatedItem);
              } else {
                nestedData = await db(nested.table)
                  .where(nested.foreignKey!, relatedItem[nested.localKey!])
                  .first();
              }

              relatedItem[nested.relationKey] = nestedData;
            }
          }
        }
      }

      // Assign related items to base item
      baseItem[relation.relationKey] = relatedItems;
    }

    return {error: false, data: baseItem, enum_keys};
  } catch (error: any) {
    return {
      error: true,
      message: "Item not found",
      info: error
    }
  }
}

export default getItem;
