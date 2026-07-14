"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ajvValidator_1 = require("../../helpers/ajvValidator");
const ajouterDepartementValidator = () => {
    const schema = {
        type: "object",
        properties: {
            libelleLongDepartement: { type: "string", nullable: false, },
            libelleCourtDepartement: { type: "string", nullable: false },
            sloganDepartement: { type: "string", nullable: false },
            responsableDepartement: { type: "string", nullable: false },
            idUtilisateur: { type: "number", nullable: false, maximum: 999 },
        },
        required: ["libelleCourtDepartement"],
        additionalProperties: false
    };
    return (0, ajvValidator_1.ajvValidator)(schema);
};
const modifierDepartementValidator = () => {
    const schema = {
        type: "object",
        properties: {
            idDepartement: { type: "number", nullable: false, maximum: 999 },
            libelleLongDepartement: { type: "string", nullable: false, },
            libelleCourtDepartement: { type: "string", nullable: false },
            sloganDepartement: { type: "string", nullable: false },
            responsableDepartement: { type: "string", nullable: false },
            idUtilisateur: { type: "number", nullable: false, maximum: 999 },
        },
        required: ["libelleCourtDepartement",],
        additionalProperties: false
    };
    return (0, ajvValidator_1.ajvValidator)(schema);
};
exports.default = {
    ajouterDepartementValidator,
    modifierDepartementValidator
};
//# sourceMappingURL=validator.js.map