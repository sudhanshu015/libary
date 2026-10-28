"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = __importDefault(require("./config/database"));
const app_1 = __importDefault(require("./app"));
dotenv_1.default.config();
const PORT = process.env.PORT || 3001;
const startServer = async () => {
    await (0, database_1.default)();
    app_1.default.listen(PORT, () => {
        console.log(`\n🚀 LibraryOS API running on http://localhost:${PORT}`);
        console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
        console.log(`\n📌 Endpoints:`);
        console.log(`   GET  /api/dashboard/stats`);
        console.log(`   GET  /api/books`);
        console.log(`   GET  /api/members`);
        console.log(`   GET  /api/loans`);
        console.log(`   GET  /api/reservations`);
        console.log(`   GET  /api/fines`);
    });
};
startServer();
exports.default = app_1.default;
//# sourceMappingURL=index.js.map