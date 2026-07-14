"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ajvValidator_1 = require("../../helpers/ajvValidator");
const ajouterDomaineActiviteValidator = () => {
    const schema = {
        type: "object",
        properties: {
            idDomaineActivite: { type: "number", nullable: false, maximum: 99999999 },
            libelleDomaineActivite: { type: "string", nullable: false, },
        },
        required: ["libelleDomaineActivite"],
        additionalProperties: false
    };
    return (0, ajvValidator_1.ajvValidator)(schema);
};
exports.default = {
    ajouterDomaineActiviteValidator,
};
//# sourceMappingURL=validator.js.map