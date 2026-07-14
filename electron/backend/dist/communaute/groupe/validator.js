"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ajvValidator_1 = require("../../helpers/ajvValidator");
const ajouterGroupeValidator = () => {
    const schema = {
        type: "object",
        properties: {
            libelleGroupe: { type: "string", nullable: false, },
            descriptionGroupe: { type: "string", nullable: true, },
            responsableGroupe: { type: "string", nullable: true, },
            idUtilisateur: { type: "number", nullable: false },
        },
        required: ["libelleGroupe",],
        additionalProperties: false
    };
    return (0, ajvValidator_1.ajvValidator)(schema);
};
const modifierGroupeValidator = () => {
    const schema = {
        type: "object",
        properties: {
            idGroupe: { type: "number", nullable: false, maximum: 999 },
            libelleGroupe: { type: "string", nullable: false, },
            descriptionGroupe: { type: "string", nullable: true, },
            responsableGroupe: { type: "string", nullable: true, },
            idUtilisateur: { type: "number", nullable: false },
        },
        required: ["idGroupe", "libelleGroupe",],
        additionalProperties: false
    };
    return (0, ajvValidator_1.ajvValidator)(schema);
};
exports.default = {
    ajouterGroupeValidator,
    modifierGroupeValidator,
};
//# sourceMappingURL=validator.js.map