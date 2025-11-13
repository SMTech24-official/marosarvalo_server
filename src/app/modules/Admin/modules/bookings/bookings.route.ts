import { Router } from "express";
import BookingsControllers from "./bookings.controller";

const router = Router();

router.get("/", BookingsControllers.getAllBookings);

router.get("/:id", BookingsControllers.getSingleBookings);

router.delete("/:id", BookingsControllers.deleteBookings);

router.patch("/:id/status", BookingsControllers.updateBookingStatus);

export const BookingsRoutes = router;
