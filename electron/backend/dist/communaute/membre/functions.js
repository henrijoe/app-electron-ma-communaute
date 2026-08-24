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
const functions_2 = __importDefault(require("../utlisateur/functions"));
// Regarde le reglage "validerInscriptionMembre" de l'eglise : true (par defaut)
// si les demandes QR code doivent d'abord etre validees par un responsable,
// false si elles doivent devenir des membres directement, sans validation
// (utile pour les eglises avec beaucoup de monde ou personne n'a le temps
// de valider chaque demande une par une).
const doitValiderInscription = (idUtilisateur) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const utilisateurs = yield functions_2.default.recupUtilisateurById(idUtilisateur);
        const utilisateur = Array.isArray(utilisateurs) ? utilisateurs[0] : null;
        return Number(utilisateur === null || utilisateur === void 0 ? void 0 : utilisateur.validerInscriptionMembre) !== 0;
    }
    catch (error) {
        // Par prudence, si on ne peut pas lire le reglage, on garde le comportement
        // historique (validation obligatoire) plutot que de tout ajouter en aveugle.
        return true;
    }
});
const normalizeDuplicatePhone = (value) => String(value !== null && value !== void 0 ? value : '').replace(/\D/g, '');
const normalizeDuplicateName = (value) => String(value !== null && value !== void 0 ? value : '').trim().toLowerCase().replace(/\s+/g, ' ');
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
const recupMembreDoublonByIdentity = (idUtilisateur, nomMembre, prenomMembre, contactMembre, ignoredMemberId) => __awaiter(void 0, void 0, void 0, function* () {
    const normalizedPhone = normalizeDuplicatePhone(contactMembre);
    const normalizedNom = normalizeDuplicateName(nomMembre);
    const normalizedPrenom = normalizeDuplicateName(prenomMembre);
    if (!idUtilisateur || !normalizedPhone || !normalizedNom) {
        return null;
    }
    const params = [idUtilisateur, normalizedPhone, normalizedNom, normalizedPrenom];
    let sql = `
    SELECT *
    FROM membre
    WHERE idUtilisateur = ?
      AND REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(IFNULL(contactMembre, ''), ' ', ''), '-', ''), '.', ''), '/', ''), '+', ''), '(', ''), ')', '') = ?
      AND LOWER(TRIM(IFNULL(nomMembre, ''))) = ?
      AND LOWER(TRIM(IFNULL(prenomMembre, ''))) = ?
  `;
    if (ignoredMemberId) {
        sql += ' AND idMembre <> ?';
        params.push(ignoredMemberId);
    }
    sql += ' LIMIT 1';
    const rows = yield (0, db_1._selectSql)(sql, params);
    return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
});
const recupDemandeInscriptionDoublon = (idUtilisateur, nomMembre, prenomMembre, contactMembre) => __awaiter(void 0, void 0, void 0, function* () {
    const normalizedPhone = normalizeDuplicatePhone(contactMembre);
    const normalizedNom = normalizeDuplicateName(nomMembre);
    const normalizedPrenom = normalizeDuplicateName(prenomMembre);
    if (!idUtilisateur || !normalizedPhone || !normalizedNom) {
        return null;
    }
    const sql = `
    SELECT *
    FROM membre_inscription_demande
    WHERE idUtilisateur = ?
      AND statutDemande = 'en_attente'
      AND REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(IFNULL(contactMembre, ''), ' ', ''), '-', ''), '.', ''), '/', ''), '+', ''), '(', ''), ')', '') = ?
      AND LOWER(TRIM(IFNULL(nomMembre, ''))) = ?
      AND LOWER(TRIM(IFNULL(prenomMembre, ''))) = ?
    LIMIT 1
  `;
    const rows = yield (0, db_1._selectSql)(sql, [idUtilisateur, normalizedPhone, normalizedNom, normalizedPrenom]);
    return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
});
const normalizeDemandeInscriptionMembre = (demande) => {
    let payload = {};
    try {
        payload = JSON.parse(demande.payloadDemande || '{}');
    }
    catch (_error) {
        payload = {};
    }
    return Object.assign(Object.assign({}, demande), { payloadDemande: payload });
};
const recupDemandeInscriptionMembreById = (idDemandeInscription) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = 'SELECT * FROM membre_inscription_demande WHERE idDemandeInscription = ?;';
            const demandes = yield (0, db_1._selectSql)(sql, [idDemandeInscription]);
            if (!demandes.length)
                return reject({ name: 'Erreur_demande_inscription', message: "Aucune demande d'inscription trouvee" });
            resolve(demandes.map(normalizeDemandeInscriptionMembre));
        }
        catch (error) {
            reject(error);
        }
    }));
};
const recupDemandesInscriptionMembreByUtilisateur = (idUtilisateur) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = `SELECT *
        FROM membre_inscription_demande
        WHERE idUtilisateur = ? AND statutDemande = 'en_attente'
        ORDER BY idDemandeInscription DESC;`;
            const demandes = yield (0, db_1._selectSql)(sql, [idUtilisateur]);
            resolve(demandes.map(normalizeDemandeInscriptionMembre));
        }
        catch (error) {
            reject(error);
        }
    }));
};
const ajouterDemandeInscriptionMembre = (data) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const payload = Object.assign(Object.assign({}, data), { idUtilisateur: Number(data.idUtilisateur) || null });
            if (!payload.idUtilisateur) {
                reject(new Error("Lien d'inscription incomplet."));
                return;
            }
            if (!String(payload.nomMembre || '').trim()) {
                reject(new Error('Le nom du membre est requis.'));
                return;
            }
            if (!String(payload.contactMembre || '').trim()) {
                reject(new Error('Le telephone du membre est requis.'));
                return;
            }
            const doublonMembre = yield recupMembreDoublonByIdentity(payload.idUtilisateur, payload.nomMembre, payload.prenomMembre, payload.contactMembre);
            if (doublonMembre) {
                reject(new Error('Ce membre est deja enregistre dans la communaute.'));
                return;
            }
            const doublonDemande = yield recupDemandeInscriptionDoublon(payload.idUtilisateur, payload.nomMembre, payload.prenomMembre, payload.contactMembre);
            if (doublonDemande) {
                reject(new Error("Une demande d'inscription est deja en attente pour ce membre."));
                return;
            }
            // Selon le reglage de l'eglise (Parametres > "Validation des inscriptions"),
            // soit on cree tout de suite le membre (grande eglise, pas le temps de tout
            // valider), soit on garde le comportement historique : la demande attend
            // qu'un responsable clique "Valider et ajouter".
            const validationRequise = yield doitValiderInscription(payload.idUtilisateur);
            const statutDemande = validationRequise ? 'en_attente' : 'validee';
            const sql = `INSERT INTO membre_inscription_demande(
        idUtilisateur,
        nomMembre,
        prenomMembre,
        contactMembre,
        payloadDemande,
        statutDemande
      ) VALUES (?,?,?,?,?,?)`;
            const result = yield (0, db_1._executeSql)(sql, [
                payload.idUtilisateur,
                payload.nomMembre || '',
                payload.prenomMembre || '',
                payload.contactMembre || '',
                JSON.stringify(payload),
                statutDemande,
            ]);
            const insertedId = result.insertId;
            if (!validationRequise) {
                // Validation automatique : on cree directement le membre (avec la
                // meme verification anti-doublon que l'ajout manuel) et on marque
                // la demande comme deja traitee, pour garder une trace.
                const membreCree = yield ajouterMembre(Object.assign(Object.assign({}, payload), { idUtilisateur: payload.idUtilisateur }));
                yield (0, db_1._executeSql)(`UPDATE membre_inscription_demande
          SET idMembreCree = ?, dateTraitement = CURRENT_TIMESTAMP
          WHERE idDemandeInscription = ?`, [membreCree.idMembre, insertedId]);
            }
            const demande = yield recupDemandeInscriptionMembreById(insertedId);
            resolve(demande[0]);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const validerDemandeInscriptionMembre = (idDemandeInscription, idUtilisateur) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const demandes = yield recupDemandeInscriptionMembreById(idDemandeInscription);
            const demande = demandes[0];
            if (Number(demande.idUtilisateur) !== Number(idUtilisateur)) {
                reject(new Error("Cette demande ne correspond pas a l'eglise connectee."));
                return;
            }
            if (demande.statutDemande !== 'en_attente') {
                reject(new Error('Cette demande a deja ete traitee.'));
                return;
            }
            const membreCree = yield ajouterMembre(Object.assign(Object.assign({}, demande.payloadDemande), { idUtilisateur }));
            yield (0, db_1._executeSql)(`UPDATE membre_inscription_demande
        SET statutDemande = 'validee', idMembreCree = ?, dateTraitement = CURRENT_TIMESTAMP
        WHERE idDemandeInscription = ? AND idUtilisateur = ?`, [
                membreCree.idMembre,
                idDemandeInscription,
                idUtilisateur,
            ]);
            resolve(membreCree);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const rejeterDemandeInscriptionMembre = (idDemandeInscription, idUtilisateur) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = `UPDATE membre_inscription_demande
        SET statutDemande = 'rejetee', dateTraitement = CURRENT_TIMESTAMP
        WHERE idDemandeInscription = ? AND idUtilisateur = ? AND statutDemande = 'en_attente'`;
            const result = yield (0, db_1._executeSql)(sql, [idDemandeInscription, idUtilisateur]);
            resolve(Boolean(result === null || result === void 0 ? void 0 : result.affectedRows));
        }
        catch (error) {
            reject(error);
        }
    }));
};
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
            const doublon = (yield recupMembreDoublon(data.idUtilisateur, data.contactMembre, data.dateNaissMembre))
                || (yield recupMembreDoublonByIdentity(data.idUtilisateur, data.nomMembre, data.prenomMembre, data.contactMembre));
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
            const doublon = (yield recupMembreDoublon(data.idUtilisateur, data.contactMembre, data.dateNaissMembre, data.idMembre)) || (yield recupMembreDoublonByIdentity(data.idUtilisateur, data.nomMembre, data.prenomMembre, data.contactMembre, data.idMembre));
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
    ajouterDemandeInscriptionMembre,
    recupDemandesInscriptionMembreByUtilisateur,
    validerDemandeInscriptionMembre,
    rejeterDemandeInscriptionMembre,
};
//# sourceMappingURL=functions.js.map