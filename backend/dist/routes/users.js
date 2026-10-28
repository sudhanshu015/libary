"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate, auth_1.authorizeAdmin);
router.get("/", userController_1.listUsers);
router.post("/", userController_1.createUser);
router.put("/:id", userController_1.updateUser);
router.delete("/:id", userController_1.deactivateUser);
exports.default = router;
//# sourceMappingURL=users.js.map