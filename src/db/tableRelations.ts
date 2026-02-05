/* eslint-disable @typescript-eslint/no-explicit-any */
import db from './knex';
// import { readS3Object } from '../lib/s3Utils';

interface RelationConfig {
  relationKey: string;
  table: string;
  foreignKey?: string;
  localKey?: string;
  customJoin?: (item: any) => Promise<any[]>;
  nestedRelations?: Record<string, RelationConfig[]>;
}

type RelationMap = Record<string, RelationConfig[]>;

const relationMap: RelationMap = {
  // Api Users
    api_users: [
    {
      relationKey: 'api_role',
      table: 'api_roles',
      foreignKey: 'id',
      localKey: 'role_id',
    },
  ],
  // Staff memebers
  users: [
  {
    relationKey: 'user_roles',
    table: 'user_roles',
    customJoin: async (user) => {
      try {
        const roleIds = JSON.parse(user.roles);
        
        if (!roleIds || !Array.isArray(roleIds) || roleIds.length === 0) {
          return [];
        }
        
        // Fetch roles and maintain the order from the roleIds array
        const roles = await db('user_roles')
          .whereIn('id', roleIds)
          .select('*');
        
        // Sort roles to match the order in roleIds array
        const roleMap = new Map(roles.map(role => [role.id, role]));
        const orderedRoles = roleIds.map(id => roleMap.get(id)).filter(Boolean);
        
        return orderedRoles;
      } catch (error) {
        console.error('Error fetching user roles:', error);
        return [];
      }
    },
  },
]
};

export default relationMap;
