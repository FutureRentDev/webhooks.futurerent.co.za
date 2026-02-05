// Route handles all cron_jobs for vehicles
import {Router, Request, Response } from "express";

// Middleware
// import cronVehicle from "./vehicles";

const wialonWebHookRouter = Router();


// This webhook handles for Vehicle Rental Agreement
wialonWebHookRouter.post('/', async (req: Request, res: any) => {
    try {
        console.log(res)
        // console.log('Received Wialon alert:', JSON.stringify(req.body, null, 2));
    } catch (error) {
        console.error('Error on e-signture webhook', error)
    }
})


export default wialonWebHookRouter;
