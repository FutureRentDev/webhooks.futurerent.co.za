/* eslint-disable @typescript-eslint/no-explicit-any */
// src/utils/deleteItem.ts
import db from "../knex";

interface RelatedTable {
  table: string;
  fkColumn: string;
}

/**
 * Soft delete or restore a row and its related foreign key records.
 * 
 * @param tableName - The main table to update
 * @param column - The column to match on (e.g., 'id')
 * @param value - The value to match in the column
 * @param restoreCustomer - Set to true to restore; false to soft-delete
 * @param relatedTables - Optional array of related tables and their FK columns
 */
async function deleteItem(
  tableName: string,
  column: string,
  value: any,
  restoreCustomer: boolean,
  relatedTables: RelatedTable[] = []
) {
  const isDeletedFlag = !restoreCustomer;
  const trx = await db.transaction();

  try {
    // Update main table
    const updatedMain = await trx(tableName)
      .where(column, value)
      .update({ isDeleted: isDeletedFlag });

    if (updatedMain === 0) {
      throw new Error(`No record found in ${tableName} where ${column} = ${value}`);
    }

    // Update related FK tables
    for (const { table, fkColumn } of relatedTables) {
      await trx(table)
        .where(fkColumn, value)
        .update({ isDeleted: isDeletedFlag });
    }

    await trx.commit();

    return {
      success: true,
      message: `${restoreCustomer ? 'Restored' : 'Soft-deleted'} from ${tableName} and related tables`,
    };
  } catch (error: any) {
    await trx.rollback();
    console.error(`Soft delete failed for ${tableName}:`, error.message || error);
    throw new Error(`Could not soft delete from ${tableName}`);
  }
}

export default deleteItem;
