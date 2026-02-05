/* eslint-disable @typescript-eslint/no-namespace */
import { ActivityLogData } from '../utils/logger/activityLogger';


export interface AppError extends Error {
  status?: number;
}

declare global {
  namespace Express {
    interface Request {
      activityLogData?: ActivityLogData;
      requestStartTime?: number;
    }
  }
}
