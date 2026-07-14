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
const ajouterAgenda = (data) => new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const idAgenda = yield functions_1.default.ajouterAgenda(Object.assign({}, data));
        const agenda = yield functions_1.default.recupAgendaId(idAgenda);
        resolve((agenda === null || agenda === void 0 ? void 0 : agenda[0]) || agenda);
    }
    catch (error) {
        reject(error);
    }
}));
const recupAgendaByIdUtilsateur = (idUtilisateur) => new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const agendaByUtilisateur = yield functions_1.default.recupAgendaByIdUtilsateur(idUtilisateur);
        resolve(agendaByUtilisateur);
    }
    catch (error) {
        reject(error);
    }
}));
const supprimerAgenda = (idAgenda) => new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield functions_1.default.supprimerAgenda(idAgenda);
        resolve({ idAgenda });
    }
    catch (error) {
        reject(error);
    }
}));
const modifierAgenda = (data) => new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield functions_1.default.modifierAgenda(data);
        resolve(data);
    }
    catch (error) {
        reject(error);
    }
}));
exports.default = {
    ajouterAgenda,
    recupAgendaByIdUtilsateur,
    supprimerAgenda,
    modifierAgenda,
};
//# sourceMappingURL=services.js.map