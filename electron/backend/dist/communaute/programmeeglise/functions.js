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
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../../db");
// Ajoute une ligne de programme (un culte planifie) pour une eglise, a une date
// precise. Refuse si un programme existe deja pour cette meme date (on demande
// alors de modifier celui-ci plutot que d'en creer un deuxieme au meme endroit).
const ajouterProgrammeEglise = (data) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const idUtilisateur = Number(data.idUtilisateur) || null;
            const dateProgramme = String(data.dateProgramme || '').slice(0, 10);
            const direction = String(data.direction || '').trim();
            if (!idUtilisateur) {
                reject(new Error('Église introuvable.'));
                return;
            }
            if (!dateProgramme) {
                reject(new Error('La date est requise.'));
                return;
            }
            if (!direction) {
                reject(new Error('La direction est requise.'));
                return;
            }
            // Un seul programme autorise par jour et par eglise : on verifie avant d'inserer.
            const existant = yield (0, db_1._selectSql)('SELECT idProgramme FROM programme_eglise WHERE idUtilisateur = ? AND dateProgramme = ? LIMIT 1', [idUtilisateur, dateProgramme]);
            if (Array.isArray(existant) && existant.length > 0) {
                reject(new Error('Un programme est déjà prévu pour cette date. Modifiez-le plutôt.'));
                return;
            }
            const sql = `INSERT INTO programme_eglise(
        idUtilisateur, dateProgramme, direction, saintCene, predication, offrandes, annonces, thematique
      ) VALUES (?,?,?,?,?,?,?,?)`;
            const result = yield (0, db_1._executeSql)(sql, [
                idUtilisateur,
                dateProgramme,
                direction,
                data.saintCene || '',
                data.predication || '',
                data.offrandes || '',
                data.annonces || '',
                data.thematique || '',
            ]);
            // On relit la ligne fraichement creee pour renvoyer un objet complet
            // (avec son idProgramme et sa dateCreation) au front.
            const inserted = yield (0, db_1._selectSql)('SELECT * FROM programme_eglise WHERE idProgramme = ?', [result.insertId]);
            resolve(inserted[0]);
        }
        catch (error) {
            reject(error);
        }
    }));
};
// Modifie une ligne de programme deja existante.
// Meme regle qu'a l'ajout : pas deux programmes pour la meme date.
const modifierProgrammeEglise = (data) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const idProgramme = Number(data.idProgramme) || null;
            const idUtilisateur = Number(data.idUtilisateur) || null;
            const dateProgramme = String(data.dateProgramme || '').slice(0, 10);
            const direction = String(data.direction || '').trim();
            if (!idProgramme || !idUtilisateur) {
                reject(new Error('Programme introuvable.'));
                return;
            }
            if (!dateProgramme) {
                reject(new Error('La date est requise.'));
                return;
            }
            if (!direction) {
                reject(new Error('La direction est requise.'));
                return;
            }
            // On exclut la ligne qu'on est en train de modifier (idProgramme <> ?)
            // pour ne pas se bloquer soi-meme si la date n'a pas change.
            const doublon = yield (0, db_1._selectSql)('SELECT idProgramme FROM programme_eglise WHERE idUtilisateur = ? AND dateProgramme = ? AND idProgramme <> ? LIMIT 1', [idUtilisateur, dateProgramme, idProgramme]);
            if (Array.isArray(doublon) && doublon.length > 0) {
                reject(new Error('Un autre programme est déjà prévu pour cette date.'));
                return;
            }
            yield (0, db_1._executeSql)(`UPDATE programme_eglise
         SET dateProgramme=?, direction=?, saintCene=?, predication=?, offrandes=?, annonces=?, thematique=?
         WHERE idProgramme=? AND idUtilisateur=?`, [
                dateProgramme,
                direction,
                data.saintCene || '',
                data.predication || '',
                data.offrandes || '',
                data.annonces || '',
                data.thematique || '',
                idProgramme,
                idUtilisateur,
            ]);
            const updated = yield (0, db_1._selectSql)('SELECT * FROM programme_eglise WHERE idProgramme = ?', [idProgramme]);
            resolve(updated[0]);
        }
        catch (error) {
            reject(error);
        }
    }));
};
// Retire une ligne de programme. Scope par idUtilisateur pour qu'une eglise
// ne puisse jamais supprimer le programme d'une autre eglise.
const supprimerProgrammeEglise = (idProgramme, idUtilisateur) => {
    return new Promise((resolve, reject) => {
        (0, db_1._executeSql)('DELETE FROM programme_eglise WHERE idProgramme = ? AND idUtilisateur = ?', [idProgramme, idUtilisateur])
            .then(() => resolve(true))
            .catch((error) => reject(error));
    });
};
// Recupere tout le programme d'une eglise, trie du plus ancien au plus recent
// (l'ecran de gestion regroupe ensuite ces lignes par mois cote client).
const recupProgrammesEgliseByUtilisateur = (idUtilisateur) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = 'SELECT * FROM programme_eglise WHERE idUtilisateur = ? ORDER BY dateProgramme ASC';
            const programmes = yield (0, db_1._selectSql)(sql, [idUtilisateur]);
            resolve(programmes);
        }
        catch (error) {
            reject(error);
        }
    }));
};
exports.default = {
    ajouterProgrammeEglise,
    modifierProgrammeEglise,
    supprimerProgrammeEglise,
    recupProgrammesEgliseByUtilisateur,
};
//# sourceMappingURL=functions.js.map