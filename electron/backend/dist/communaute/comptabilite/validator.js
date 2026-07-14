"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ajvValidator_1 = require("../../helpers/ajvValidator");
const ajouterComptabiliteValidator = () => {
    const schema = {
        type: "object",
        properties: {
            nomComptabilite: { type: "string", nullable: false, },
            entreeComptabilite: { type: "number", nullable: false, maximum: 99999999 },
            sortieComptabilite: { type: "number", nullable: false, maximum: 99999999 },
            dateComptabilite: { type: "string", oneOf: [{ format: "date" }, { format: "date-time" }], nullable: false, },
            observationComptabilite: { type: "string", nullable: false, },
            idUtilisateur: { type: "number", nullable: false, maximum: 999 },
        },
        required: ["nomComptabilite", "entreeComptabilite", "dateComptabilite"],
        additionalProperties: false
    };
    return (0, ajvValidator_1.ajvValidator)(schema);
};
exports.default = {
    ajouterComptabiliteValidator,
};
//# sourceMappingURL=validator.js.map