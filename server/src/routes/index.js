import { Router } from "express";
import enquiryRoutes from "./enquiryRoutes.js";
import estimateRoutes from "./estimateRoutes.js";
import hotelRoutes from "./hotelRoutes.js";
import leadRoutes from "./leadRoutes.js";
import systemRoutes from "./systemRoutes.js";

const router = Router();

router.use(systemRoutes);
router.use(hotelRoutes);
router.use(estimateRoutes);
router.use(leadRoutes);
router.use(enquiryRoutes);

export default router;
