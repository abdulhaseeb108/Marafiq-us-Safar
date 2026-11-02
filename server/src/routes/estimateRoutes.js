import { Router } from "express";
import { calculateEstimate, createEstimatePdf } from "../controllers/estimateController.js";

const router = Router();

router.post("/calculate", calculateEstimate);
router.post("/estimate-pdf", createEstimatePdf);

export default router;
