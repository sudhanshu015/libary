"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const loanController_1 = require("../controllers/loanController");
const router = (0, express_1.Router)();
router.get("/", loanController_1.getLoans);
router.get("/:id", loanController_1.getLoan);
router.post("/", loanController_1.createLoan);
router.put("/:id/return", loanController_1.returnLoan);
router.put("/:id", loanController_1.updateLoan);
exports.default = router;
//# sourceMappingURL=loans.js.map