"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ajvValidator_1 = require("../../helpers/ajvValidator");
const ajouterResponsabiliteValidator = () => {
    const schema = {
        type: "object",
        properties: {
            libelleResponsabilite: { type: "string", nullable: false, },
            descriptionResponsabilite: { type: "string", nullable: false, },
            idUtilisateur: { type: "number", nullable: false, maximum: 999 },
        },
        required: ["libelleResponsabilite"],
        additionalProperties: false
    };
    return (0, ajvValidator_1.ajvValidator)(schema);
};
exports.default = {
    ajouterResponsabiliteValidator,
};
//# sourceMappingURL=validator.js.map