import { Router } from "express";
import { getHotels } from "../controllers/hotelController.js";

const router = Router();

router.get("/hotels", getHotels);

export default router;
