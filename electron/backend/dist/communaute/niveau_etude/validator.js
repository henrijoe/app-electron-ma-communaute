"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ajvValidator_1 = require("../../helpers/ajvValidator");
const ajouterNiveauEtudeValidator = () => {
    const schema = {
        type: "object",
        properties: {
            idNiveauEtude: { type: "number", nullable: false, maximum: 99999999 },
            libelleNiveauEtude: { type: "string", nullable: false, },
        },
        required: ["libelleNiveauEtude"],
        additionalProperties: false
    };
    return (0, ajvValidator_1.ajvValidator)(schema);
};
exports.default = {
    ajouterNiveauEtudeValidator,
};
//# sourceMappingURL=validator.js.map