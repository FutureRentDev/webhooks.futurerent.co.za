/* eslint-disable @typescript-eslint/no-explicit-any */
import db from '../knex';

/**
 * Updates an item in the specified table using the provided payload.
 * 
 * @param tableName - The name of the table to update
 * @param id - The primary key value of the item to update
 * @param payload - The object containing the fields to update
 */
async function updateItem(tableName: string, id: number | string, payload: Record<string, any>) {
  try {

    // let selectedId = customerPayload && customerPayload.isCustomer ? customerPayload.customerId : id

    const updatedCount = await db(tableName)
      .where({ id: id })
      .update(payload);

    if (updatedCount === 0) {
      throw new Error(`No record found in ${tableName} with id ${id}`);
}

    // Return updated item
    const updatedItem = await db(tableName).where({ id: id }).first();
    return updatedItem;
  } catch (error) {
    console.error(`Failed to update item in ${tableName}:`, error);
    throw new Error(`Could not update item in ${tableName}`);
  }
}

export default updateItem;
