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
const fs_1 = __importDefault(require("fs"));
const db_1 = require("../../db");
const functions_1 = require("../functions");
const normalizeDuplicatePhone = (value) => String(value !== null && value !== void 0 ? value : '').replace(/\D/g, '');
const normalizeDuplicateBirthDate = (value) => {
    const raw = String(value !== null && value !== void 0 ? value : '').trim();
    if (!raw)
        return '';
    if (/^\d{4}-\d{2}-\d{2}/.test(raw))
        return raw.slice(0, 10);
    const frenchMatch = raw.match(/^(\d{2})[/-](\d{2})[/-](\d{4})$/);
    if (frenchMatch) {
        return `${frenchMatch[3]}-${frenchMatch[2]}-${frenchMatch[1]}`;
    }
    const parsed = new Date(raw);
    if (Number.isNaN(parsed.getTime()))
        return raw;
    return parsed.toISOString().slice(0, 10);
};
const recupMembreDoublon = (idUtilisateur, contactMembre, dateNaissMembre, ignoredMemberId) => __awaiter(void 0, void 0, void 0, function* () {
    const normalizedPhone = normalizeDuplicatePhone(contactMembre);
    const normalizedBirthDate = normalizeDuplicateBirthDate(dateNaissMembre);
    if (!idUtilisateur || !normalizedPhone || !normalizedBirthDate) {
        return null;
    }
    const params = [idUtilisateur, normalizedPhone, normalizedBirthDate];
    let sql = `
    SELECT *
    FROM membre
    WHERE idUtilisateur = ?
      AND REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(IFNULL(contactMembre, ''), ' ', ''), '-', ''), '.', ''), '/', ''), '+', ''), '(', ''), ')', '') = ?
      AND substr(IFNULL(dateNaissMembre, ''), 1, 10) = ?
  `;
    if (ignoredMemberId) {
        sql += ' AND idMembre <> ?';
        params.push(ignoredMemberId);
    }
    sql += ' LIMIT 1';
    const rows = yield (0, db_1._selectSql)(sql, params);
    return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
});
const ajouterMembre = (data) => {
    var _a, _b;
    const values = [
        data.nomMembre || '',
        data.prenomMembre || '',
        data.dateNaissMembre || null,
        data.lieuNaissMembre || '',
        data.sexeMembre || null,
        data.emailMembre || '',
        data.nationaliteMembre || '',
        data.fonctionMembre || '',
        data.contactMembre || '',
        data.ethnieMembre || '',
        data.residenceMembre || '',
        data.civiliteMembre || '',
        data.nouvelleAmeMembre || null,
        data.dateConversionMembre || null,
        data.baptemeEauMembre || null,
        data.dateBaptemeMembre || null,
        data.dateMariageMembre || null,
        data.capaciteSpirituelleMembre || null,
        data.situationMatrimonialeMembre || null,
        data.nomFiance || '',
        data.photoMembre || '',
        data.lieuBaptemeEauMembre || '',
        data.baptemeSaintEspritMembre || null,
        data.dateBaptemeSaintEspritMembre || null,
        data.egliseOrigineMembre || '',
        data.nomAmiEglise || '',
        data.visiteMembre || null,
        data.raisonNonVisiteMembre || '',
        data.heureVisiteMembre || '',
        data.dateDecisionMembre || null,
        data.lieuTravailMembre || '',
        data.idNiveauEtude || null,
        data.idCellule || null,
        data.idDepartement || null,
        data.idGroupe || null,
        data.idResponsabilite || null,
        (_a = data.estDecede) !== null && _a !== void 0 ? _a : 0,
        (_b = data.dateDecesMembre) !== null && _b !== void 0 ? _b : null,
        data.idUtilisateur || null,
    ];
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const doublon = yield recupMembreDoublon(data.idUtilisateur, data.contactMembre, data.dateNaissMembre);
            if (doublon) {
                reject(new Error('Ce membre a deja ete enregistre.'));
                return;
            }
            let fileName = null;
            if (data.photoMembre && data.photoMembre.trim() !== '' && data.photoMembre.startsWith('data:image/')) {
                const base64Data = data.photoMembre.replace(/^data:image\/\w+;base64,/, '');
                fileName = `temp_${Date.now()}.jpg`;
                const filePath = (0, functions_1.getAvatarsPath)(fileName);
                yield (0, functions_1.saveFileToBase64)(filePath, base64Data);
                values[20] = fileName;
            }
            const sql = `INSERT INTO membre(
        nomMembre,
        prenomMembre,
        dateNaissMembre,
        lieuNaissMembre,
        sexeMembre,
        emailMembre,
        nationaliteMembre,
        fonctionMembre,
        contactMembre,
        ethnieMembre,
        residenceMembre,
        civiliteMembre,
        nouvelleAmeMembre,
        dateConversionMembre,
        baptemeEauMembre,
        dateBaptemeMembre,
        dateMariageMembre,
        capaciteSpirituelleMembre,
        situationMatrimonialeMembre,
        nomFiance,
        photoMembre,
        lieuBaptemeEauMembre,
        baptemeSaintEspritMembre,
        dateBaptemeSaintEspritMembre,
        egliseOrigineMembre,
        nomAmiEglise,
        visiteMembre,
        raisonNonVisiteMembre,
        heureVisiteMembre,
        dateDecisionMembre,
        lieuTravailMembre,
        idNiveauEtude,
        idCellule,
        idDepartement,
        idGroupe,
        idResponsabilite,
        estDecede,
        dateDecesMembre,
        idUtilisateur
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
            const membreInserted = yield (0, db_1._executeSql)(sql, values);
            const insertedId = membreInserted.insertId;
            if (fileName && fileName.startsWith('temp_') && insertedId) {
                try {
                    const oldPath = (0, functions_1.getAvatarsPath)(fileName);
                    const newFileName = `membre_${insertedId}.jpg`;
                    const newPath = (0, functions_1.getAvatarsPath)(newFileName);
                    if (fs_1.default.existsSync(oldPath)) {
                        fs_1.default.renameSync(oldPath, newPath);
                        yield (0, db_1._executeSql)('UPDATE membre SET photoMembre = ? WHERE idMembre = ?', [newFileName, insertedId]);
                    }
                }
                catch (renameError) {
                    console.error('Erreur lors du renommage:', renameError);
                }
            }
            const membre = yield recupMembreById(insertedId);
            resolve(membre[0]);
        }
        catch (error) {
            console.error('Erreur dans ajouterMembre:', error);
            reject(error);
        }
    }));
};
const recupMembre = () => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = 'SELECT * FROM membre WHERE COALESCE(estDecede, 0) <> 1 ORDER BY idMembre ASC;';
            const membre = yield (0, db_1._selectSql)(sql, []);
            if (!membre.length)
                return reject({ name: 'Erreur_membre', message: 'Aucun membre trouve' });
            resolve(membre);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const recupMembreById = (id) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = 'SELECT * FROM membre WHERE idMembre = ?;';
            const membre = yield (0, db_1._selectSql)(sql, [id]);
            if (!membre.length)
                return reject({ name: 'Erreur_membre', message: 'Aucun membre trouve' });
            resolve(membre);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const recupMembreByIdUtilsateur = (idUtilisateur) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = 'SELECT * FROM membre WHERE idUtilisateur = ? AND COALESCE(estDecede, 0) <> 1;';
            const membre = yield (0, db_1._selectSql)(sql, [idUtilisateur]);
            if (!membre.length)
                return reject({ name: 'Erreur_membre', message: 'Aucun membre trouve' });
            resolve(membre);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const supprimerMembre = (idMembre, idUtilisateur) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = idUtilisateur
                ? 'DELETE FROM membre WHERE idMembre = ? AND idUtilisateur = ?'
                : 'DELETE FROM membre WHERE idMembre = ?';
            const result = yield (0, db_1._executeSql)(sql, idUtilisateur ? [idMembre, idUtilisateur] : [idMembre]);
            resolve(Boolean(result === null || result === void 0 ? void 0 : result.affectedRows));
        }
        catch (error) {
            reject(error);
        }
    }));
};
const modifierMembre = (data) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        try {
            const doublon = yield recupMembreDoublon(data.idUtilisateur, data.contactMembre, data.dateNaissMembre, data.idMembre);
            if (doublon) {
                reject(new Error('Ce membre a deja ete enregistre.'));
                return;
            }
            const sql = `UPDATE membre SET
        nomMembre = ?,
        prenomMembre = ?,
        dateNaissMembre = ?,
        lieuNaissMembre = ?,
        sexeMembre = ?,
        emailMembre = ?,
        nationaliteMembre = ?,
        fonctionMembre = ?,
        contactMembre = ?,
        ethnieMembre = ?,
        residenceMembre = ?,
        civiliteMembre = ?,
        nouvelleAmeMembre = ?,
        dateConversionMembre = ?,
        baptemeEauMembre = ?,
        dateBaptemeMembre = ?,
        dateMariageMembre = ?,
        capaciteSpirituelleMembre = ?,
        situationMatrimonialeMembre = ?,
        nomFiance = ?,
        photoMembre = ?,
        lieuBaptemeEauMembre = ?,
        baptemeSaintEspritMembre = ?,
        dateBaptemeSaintEspritMembre = ?,
        egliseOrigineMembre = ?,
        nomAmiEglise = ?,
        visiteMembre = ?,
        raisonNonVisiteMembre = ?,
        heureVisiteMembre = ?,
        dateDecisionMembre = ?,
        lieuTravailMembre = ?,
        idNiveauEtude = ?,
        idCellule = ?,
        idDepartement = ?,
        idGroupe = ?,
        idResponsabilite = ?,
        estDecede = ?,
        dateDecesMembre = ?,
        idUtilisateur = ?
        WHERE idMembre = ? AND idUtilisateur = ?`;
            yield (0, db_1._executeSql)(sql, [
                data.nomMembre,
                data.prenomMembre,
                data.dateNaissMembre,
                data.lieuNaissMembre,
                data.sexeMembre,
                data.emailMembre,
                data.nationaliteMembre,
                data.fonctionMembre,
                data.contactMembre,
                data.ethnieMembre,
                data.residenceMembre,
                data.civiliteMembre,
                data.nouvelleAmeMembre,
                data.dateConversionMembre,
                data.baptemeEauMembre,
                data.dateBaptemeMembre,
                data.dateMariageMembre,
                data.capaciteSpirituelleMembre,
                data.situationMatrimonialeMembre,
                data.nomFiance,
                data.photoMembre,
                data.lieuBaptemeEauMembre,
                data.baptemeSaintEspritMembre,
                data.dateBaptemeSaintEspritMembre,
                data.egliseOrigineMembre,
                data.nomAmiEglise,
                data.visiteMembre,
                data.raisonNonVisiteMembre,
                data.heureVisiteMembre,
                data.dateDecisionMembre,
                data.lieuTravailMembre,
                data.idNiveauEtude,
                data.idCellule,
                data.idDepartement,
                data.idGroupe,
                data.idResponsabilite,
                (_a = data.estDecede) !== null && _a !== void 0 ? _a : 0,
                (_b = data.dateDecesMembre) !== null && _b !== void 0 ? _b : null,
                data.idUtilisateur,
                data.idMembre,
                data.idUtilisateur,
            ]);
            resolve(true);
        }
        catch (error) {
            reject(error);
        }
    }));
};
exports.default = {
    recupMembre,
    ajouterMembre,
    supprimerMembre,
    modifierMembre,
    recupMembreById,
    recupMembreByIdUtilsateur,
};
//# sourceMappingURL=functions.js.map