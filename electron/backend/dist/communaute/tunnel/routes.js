"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controllers_1 = __importDefault(require("./controllers"));
const tunnelRouter = express_1.default.Router();
tunnelRouter.get('/tunnel/status', controllers_1.default.getTunnelStatus);
tunnelRouter.post('/tunnel/start', controllers_1.default.startTunnel);
tunnelRouter.post('/tunnel/stop', controllers_1.default.stopTunnel);
exports.default = tunnelRouter;
//# sourceMappingURL=routes.js.map