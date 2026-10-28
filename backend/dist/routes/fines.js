"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const fineController_1 = require("../controllers/fineController");
const router = (0, express_1.Router)();
router.get("/summary", fineController_1.getFinesSummary);
router.get("/", fineController_1.getFines);
router.get("/:id", fineController_1.getFine);
router.post("/", fineController_1.createFine);
router.put("/:id/pay", fineController_1.payFine);
router.put("/:id/waive", fineController_1.waiveFine);
exports.default = router;
//# sourceMappingURL=fines.js.map