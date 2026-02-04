/* eslint-disable @typescript-eslint/no-explicit-any */
import db from '../../db/knex';
import getEnumValues from '../functions/getEnums';

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, string | number | boolean | Array<string | number>>;
}

async function getTableColumns(tableName: string): Promise<string[]> {
  const columns = await db(tableName).columnInfo();
  return Object.keys(columns);
}

function applySearch(query: any, columns: string[], search?: string, tableAlias?: string) {
  if (search) {
    query.andWhere((builder: any) => {
      columns.forEach((column) => {
        const fullColumn = tableAlias ? `${tableAlias}.${column}` : column;
        builder.orWhereILike(fullColumn, `%${search}%`);
      });
    });
  }
}

function applyFilters(
  query: any,
  filters: Record<string, any>,
  validColumns: Set<string>,
  priceField = 'purchase_price',
  tableAlias?: string
) {
  const prefix = tableAlias ? `${tableAlias}.` : '';

  // Handle date range filters for created/created_at
  const createdFrom = filters['[created][from]'] || filters['[created_at][from]'];
  const createdTo = filters['[created][to]'] || filters['[created_at][to]'];

  if (createdFrom || createdTo) {
    query.andWhere((builder: any) => {
      if (createdFrom) {
        builder.andWhere(`${prefix}created`, '>=', new Date(createdFrom));
      }
      if (createdTo) {
        builder.andWhere(`${prefix}created`, '<=', new Date(createdTo));
      }
    });

    // Remove the date filters so they don't get processed again below
    delete filters['[created][from]'];
    delete filters['[created][to]'];
    delete filters['[created_at][from]'];
    delete filters['[created_at][to]'];
  }

  // Process other filters normally
  Object.entries(filters).forEach(([column, value]) => {
    if (column === 'min_price' && typeof value === 'number') {
      query.andWhere(priceField, '>=', value);
    } else if (column === 'max_price' && typeof value === 'number') {
      query.andWhere(priceField, '<=', value);
    } else if (validColumns.has(column)) {
      const fullColumn = `${prefix}${column}`;
      if (Array.isArray(value)) {
        query.whereIn(fullColumn, value);
      } else if (typeof value === 'object' && value.$not !== undefined) {
        query.andWhereNot(fullColumn, value.$not);
      } else {
        query.andWhere(fullColumn, value);
      }
    } else {
      console.warn(`Skipping invalid filter column: ${column}`);
    }
  });
}






function applySorting(query: any, sortBy?: string, sortOrder: 'asc' | 'desc' = 'asc', validColumns?: Set<string>, tableAlias?: string) {
  if (sortBy && (!validColumns || validColumns.has(sortBy))) {
    const fullColumn = tableAlias ? `${tableAlias}.${sortBy}` : sortBy;
    query.orderBy(fullColumn, sortOrder);
  }
}

async function paginateQuery(query: any, tableName: string, page: number, limit: number, filters: Record<string, any>, search?: string, searchColumns: string[] = [], enum_keys: any = {}) {
  if (page === 0) {
    const data = await query;
    return {
      data,
      pagination: {
        total: data.length,
        page: 0,
        limit: data.length,
        pages: 1,
      },
      enum_keys,
    };
  }

  const offset = (page - 1) * limit;
  const [data, [{ total }]] = await Promise.all([
    query.clone().limit(limit).offset(offset),
    db(tableName)
      .modify((builder) => {
        applySearch(builder, searchColumns, search);
        applyFilters(builder, filters, new Set(searchColumns));
      })
      .count({ total: '*' }),
  ]);

  return {
    data,
    pagination: {
      total: Number(total),
      page,
      limit,
      pages: Math.ceil(Number(total) / limit),
    },
    enum_keys,
  };
}

async function getSalesAgentsEnum() {
  const agents = await db('sales_agents')
    .select('id', 'account_name as name', 'email_address as email')
    .where('status', "Active");

  return agents;
}

async function getItems(
  tableName: string,
  options: PaginationOptions = {},
  search?: string,
) {
  const { page = 1, limit = 10, sortBy, sortOrder = 'asc', filters = {} } = options;
  const columns = await getTableColumns(tableName);
  const validColumns = new Set(columns);
  try {
    const enum_keys = await getEnumValues(tableName);
    let baseQuery;

    // === CASE 1: applications ===
    if (tableName === 'applications') {
      baseQuery = db('applications')
        .join('customers', 'applications.customer_id', 'customers.id')
        .select(
          'applications.*',
          'customers.id as customer_id',
          'customers.account_name as account_name',
          'customers.email as customer_email',
        )
        .where('applications.isDeleted', 0);

      // Pass tableAlias so filters for created_at get prefixed correctly
      applySearch(baseQuery, ['applications.name', 'customers.name', 'customers.email'], search);
      applyFilters(baseQuery, filters, validColumns, 'purchase_price', 'applications');
      applySorting(baseQuery, sortBy, sortOrder);

      return await paginateQuery(baseQuery, 'applications', page, limit, filters, search, columns, enum_keys);
    }


    // === CASE 2: leads ===
    if (tableName === 'leads') {
      baseQuery = db('leads')
        .leftJoin('sales_agents', 'leads.assigned_to', 'sales_agents.id')
        .select(
          'leads.*',
          'sales_agents.account_name as agent_name',
          'sales_agents.email_address as agent_email',
        )
      // .where('leads.isDeleted', 0);

      applySearch(baseQuery, columns, search, 'leads');
      applyFilters(baseQuery, filters, validColumns);
      applySorting(baseQuery, sortBy, sortOrder, validColumns, 'leads');

      const salesAgentsEnum = await getSalesAgentsEnum();

      const result = await paginateQuery(baseQuery, 'leads', page, limit, filters, search, columns, enum_keys);

      return {
        ...result,
        sales_agents: salesAgentsEnum,  // <- Add sales_agents enums only for leads
      };
    }




    if (tableName === 'sales_agents') {
      baseQuery = db('sales_agents')
        .leftJoin('users', 'sales_agents.user_id', 'users.id') // changed to LEFT JOIN
        .select(
          'sales_agents.*',
          'users.first_name as first_name',
          'users.last_name as last_name',
          'users.email_address as email',
        );

      applySearch(baseQuery, ['users.first_name', 'users.last_name', 'users.email_address'], search);
      applyFilters(baseQuery, filters, validColumns);
      applySorting(baseQuery, sortBy, sortOrder);

      return await paginateQuery(
        baseQuery,
        'sales_agents',
        page,
        limit,
        filters,
        search,
        columns,
        enum_keys
      );
    }

    // === CASE 3: invoices ===
    if (tableName === 'invoices') {
      baseQuery = db('invoices')
        .leftJoin('subscriptions', 'invoices.subscription_id', 'subscriptions.id')
        .leftJoin('customers', 'subscriptions.customer_id', 'customers.id')
        .leftJoin('vehicles', 'subscriptions.vehicle_id', 'vehicles.id')
        .select(
          'invoices.*',
          'subscriptions.*',
          'customers.*',
          'vehicles.*'
        );

      applySearch(
        baseQuery,
        ['invoices.xero_inv_id', 'subscriptions.id', 'customers.name', 'vehicles.vin'], // adjust searchable columns
        search
      );

      applyFilters(baseQuery, filters, validColumns, 'invoices.total_amount', 'invoices');
      applySorting(baseQuery, sortBy, sortOrder, validColumns, 'invoices');

      return await paginateQuery(
        baseQuery,
        'invoices',
        page,
        limit,
        filters,
        search,
        columns,
        enum_keys
      );
    }


    // === CASE 4: vehicle_costs ===
    if (tableName === 'vehicle_costs') {
      baseQuery = db('vehicle_costs')
        .leftJoin('vehicles', 'vehicle_costs.vehicle_id', 'vehicles.id')
        .leftJoin('subscriptions', 'vehicles.subscription_id', 'subscriptions.id')
        .leftJoin('customers', 'subscriptions.customer_id', 'customers.id')
        .select(
          'vehicle_costs.*',
          'vehicles.*',
          'customers.*',
          'subscriptions.*'
        );

      applySearch(
        baseQuery,
        ['subscriptions.id', 'customers.name', 'vehicles.vin'], // adjust searchable columns
        search
      );

      applyFilters(baseQuery, filters, validColumns, 'vehicle_costs.total', 'vehicle_costs');
      applySorting(baseQuery, sortBy, sortOrder, validColumns, 'vehicle_costs');

      return await paginateQuery(
        baseQuery,
        'vehicle_costs',
        page,
        limit,
        filters,
        search,
        columns,
        enum_keys
      );
    }

    // === CASE 5: default ===
    baseQuery = db(tableName).where((builder) => {
      builder.where('isDeleted', 0).orWhereNull('isDeleted');
    });
    applySearch(baseQuery, columns, search);
    applyFilters(baseQuery, filters, validColumns);
    applySorting(baseQuery, sortBy, sortOrder, validColumns);


    // console.log(filters, 'filters')
    return await paginateQuery(baseQuery, tableName, page, limit, filters, search, columns, enum_keys);

  } catch (err) {
    console.error(`Failed to get data from ${tableName}:`, err);
    throw new Error(`Could not fetch data from ${tableName}`);
  }
}

export default getItems;
