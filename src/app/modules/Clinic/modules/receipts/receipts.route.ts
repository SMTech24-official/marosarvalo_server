import { Router } from "express";
import ReceiptControllers from "./receipts.controller";
import validateRequest from "../../../../middlewares/validateRequest";
import clinicValidation from "../../clinic.validation";

const router = Router();

// Create Receipt
router.post(
    "/",
    validateRequest(clinicValidation.createReceiptSchema),
    ReceiptControllers.createReceipt
);

// Get Receipts
router.get("/", ReceiptControllers.getReceipts);

// Get Receipt Details by Id
router.get("/:id", ReceiptControllers.getReceiptDetailsById);

// Delete Receipt
router.delete("/:id", ReceiptControllers.deleteReceipt);

export const ReceiptRoutes = router;
