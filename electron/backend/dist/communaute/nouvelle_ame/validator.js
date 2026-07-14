"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ajvValidator_1 = require("../../helpers/ajvValidator");
const ajouterNouvelleAmeValidator = () => {
    const schema = {
        type: "object",
        properties: {
            nomNouvelleAme: { type: "string", nullable: false, },
            prenomNouvelleAme: { type: "string", nullable: false, },
            dateConversionNouvelleAme: { type: "string", nullable: false },
            lieuHabitationNouvelleAme: { type: "string", nullable: false, },
            fonctionNouvelleAme: { type: "string", nullable: false, },
            contactNouvelleAme: { type: "string", nullable: false, },
            sexeNouvelleAme: { type: "string", nullable: false, },
            emailNouvelleAme: { type: "string", nullable: false, },
            idEglise: { type: "number", nullable: false, maximum: 999 },
            idCellule: { type: "number", nullable: false, maximum: 999 },
            idDepartement: { type: "number", nullable: false, maximum: 999 },
            idResponsabilite: { type: "number", nullable: false, maximum: 999 },
            idDomaineActivite: { type: "number", nullable: false, maximum: 999 },
            idUtilisateur: { type: "number", nullable: false, maximum: 999 },
            idGroupe: { type: "number", nullable: false, maximum: 999 },
        },
        required: ["nomNouvelleAme", "prenomNouvelleAme", "lieuHabitationNouvelleAme"],
        additionalProperties: false
    };
    return (0, ajvValidator_1.ajvValidator)(schema);
};
const modifierNouvelleAmeValidator = () => {
    const schema = {
        type: "object",
        properties: {
            idNouvelleAme: { type: "number", nullable: false, maximum: 999 },
            nomNouvelleAme: { type: "string", nullable: false, },
            prenomNouvelleAme: { type: "string", nullable: false, },
            dateConversionNouvelleAme: { type: "string", nullable: false },
            lieuHabitationNouvelleAme: { type: "string", nullable: false, },
            fonctionNouvelleAme: { type: "string", nullable: false, },
            contactNouvelleAme: { type: "string", nullable: false, },
            sexeNouvelleAme: { type: "string", nullable: false, },
            emailNouvelleAme: { type: "string", nullable: false, },
            idEglise: { type: "number", nullable: false, maximum: 999 },
            idCellule: { type: "number", nullable: false, maximum: 999 },
            idDepartement: { type: "number", nullable: false, maximum: 999 },
            idResponsabilite: { type: "number", nullable: false, maximum: 999 },
            idDomaineActivite: { type: "number", nullable: false, maximum: 999 },
            idUtilisateur: { type: "number", nullable: false, maximum: 999 },
            idGroupe: { type: "number", nullable: false, maximum: 999 },
        },
        required: ["nomNouvelleAme", "prenomNouvelleAme", "lieuHabitationNouvelleAme"],
        additionalProperties: false
    };
    return (0, ajvValidator_1.ajvValidator)(schema);
};
exports.default = {
    ajouterNouvelleAmeValidator,
    modifierNouvelleAmeValidator
};
//# sourceMappingURL=validator.js.map