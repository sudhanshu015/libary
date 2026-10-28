"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const memberController_1 = require("../controllers/memberController");
const router = (0, express_1.Router)();
router.get("/", memberController_1.getMembers);
router.get("/:id", memberController_1.getMember);
router.post("/", memberController_1.createMember);
router.put("/:id", memberController_1.updateMember);
router.delete("/:id", memberController_1.deleteMember);
exports.default = router;
//# sourceMappingURL=members.js.map