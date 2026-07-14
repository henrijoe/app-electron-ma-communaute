"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ajvValidator_1 = require("../../helpers/ajvValidator");
const ajouterCelluleValidator = () => {
    const schema = {
        type: "object",
        properties: {
            nomCellule: { type: "string", nullable: false, },
            lieuCellule: { type: "string", nullable: false, },
            nombreMembreCellule: { type: "number", nullable: false },
            idUtilisateur: { type: "number", nullable: false, maximum: 999 },
            idCellule: { type: "number", nullable: false, minimum: 1, maximum: 999 },
        },
        required: ["nomCellule", "lieuCellule", "idUtilisateur"],
        additionalProperties: false
    };
    return (0, ajvValidator_1.ajvValidator)(schema);
};
exports.default = {
    ajouterCelluleValidator,
};
//# sourceMappingURL=validator.js.map