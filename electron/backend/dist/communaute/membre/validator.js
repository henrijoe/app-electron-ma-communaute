"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ajvValidator_1 = require("../../helpers/ajvValidator");
const ajouterMembreValidator = () => {
    const schema = {
        type: "object",
        properties: {
            nomMembre: { type: "string", nullable: false, },
            prenomMembre: { type: "string", nullable: false, },
            dateNaissMembre: { type: "string", nullable: false },
            lieuNaissMembre: { type: "string", nullable: false, },
            sexeMembre: { type: "string", nullable: false, },
            emailMembre: { type: "string", nullable: false, },
            nationaliteMembre: { type: "string", nullable: false, },
            fonctionMembre: { type: "string", nullable: false, },
            contactMembre: { type: "string", nullable: false, },
            ethnieMembre: { type: "string", nullable: false, },
            residenceMembre: { type: "string", nullable: false, },
            civiliteMembre: { type: "string", nullable: false, },
            dateConversionMembre: { type: "string", nullable: false, },
            baptemeEauMembre: { type: "string", nullable: false, },
            dateBaptemeMembre: { type: "string", nullable: false, },
            dateMariageMembre: { type: "string", nullable: false, },
            capaciteSpirituelleMembre: { type: "string", nullable: false, },
            situationMatrimonialeMembre: { type: "string", nullable: false, },
            nombreEnfantMembre: { type: "number", nullable: false, maximum: 999 },
            photoMembre: { type: "text", nullable: false, },
            lieuBaptemeEauMembre: { type: "string", nullable: false, },
            contactParentMembre: { type: "string", nullable: false, },
            baptemeSaintEspritMembre: { type: "string", nullable: false, },
            dateBaptemeSaintEspritMembre: { type: "string", nullable: false, },
            egliseOrigineMembre: { type: "string", nullable: false, },
            nomPrenomParentMembre: { type: "string", nullable: false, },
            lieuTravailMembre: { type: "string", nullable: false, },
            idNiveauEtude: { type: "number", nullable: false, maximum: 999 },
            idEglise: { type: "number", nullable: false, maximum: 999 },
            idCellule: { type: "number", nullable: false, maximum: 999 },
            idDepartement: { type: "number", nullable: false, maximum: 999 },
            idGroupe: { type: "number", nullable: false, maximum: 999 },
            idResponsabilite: { type: "number", nullable: false, maximum: 999 },
            idDomaineActivite: { type: "number", nullable: false, maximum: 999 },
            idUtilisateur: { type: "number", nullable: false, maximum: 999 },
        },
        required: ["nomMembre", "prenomMembre", "contactMembre", "baptemeEauMembre", "residenceMembre"],
        additionalProperties: false
    };
    return (0, ajvValidator_1.ajvValidator)(schema);
};
const modifierMembreValidator = () => {
    const schema = {
        type: "object",
        properties: {
            idMembre: { type: "number", nullable: false, maximum: 999 },
            nomMembre: { type: "string", nullable: false, },
            prenomMembre: { type: "string", nullable: false, },
            dateNaissMembre: { type: "string", oneOf: [{ format: "date" }, { format: "date-time" }], nullable: false },
            lieuNaissMembre: { type: "string", nullable: false, },
            sexeMembre: { type: "string", nullable: false, },
            emailMembre: { type: "string", nullable: false, },
            nationaliteMembre: { type: "string", nullable: false, },
            fonctionMembre: { type: "string", nullable: false, },
            contactMembre: { type: "string", nullable: false, },
            ethnieMembre: { type: "string", nullable: false, },
            residenceMembre: { type: "string", nullable: false, },
            civiliteMembre: { type: "string", nullable: false, },
            dateConversionMembre: { type: "string", nullable: false, },
            baptemeEauMembre: { type: "string", nullable: false, },
            dateBaptemeMembre: { type: "string", oneOf: [{ format: "date" }, { format: "date-time" }], nullable: false, },
            dateMariageMembre: { type: "string", oneOf: [{ format: "date" }, { format: "date-time" }], nullable: false, },
            capaciteSpirituelleMembre: { type: "string", nullable: false, },
            situationMatrimonialeMembre: { type: "string", nullable: false, },
            nombreEnfantMembre: { type: "number", nullable: false, maximum: 999 },
            photoMembre: { type: "string", nullable: false, },
            lieuBaptemeEauMembre: { type: "string", nullable: false, },
            contactParentMembre: { type: "string", nullable: false, },
            baptemeSaintEspritMembre: { type: "string", nullable: false, },
            dateBaptemeSaintEspritMembre: { type: "string", oneOf: [{ format: "date" }, { format: "date-time" }], nullable: false, },
            egliseOrigineMembre: { type: "string", nullable: false, },
            nomPrenomParentMembre: { type: "string", nullable: false, },
            lieuTravailMembre: { type: "string", nullable: false, },
            idNiveauEtude: { type: "number", nullable: false, maximum: 999 },
            idEglise: { type: "number", nullable: false, maximum: 999 },
            idCellule: { type: "number", nullable: false, maximum: 999 },
            idDepartement: { type: "number", nullable: false, maximum: 999 },
            idGroupe: { type: "number", nullable: false, maximum: 999 },
            idResponsabilite: { type: "number", nullable: false, maximum: 999 },
            idDomaineActivite: { type: "number", nullable: false, maximum: 999 },
            idUtilisateur: { type: "number", nullable: false, maximum: 999 },
        },
        required: ["nomMembre", "prenomMembre", "contactMembre", "baptemeEauMembre", "residenceMembre"],
        additionalProperties: false
    };
    return (0, ajvValidator_1.ajvValidator)(schema);
};
exports.default = {
    ajouterMembreValidator,
    modifierMembreValidator
};
//# sourceMappingURL=validator.js.map