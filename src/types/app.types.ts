/* eslint-disable @typescript-eslint/no-namespace */


export interface AppError extends Error {
  status?: number;
}

declare global {
  namespace Express {
    interface Request {
      requestStartTime?: number;
    }
  }
}
