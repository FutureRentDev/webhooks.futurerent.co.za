/* eslint-disable @typescript-eslint/no-explicit-any */
import db from "../knex";

/**
 * Inserts a new item into the given table using provided payload.
 * 
 * @param tableName - The name of the table to insert into
 * @param payload - The data to insert (from req.body)
 */
async function createItem(tableName: string, payload: Record<string, any>) {
  try {
    console.log(`🔍 CREATE ITEM DEBUG for ${tableName}:`);
    console.log('📦 Payload:', payload);
    
    // 🟢 FIX: Insert and then fetch the inserted row
    const [insertId] = await db(tableName).insert(payload);
    
    // Fetch the complete inserted row
    const createdItem = await db(tableName)
      .where('id', insertId)
      .first();
    
    console.log(`✅ Insert successful, created item:`, createdItem);
    
    return {
      error: false,
      id: insertId,
      data: createdItem
    };
  } catch (error: any) {
    console.error(`❌ Error creating item in ${tableName}:`, error.message);
    console.error('🔧 Full error:', error);
    throw new Error(`Failed to create item in ${tableName}: ${error.message}`);
  }
}

export default createItem;
