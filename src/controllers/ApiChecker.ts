/* eslint-disable @typescript-eslint/no-explicit-any */
import { Response, NextFunction } from "express";
import config from "../config/config";

function InternalApiRequest(req: any, res: Response, next: NextFunction) {
  return (async () => {
    try {
      console.log('🔐 InternalApiRequest - Checking authentication');
      
      if (!req.api_user) {
        console.log('❌ No api_user found in request');
        return res.status(401).json({
          error: true,
          message: 'Unauthorized: API token required'
        });
      }

      console.log('✅ API User found:', {
        id: req.api_user.id,
        name: req.api_user.name,
        role_id: req.api_user.role_id
      });

      if (req.api_user.name !== config.Internal_name) {
        console.log('❌ API User name does not match config');
        return res.status(403).json({
          error: true,
          message: 'Forbidden: Core services only'
        });
      }

      // 🟢 FIX: Set req.user for compatibility with existing code
      req.user = {
        id: req.api_user.id || 1,
        name: req.api_user.name,
        role_id: req.api_user.role_id || 1,
        // Add other properties that your code might expect
      };

      console.log('👤 Mapped req.user:', req.user);

      next();
    } catch (error: any) {
      console.error('💥 InternalApiRequest error:', error);
      return res.status(500).json({
        error: true,
        message: 'Internal server error during authentication check',
        info: error
      });
    }
  })();
}

export default InternalApiRequest;