"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bookController_1 = require("../controllers/bookController");
const router = (0, express_1.Router)();
router.get("/", bookController_1.getBooks);
router.get("/:id", bookController_1.getBook);
router.post("/", bookController_1.createBook);
router.put("/:id", bookController_1.updateBook);
router.delete("/:id", bookController_1.deleteBook);
exports.default = router;
//# sourceMappingURL=books.js.map