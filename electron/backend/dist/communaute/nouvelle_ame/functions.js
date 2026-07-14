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
//   
const ajouterNouvelleAme = (data) => {
    // juste pour la demo
    const values = [
        data.nomNouvelleAme,
        data.prenomNouvelleAme,
        data.dateConversionNouvelleAme,
        data.lieuHabitationNouvelleAme,
        data.fonctionNouvelleAme,
        data.contactNouvelleAme,
        data.sexeNouvelleAme,
        data.emailNouvelleAme,
        data.idEglise,
        data.idCellule,
        data.idDepartement,
        data.idResponsabilite,
        data.idDomaineActivite,
        data.idUtilisateur,
        data.idGroupe
    ];
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = `INSERT INTO nouvelleame(
              nomNouvelleAme,
              prenomNouvelleAme,
              dateConversionNouvelleAme,
              lieuHabitationNouvelleAme,
              fonctionNouvelleAme,
              contactNouvelleAme,
              sexeNouvelleAme,
              emailNouvelleAme,
              idEglise,
              idCellule,
              idDepartement,
              idResponsabilite,
              idDomaineActivite,
              idUtilisateur,
              idGroupe 
              ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
            const nouvelleAmeData = yield (0, db_1._executeSql)(sql, [...values]);
            resolve(nouvelleAmeData.insertId);
        }
        catch (error) {
            reject(error);
        }
    }));
};
/**
 * recuperer les nouvelle_ames
 * @returns
 */
const recupNouvelleAme = () => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = `SELECT * FROM nouvelleame ORDER BY idNouvelleAme ASC ;`;
            const nouvelleAme = yield (0, db_1._selectSql)(sql, []);
            if (!nouvelleAme.length)
                return reject({ name: "Erreur_ame", message: "Aucune ame trouvée pour les paramètres fournis" });
            resolve(nouvelleAme);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const recupNouvelleAmeById = (id) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = `SELECT * FROM nouvelleame WHERE idNouvelleAme = ? ;`;
            const nouvelleAme = yield (0, db_1._selectSql)(sql, [id]);
            if (!nouvelleAme.length)
                return reject({ name: "Erreur_ame", message: "Aucune ame trouvée pour les paramètres fournis" });
            resolve(nouvelleAme);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const supprimerNouvelleAme = (idNouvelleAme) => {
    return new Promise((resolve, reject) => {
        const sql = `DELETE FROM nouvelleame WHERE idNouvelleAme = ?`;
        (0, db_1._executeSql)(sql, [idNouvelleAme])
            .then(() => {
            resolve(true);
        })
            .catch((error) => {
            reject(error);
        });
    });
};
const modifierNouvelleAme = (data) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = `UPDATE nouvelleame SET nomNouvelleAme=?, prenomNouvelleAme=?,dateConversionNouvelleAme=?,
        lieuHabitationNouvelleAme=?,fonctionNouvelleAme=?,contactNouvelleAme=?,sexeNouvelleAme=?,emailNouvelleAme=?,
        idEglise=?,idCellule=?,idDepartement=?,idResponsabilite=?,idDomaineActivite=?,idUtilisateur=?,idGroupe=? 
        WHERE idNouvelleAme=?`;
            yield (0, db_1._executeSql)(sql, [
                data.nomNouvelleAme,
                data.prenomNouvelleAme,
                data.dateConversionNouvelleAme,
                data.lieuHabitationNouvelleAme,
                data.fonctionNouvelleAme,
                data.contactNouvelleAme,
                data.sexeNouvelleAme,
                data.emailNouvelleAme,
                data.idEglise,
                data.idCellule,
                data.idDepartement,
                data.idNouvelleAme,
                data.idResponsabilite,
                data.idDomaineActivite,
                data.idUtilisateur,
                data.idGroupe,
            ]);
            resolve(true);
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
    recupNouvelleAmeById
};
//# sourceMappingURL=functions.js.map