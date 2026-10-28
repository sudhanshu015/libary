"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reservationController_1 = require("../controllers/reservationController");
const router = (0, express_1.Router)();
router.get("/", reservationController_1.getReservations);
router.get("/:id", reservationController_1.getReservation);
router.post("/", reservationController_1.createReservation);
router.put("/:id/fulfill", reservationController_1.fulfillReservation);
router.put("/:id/cancel", reservationController_1.cancelReservation);
exports.default = router;
//# sourceMappingURL=reservations.js.map