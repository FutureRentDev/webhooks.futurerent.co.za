import { Router, Request, Response} from "express";
import webhooksRouter from "./webhooks";

const router = Router();


router.get("/", (req: Request, res: Response) => {
    res.status(200)
    res.json({
        message: "successfully connected to FutureRent API"
    })
});


router.use('/webhooks', webhooksRouter)


export default router;