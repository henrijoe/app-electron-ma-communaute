"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const service_1 = __importDefault(require("./service"));
const getDataEglise = (req, res) => {
    const { idUtilisateur } = req.params;
    console.log("🚀 ~ file: controllers.ts:7 ~ getDataEglise ~ idUtilisateur:", idUtilisateur);
    service_1.default
        .getDataEglise(idUtilisateur)
        .then((result) => {
        // console.log("🚀 ~ file: controllers.ts:10 ~ .then ~ result:", result)
        res.status(200).send({ status: 1, data: result });
    })
        .catch((error) => res.status(400).send({ status: 0, error }));
};
exports.default = {
    getDataEglise,
};
//# sourceMappingURL=controllers.js.map