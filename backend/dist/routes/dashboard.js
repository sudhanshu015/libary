"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboardController_1 = require("../controllers/dashboardController");
const router = (0, express_1.Router)();
router.get("/stats", dashboardController_1.getDashboardStats);
router.get("/loans-by-month", dashboardController_1.getLoansByMonth);
router.get("/loans-by-genre", dashboardController_1.getLoansByGenre);
router.get("/recent-loans", dashboardController_1.getRecentLoans);
router.get("/low-stock", dashboardController_1.getLowStockBooks);
exports.default = router;
//# sourceMappingURL=dashboard.js.map