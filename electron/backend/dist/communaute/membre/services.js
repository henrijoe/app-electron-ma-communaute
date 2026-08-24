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
const functions_2 = require("../functions");
const fs = require("fs");
const resolveMemberPhotoPath = (photoPath) => {
    if (!photoPath || photoPath.trim() === '') {
        return null;
    }
    const currentPhotoPath = (0, functions_2.getAvatarsPath)(photoPath);
    if (fs.existsSync(currentPhotoPath)) {
        return currentPhotoPath;
    }
    return null;
};
const ajouterMembre = (data) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const membreInsere = yield functions_1.default.ajouterMembre(data);
            resolve(membreInsere);
        }
        catch (error) {
            console.error("Erreur dans services.ajouterMembre:", error);
            reject(error);
        }
    }));
};
const getFileToBase64 = (photoPath) => {
    return new Promise((resolve) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const resolvedPhotoPath = resolveMemberPhotoPath(photoPath);
            if (!resolvedPhotoPath) {
                resolve('');
                return;
            }
            const base64 = fs.readFileSync(resolvedPhotoPath, 'base64');
            resolve(`data:image/jpeg;base64,${base64}`);
        }
        catch (err) {
            console.log(`err => getFileToBase64 : `, err);
            resolve('');
        }
    }));
};
const recupMembre = () => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const membres = yield functions_1.default.recupMembre();
            const membresAvecPhotos = yield Promise.all(membres.map((item) => __awaiter(void 0, void 0, void 0, function* () {
                const photoMembre = yield getFileToBase64(item.photoMembre);
                return Object.assign(Object.assign({}, item), { photoMembre: photoMembre });
            })));
            resolve(membresAvecPhotos);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const recupMembreByIdUtilsateur = (idUtilisateur) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const membereByUtilisateur = yield functions_1.default.recupMembreByIdUtilsateur(idUtilisateur);
            resolve(membereByUtilisateur);
        }
        catch (error) {
            console.log("Erreur recupMembreByIdUtilsateur:", error);
            reject(error);
        }
    }));
};
const supprimerMembre = (idMembre, idUtilisateur) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield functions_1.default.supprimerMembre(idMembre, idUtilisateur);
            resolve({ idMembre: idMembre });
        }
        catch (error) {
            reject(error);
        }
    }));
};
const modifierMembre = (data) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            let photoFileName = data.photoMembre;
            if (data.photoMembre && data.photoMembre.startsWith('data:image/')) {
                const base64Data = data.photoMembre.replace(/^data:image\/\w+;base64,/, '');
                photoFileName = `membre_${data.idMembre}.jpg`;
                const filePath = (0, functions_2.getAvatarsPath)(photoFileName);
                yield (0, functions_2.saveFileToBase64)(filePath, base64Data);
                console.log(`Photo sauvegard�e: ${photoFileName}`);
            }
            const updateData = Object.assign(Object.assign({}, data), { photoMembre: photoFileName });
            yield functions_1.default.modifierMembre(updateData);
            const membreMisAJour = yield functions_1.default.recupMembreById(data.idMembre);
            if (Array.isArray(membreMisAJour) && membreMisAJour.length > 0) {
                resolve(membreMisAJour[0]);
            }
            else {
                reject(new Error("Membre non trouv� apr�s modification"));
            }
        }
        catch (error) {
            console.error("Erreur dans services.modifierMembre:", error);
            reject(error);
        }
    }));
};
const ajouterDemandeInscriptionMembre = (data) => {
    return functions_1.default.ajouterDemandeInscriptionMembre(data);
};
const recupDemandesInscriptionMembreByUtilisateur = (idUtilisateur) => {
    return functions_1.default.recupDemandesInscriptionMembreByUtilisateur(idUtilisateur);
};
const validerDemandeInscriptionMembre = (idDemandeInscription, idUtilisateur) => {
    return functions_1.default.validerDemandeInscriptionMembre(idDemandeInscription, idUtilisateur);
};
const rejeterDemandeInscriptionMembre = (idDemandeInscription, idUtilisateur) => {
    return functions_1.default.rejeterDemandeInscriptionMembre(idDemandeInscription, idUtilisateur);
};
exports.default = {
    recupMembre,
    ajouterMembre,
    supprimerMembre,
    modifierMembre,
    recupMembreByIdUtilsateur,
    ajouterDemandeInscriptionMembre,
    recupDemandesInscriptionMembreByUtilisateur,
    validerDemandeInscriptionMembre,
    rejeterDemandeInscriptionMembre,
};
//# sourceMappingURL=services.js.map