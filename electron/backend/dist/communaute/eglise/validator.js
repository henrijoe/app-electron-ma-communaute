"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ajvValidator_1 = require("../../helpers/ajvValidator");
const ajouterEgliseValidator = () => {
    const schema = {
        type: "object",
        properties: {
            nomEglise: { type: "string", nullable: false, },
            idComptabilite: { type: "number", nullable: false, maximum: 999 },
            idUtilisateur: { type: "number", nullable: false, maximum: 999 },
        },
        required: ["nomEglise"],
        additionalProperties: false
    };
    return (0, ajvValidator_1.ajvValidator)(schema);
};
exports.default = {
    ajouterEgliseValidator,
};
//# sourceMappingURL=validator.js.map