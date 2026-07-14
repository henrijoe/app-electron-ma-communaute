"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ajvValidateSchema = exports.ajvValidator = void 0;
const Ajv = require("ajv");
const addFormats = require("ajv-formats");
const localize = require("ajv-i18n");
const ajvValidator = (schema) => {
    return (req, res, next) => {
        const ajvInstance = new Ajv({ allErrors: true });
        addFormats(ajvInstance);
        const validate = ajvInstance.compile(schema);
        const valid = validate(req.body);
        if (!valid) {
            // it is imperative that the reference to the error is copied
            // the next time ajv runs the error object could be overridden
            // because under the hood it is just a pointer
            // that's why the reference needs to be copied in the same execution
            // block. Note that Node is single-threaded and you do not have
            // concurrency
            // in this simple example it would work without copying
            // simply because we are directly terminating the request with
            // res.status(400).json(...)
            // but in general copying the error reference is crucial
            const error = validate.errors;
            localize.fr(validate.error);
            return res.status(400).send({ status: 0, error });
        }
        next();
    };
};
exports.ajvValidator = ajvValidator;
/**
 * Valider un schema en renvoyant un boolean
 * @param schema le schema de validation
 * @param data le payload a valider
 * @returns
 */
const ajvValidateSchema = (schema, data) => {
    const ajvInstance = new Ajv({ allErrors: true });
    addFormats(ajvInstance);
    const validate = ajvInstance.compile(schema);
    const valid = validate(data);
    if (!valid)
        return false;
    return true;
};
exports.ajvValidateSchema = ajvValidateSchema;
//# sourceMappingURL=ajvValidator.js.map