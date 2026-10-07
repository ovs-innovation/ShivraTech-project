import Ticket from "../models/Ticket.js";
import { ApiError, ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// @desc    Raise a new support ticket / dispute
// @route   POST /api/v1/tickets
// @access  Public / Authenticated
export const createTicket = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    phone,
    category,
    subject,
    description,
    orderId,
    paymentId,
    priority,
  } = req.body;

  if (!subject || !description) {
    throw new ApiError(400, "Subject and description are required.");
  }

  const finalName = name || req.user?.name || "Customer";
  const finalEmail = email || req.user?.email;

  if (!finalEmail) {
    throw new ApiError(400, "Contact email is required to submit a ticket.");
  }

  const ticket = await Ticket.create({
    user: req.user?._id || null,
    userRole: req.user?.role || "guest",
    name: finalName,
    email: finalEmail,
    phone: phone || req.user?.phone || "",
    category: category || "order",
    subject,
    description,
    orderId: orderId || "",
    paymentId: paymentId || "",
    priority: priority || "medium",
    status: "open",
  });

  res
    .status(201)
    .json(new ApiResponse(201, ticket, "Support ticket created successfully"));
});

// @desc    Get all tickets / disputes (Admin view)
// @route   GET /api/v1/tickets
// @access  Admin
export const getTickets = asyncHandler(async (req, res) => {
  const {
    search,
    status,
    category,
    priority,
    userRole,
    page = 1,
    limit = 20,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  const query = {};

  if (status) query.status = status;
  if (category) query.category = category;
  if (priority) query.priority = priority;
  if (userRole) query.userRole = userRole;

  if (search) {
    query.$or = [
      { ticketId: { $regex: search, $options: "i" } },
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { subject: { $regex: search, $options: "i" } },
      { orderId: { $regex: search, $options: "i" } },
      { paymentId: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

  const [tickets, total, counts] = await Promise.all([
    Ticket.find(query)
      .populate("user", "name email role")
      .populate("resolvedBy", "name email")
      .sort(sort)
      .skip(skip)
      .limit(Number(limit)),
    Ticket.countDocuments(query),
    Ticket.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  // Aggregate category counts
  const categoryCountsAgg = await Ticket.aggregate([
    {
      $group: {
        _id: "$category",
        count: { $sum: 1 },
      },
    },
  ]);

  const statusSummary = {
    total: 0,
    open: 0,
    in_progress: 0,
    resolved: 0,
    closed: 0,
  };

  counts.forEach((item) => {
    if (statusSummary[item._id] !== undefined) {
      statusSummary[item._id] = item.count;
    }
    statusSummary.total += item.count;
  });

  const categorySummary = {};
  categoryCountsAgg.forEach((item) => {
    categorySummary[item._id] = item.count;
  });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        tickets,
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)) || 1,
        counts: statusSummary,
        categories: categorySummary,
      },
      "Tickets retrieved successfully"
    )
  );
});

// @desc    Get user's own tickets
// @route   GET /api/v1/tickets/my-tickets
// @access  Authenticated
export const getMyTickets = asyncHandler(async (req, res) => {
  const query = {
    $or: [{ user: req.user._id }, { email: req.user.email }],
  };

  const tickets = await Ticket.find(query).sort({ createdAt: -1 });

  res
    .status(200)
    .json(new ApiResponse(200, tickets, "My tickets retrieved successfully"));
});

// @desc    Get single ticket by ID
// @route   GET /api/v1/tickets/:id
// @access  Authenticated / Admin
export const getTicketById = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id)
    .populate("user", "name email role")
    .populate("resolvedBy", "name email");

  if (!ticket) {
    throw new ApiError(404, "Ticket not found");
  }

  // If not admin, check if user is the creator
  if (
    req.user.role !== "admin" &&
    (!ticket.user || ticket.user._id.toString() !== req.user._id.toString()) &&
    ticket.email !== req.user.email
  ) {
    throw new ApiError(403, "Not authorized to view this ticket");
  }

  res
    .status(200)
    .json(new ApiResponse(200, ticket, "Ticket retrieved successfully"));
});

// @desc    Update ticket status, priority, admin response (Admin)
// @route   PUT /api/v1/tickets/:id
// @access  Admin
export const updateTicket = asyncHandler(async (req, res) => {
  const { status, priority, adminNotes, adminReply } = req.body;

  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) {
    throw new ApiError(404, "Ticket not found");
  }

  if (status !== undefined) {
    ticket.status = status;
    if (status === "resolved" || status === "closed") {
      ticket.resolvedAt = new Date();
      ticket.resolvedBy = req.user._id;
    }
  }

  if (priority !== undefined) ticket.priority = priority;
  if (adminNotes !== undefined) ticket.adminNotes = adminNotes;
  if (adminReply !== undefined) ticket.adminReply = adminReply;

  await ticket.save();

  const updated = await Ticket.findById(ticket._id)
    .populate("user", "name email role")
    .populate("resolvedBy", "name email");

  res
    .status(200)
    .json(new ApiResponse(200, updated, "Ticket updated successfully"));
});

// @desc    Delete ticket (Admin)
// @route   DELETE /api/v1/tickets/:id
// @access  Admin
export const deleteTicket = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) {
    throw new ApiError(404, "Ticket not found");
  }

  await ticket.deleteOne();
  res
    .status(200)
    .json(new ApiResponse(200, null, "Ticket deleted successfully"));
});
