"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const functions_1 = __importDefault(require("./functions"));
/**
 *
Permet d'ajouter une ame
 * @returns
 */
const ajouterNouvelleAme = (data) => {
    console.log("🚀 ~ file: services.ts:10 ~ ajouterNouvelleAme ~ data:", data);
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const idNouvelleAme = yield functions_1.default.ajouterNouvelleAme(Object.assign({}, data));
            const nouvelleAme = yield functions_1.default.recupNouvelleAmeById(idNouvelleAme);
            resolve(nouvelleAme);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const recupNouvelleAme = () => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const nouvelleAmes = yield functions_1.default.recupNouvelleAme();
            resolve(nouvelleAmes);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const supprimerNouvelleAme = (idNouvelleAme) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const nouvelleAme = yield functions_1.default.recupNouvelleAme();
            if (Array.isArray(nouvelleAme)) {
                const index = nouvelleAme.findIndex((item) => item.idNouvelleAme === idNouvelleAme);
                if (index >= 0) {
                    nouvelleAme.splice(index, 1);
                    yield functions_1.default.supprimerNouvelleAme(idNouvelleAme);
                    resolve(true);
                }
                else {
                    return reject('personne non trouvé');
                }
            }
        }
        catch (error) {
            reject(error);
        }
    }));
};
const modifierNouvelleAme = (data) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield functions_1.default.modifierNouvelleAme(data);
            console.log("🚀 ~ file: services.ts:58 ~ returnnewPromise ~ data+++++:", data);
            resolve(data);
        }
        catch (error) {
            reject(error);
        }
    }));
};
exports.default = {
    ajouterNouvelleAme,
    recupNouvelleAme,
    supprimerNouvelleAme,
    modifierNouvelleAme,
};
//# sourceMappingURL=services.js.map