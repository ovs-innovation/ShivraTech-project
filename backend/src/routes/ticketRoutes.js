import { Router } from "express";
import {
  createTicket,
  getTickets,
  getMyTickets,
  getTicketById,
  updateTicket,
  deleteTicket,
} from "../controllers/ticketController.js";
import {
  protect,
  authorize,
  optionalProtect,
} from "../middleware/authMiddleware.js";

const router = Router();

// Public / Authenticated create ticket
router.post("/", optionalProtect, createTicket);

// Current user's tickets
router.get("/my-tickets", protect, getMyTickets);

// Admin-only ticket operations
router.get("/", protect, authorize("admin"), getTickets);
router.get("/:id", protect, getTicketById);
router.put("/:id", protect, authorize("admin"), updateTicket);
router.delete("/:id", protect, authorize("admin"), deleteTicket);

export default router;
