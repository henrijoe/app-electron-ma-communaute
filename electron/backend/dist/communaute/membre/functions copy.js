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
//  ajouter  
const ajouterMembre = (data) => {
    const values = [
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
        data.photoMembre,
        data.lieuBaptemeEauMembre,
        data.baptemeSaintEspritMembre,
        data.dateBaptemeSaintEspritMembre,
        data.egliseOrigineMembre,
        data.idNiveauEtude,
        data.idEglise,
        data.idCellule,
        data.idDepartement,
        data.idGroupe,
        data.idResponsabilite,
        data.idUtilisateur
    ];
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            let photoMembre = (data.photoMembre == "" ? "" : `data:image/jpeg;base64,${data.photoMembre}`);
            const sql = `INSERT INTO 
            membre(nomMembre,
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
                photoMembre,
                lieuBaptemeEauMembre,
                baptemeSaintEspritMembre,
                dateBaptemeSaintEspritMembre,
                egliseOrigineMembre,
                idNiveauEtude,
                idEglise,
                idCellule,
                idDepartement,
                idGroupe,
                idResponsabilite,
                idUtilisateur
                ) 
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
            const membreInserted = yield (0, db_1._executeSql)(sql, [...values]);
            resolve(membreInserted.insertId);
        }
        catch (error) {
            reject(error);
        }
    }));
};
/**
 * recupererer tout les membres
 * @returns
 */
const recupMembre = () => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = `SELECT * FROM membre ORDER BY idMembre ASC ;`;
            const membre = yield (0, db_1._selectSql)(sql, []);
            if (!membre.length)
                return reject({ name: "Erreur_membre", message: "Aucun membre trouvé" });
            resolve(membre);
        }
        catch (error) {
            reject(error);
        }
    }));
};
/**
 * recupererer tout les membres
 * @returns
 */
const recupMembreById = (id) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = `SELECT * FROM membre WHERE idMembre= ?;`;
            const membre = yield (0, db_1._selectSql)(sql, [id]);
            if (!membre.length)
                return reject({ name: "Erreur_membre", message: "Aucun membre trouvé" });
            resolve(membre);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const supprimerMembre = (idMembre) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = `DELETE FROM membre WHERE idMembre = ?`;
            yield (0, db_1._executeSql)(sql, [idMembre]);
            resolve(true);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const modifierMembre = (data) => {
    console.log("🚀 ~ file: functions.ts:131 ~ modifierMembre ~ data:", data);
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = `UPDATE membre SET nomMembre=?,prenomMembre=?,
            dateNaissMembre=?,lieuNaissMembre=?,sexeMembre=?,emailMembre=?,
            nationaliteMembre=?,fonctionMembre=?,contactMembre=?,ethnieMembre=?, 
            residenceMembre=?,civiliteMembre=?,
            nouvelleAmeMembre=?,
            dateConversionMembre=?,baptemeEauMembre=?, 
            dateBaptemeMembre=?,dateMariageMembre=?,capaciteSpirituelleMembre=?, 
            situationMatrimonialeMembre=?,photoMembre=?, 
            lieuBaptemeEauMembre=?,
            baptemeSaintEspritMembre=?, 
            dateBaptemeSaintEspritMembre=?,
            egliseOrigineMembre=?, 
            idNiveauEtude=?,idEglise=?,idCellule=?, 
            idDepartement=?,idGroupe=?,idResponsabilite=?, 
            idUtilisateur=? WHERE idMembre=?`;
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
                data.photoMembre,
                data.lieuBaptemeEauMembre,
                data.baptemeSaintEspritMembre,
                data.dateBaptemeSaintEspritMembre,
                data.egliseOrigineMembre,
                data.idNiveauEtude,
                data.idEglise,
                data.idCellule,
                data.idDepartement,
                data.idGroupe,
                data.idResponsabilite,
                data.idUtilisateur,
                data.idMembre
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
};
//# sourceMappingURL=functions%20copy.js.map