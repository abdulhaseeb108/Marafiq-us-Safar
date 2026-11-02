import { Router } from "express";
import { health, readiness } from "../controllers/systemController.js";

const router = Router();

router.get("/health", health);
router.get("/ready", readiness);

export default router;
