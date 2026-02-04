/* eslint-disable @typescript-eslint/no-explicit-any */
import express from 'express';
import path from 'path';
import router from './routes/index.routes';

import cors from "cors";
import helmet from "helmet";
import { createServer } from 'http';

const app = express();
const server = createServer(app);

// 1. Apply CORS FIRST
const corsOptions = {
  origin: function (origin: any, callback: any) {
    // Allow all origins for now to test
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'app_name', 'authorization', 'X-Requested-With', 'reset_token', 'user_session', 'reset_password_token'],
};

app.use(cors(corsOptions));


// 4. Then other middleware
app.use(helmet());
app.use(express.json());

app.use('/', express.static(path.join(__dirname, './public')));
app.use('/api', router);



// app.use(errorHandler);

export { app, server };