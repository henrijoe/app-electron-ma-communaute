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
// Ajoute un nouveau verset programme pour une eglise, a une date precise.
// Refuse si un verset existe deja pour cette meme date (on demande alors
// de modifier celui-ci plutot que d'en creer un deuxieme au meme endroit).
const ajouterVersetProgramme = (data) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const idUtilisateur = Number(data.idUtilisateur) || null;
            const dateAffichage = String(data.dateAffichage || '').slice(0, 10);
            const texte = String(data.texte || '').trim();
            if (!idUtilisateur) {
                reject(new Error('Église introuvable.'));
                return;
            }
            if (!dateAffichage) {
                reject(new Error('La date est requise.'));
                return;
            }
            if (!texte) {
                reject(new Error('Le texte du verset est requis.'));
                return;
            }
            // Un seul verset autorise par jour et par eglise : on verifie avant d'inserer.
            const existant = yield (0, db_1._selectSql)('SELECT idVersetProgramme FROM verset_programme WHERE idUtilisateur = ? AND dateAffichage = ? LIMIT 1', [idUtilisateur, dateAffichage]);
            if (Array.isArray(existant) && existant.length > 0) {
                reject(new Error('Un verset est déjà programmé pour cette date. Modifiez-le plutôt.'));
                return;
            }
            const sql = 'INSERT INTO verset_programme(idUtilisateur, dateAffichage, reference, texte) VALUES (?,?,?,?)';
            const result = yield (0, db_1._executeSql)(sql, [idUtilisateur, dateAffichage, data.reference || '', texte]);
            // On relit la ligne fraichement creee pour renvoyer un objet complet
            // (avec son idVersetProgramme et sa dateCreation) au front.
            const inserted = yield (0, db_1._selectSql)('SELECT * FROM verset_programme WHERE idVersetProgramme = ?', [result.insertId]);
            resolve(inserted[0]);
        }
        catch (error) {
            reject(error);
        }
    }));
};
// Modifie un verset deja programme (date, reference ou texte).
// Meme regle qu'a l'ajout : pas deux versets pour la meme date.
const modifierVersetProgramme = (data) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const idVersetProgramme = Number(data.idVersetProgramme) || null;
            const idUtilisateur = Number(data.idUtilisateur) || null;
            const dateAffichage = String(data.dateAffichage || '').slice(0, 10);
            const texte = String(data.texte || '').trim();
            if (!idVersetProgramme || !idUtilisateur) {
                reject(new Error('Verset introuvable.'));
                return;
            }
            if (!dateAffichage) {
                reject(new Error('La date est requise.'));
                return;
            }
            if (!texte) {
                reject(new Error('Le texte du verset est requis.'));
                return;
            }
            // On exclut le verset qu'on est en train de modifier (idVersetProgramme <> ?)
            // pour ne pas se bloquer soi-meme si la date n'a pas change.
            const doublon = yield (0, db_1._selectSql)('SELECT idVersetProgramme FROM verset_programme WHERE idUtilisateur = ? AND dateAffichage = ? AND idVersetProgramme <> ? LIMIT 1', [idUtilisateur, dateAffichage, idVersetProgramme]);
            if (Array.isArray(doublon) && doublon.length > 0) {
                reject(new Error('Un autre verset est déjà programmé pour cette date.'));
                return;
            }
            yield (0, db_1._executeSql)('UPDATE verset_programme SET dateAffichage=?, reference=?, texte=? WHERE idVersetProgramme=? AND idUtilisateur=?', [dateAffichage, data.reference || '', texte, idVersetProgramme, idUtilisateur]);
            const updated = yield (0, db_1._selectSql)('SELECT * FROM verset_programme WHERE idVersetProgramme = ?', [idVersetProgramme]);
            resolve(updated[0]);
        }
        catch (error) {
            reject(error);
        }
    }));
};
// Retire un verset programme. Scope par idUtilisateur pour qu'une eglise
// ne puisse jamais supprimer le verset d'une autre eglise.
const supprimerVersetProgramme = (idVersetProgramme, idUtilisateur) => {
    return new Promise((resolve, reject) => {
        (0, db_1._executeSql)('DELETE FROM verset_programme WHERE idVersetProgramme = ? AND idUtilisateur = ?', [idVersetProgramme, idUtilisateur])
            .then(() => resolve(true))
            .catch((error) => reject(error));
    });
};
// Recupere tous les versets programmes d'une eglise, tries du plus ancien
// au plus recent (utilise a la fois par l'ecran de gestion dans Parametres
// et par le tableau de bord pour trouver le verset du jour).
const recupVersetsProgrammeByUtilisateur = (idUtilisateur) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = 'SELECT * FROM verset_programme WHERE idUtilisateur = ? ORDER BY dateAffichage ASC';
            const versets = yield (0, db_1._selectSql)(sql, [idUtilisateur]);
            resolve(versets);
        }
        catch (error) {
            reject(error);
        }
    }));
};
exports.default = {
    ajouterVersetProgramme,
    modifierVersetProgramme,
    supprimerVersetProgramme,
    recupVersetsProgrammeByUtilisateur,
};
//# sourceMappingURL=functions.js.map