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
exports.reprendreMatricules = exports.attribuerMatricule = exports.prochainMatricule = exports.REGISTRE_ENFANT = exports.REGISTRE_MEMBRE = void 0;
const db_1 = require("../db");
// ----------------------------------------------------------------------
// Matricules des personnes : membres et enfants de l'école du dimanche.
//
// Un nom n'identifie personne. Deux « Kouassi Yao » dans une même paroisse,
// c'est la règle et non l'exception, et les colonnes nom/prénom/contact ne
// suffisent ni à les distinguer ni à les retrouver. Chaque personne reçoit
// donc, à son enregistrement, un numéro qui ne changera plus :
//
//   M2026-000001   un membre, enregistré en 2026
//   E2026-000001   un enfant, enregistré en 2026
//
// La lettre de tête dit de quel registre il s'agit : les deux séries sont
// indépendantes, et sans elle un membre et un enfant porteraient le même
// numéro. L'année donne l'ancienneté à la lecture, sans aller chercher une
// fiche. Les six chiffres couvrent 999 999 enregistrements par an et par
// registre — largement au-delà de ce qu'une église produit, tout en restant
// dictables au téléphone et recopiables à la main sur un formulaire.
//
// L'unicité se joue PAR ÉGLISE (idUtilisateur) : en mode serveur partagé,
// plusieurs églises vivent dans les mêmes tables et numérotent chacune de son
// côté.
/** Longueur de la partie séquentielle. « 000001 », pas « 1 ». */
const CHIFFRES = 6;
exports.REGISTRE_MEMBRE = {
    table: "membre",
    colonne: "matriculeMembre",
    cle: "idMembre",
    prefixe: "M",
};
exports.REGISTRE_ENFANT = {
    table: "ecodim_enfant",
    colonne: "matriculeEnfant",
    cle: "idEnfantEcodim",
    prefixe: "E",
};
/** « E » + 2026 + « - » + 000001. */
const composer = (prefixe, annee, rang) => `${prefixe}${annee}-${String(rang).padStart(CHIFFRES, "0")}`;
/** L'année d'une date ISO, ou rien si la valeur n'en porte pas. */
const anneeDe = (valeur) => {
    const annee = Number(String(valeur || "").slice(0, 4));
    return Number.isInteger(annee) && annee > 1900 && annee < 3000 ? annee : null;
};
/**
 * Le dernier rang attribué à cette église pour cette année.
 *
 * On relit la base plutôt que de tenir un compteur à part : un compteur
 * désynchronisé réattribuerait un matricule déjà donné, et c'est précisément
 * ce que ce numéro doit rendre impossible.
 *
 * `substr(colonne, N)` est écrit pareil en SQLite et en MySQL, et la position
 * de départ se déduit du préfixe : « E2026- » fait six caractères.
 */
const dernierRang = (registre, idUtilisateur, annee) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const debut = `${registre.prefixe}${annee}-`;
    const lignes = yield (0, db_1._selectSql)(`SELECT MAX(CAST(substr(${registre.colonne}, ${debut.length + 1}) AS INTEGER)) AS dernier
       FROM ${registre.table}
      WHERE idUtilisateur = ? AND ${registre.colonne} LIKE ?`, [idUtilisateur, `${debut}%`]);
    const valeur = Array.isArray(lignes) ? (_a = lignes[0]) === null || _a === void 0 ? void 0 : _a.dernier : null;
    return Number(valeur) || 0;
});
/**
 * Le prochain matricule libre pour cette église et cette année.
 *
 * À n'appeler qu'au moment d'écrire la ligne : entre la lecture et l'écriture,
 * rien ne réserve le numéro. Sur un poste local, une seule personne saisit à la
 * fois et le risque est nul ; en mode serveur, deux créations simultanées
 * pourraient viser le même rang — d'où la vérification de `attribuerMatricule`,
 * qui reprend la main si le numéro vient d'être pris.
 */
const prochainMatricule = (registre, idUtilisateur, annee = new Date().getFullYear()) => __awaiter(void 0, void 0, void 0, function* () { return composer(registre.prefixe, annee, (yield dernierRang(registre, idUtilisateur, annee)) + 1); });
exports.prochainMatricule = prochainMatricule;
/**
 * Pose le matricule sur une ligne qui vient d'être créée.
 *
 * L'écriture passe par un UPDATE plutôt que par l'INSERT : la requête
 * d'insertion des membres aligne trente-neuf valeurs positionnelles, et y
 * glisser une colonne de plus est le genre de modification qui décale tout
 * sans qu'aucune erreur ne soit levée.
 *
 * La condition `colonne = ''` rend l'opération rejouable : une ligne qui a
 * déjà son matricule n'en change jamais.
 */
const attribuerMatricule = (registre, idLigne, idUtilisateur, annee = new Date().getFullYear()) => __awaiter(void 0, void 0, void 0, function* () {
    if (!idLigne || !idUtilisateur) {
        return null;
    }
    // Deux tentatives : si une création concurrente a pris le rang entre la
    // lecture et l'écriture, on recalcule une fois. Au-delà, on renonce plutôt
    // que de boucler — la ligne existe, elle recevra son matricule à la reprise.
    for (let essai = 0; essai < 2; essai += 1) {
        const matricule = yield (0, exports.prochainMatricule)(registre, idUtilisateur, annee);
        const deja = yield (0, db_1._selectSql)(`SELECT 1 FROM ${registre.table} WHERE idUtilisateur = ? AND ${registre.colonne} = ? LIMIT 1`, [idUtilisateur, matricule]);
        if (Array.isArray(deja) && deja.length > 0) {
            continue;
        }
        yield (0, db_1._executeSql)(`UPDATE ${registre.table}
          SET ${registre.colonne} = ?
        WHERE ${registre.cle} = ?
          AND idUtilisateur = ?
          AND COALESCE(${registre.colonne}, '') = ''`, [matricule, idLigne, idUtilisateur]);
        return matricule;
    }
    return null;
});
exports.attribuerMatricule = attribuerMatricule;
/**
 * Donne un matricule aux lignes enregistrées avant que ce numéro n'existe.
 *
 * Appelée en tête de la lecture des listes, sur le modèle de
 * `reprendreRattachementsAnciens` : une base déjà remplie se met à jour au
 * premier affichage, sans migration à lancer à la main.
 *
 * L'ordre suit la clé primaire, c'est-à-dire l'ordre d'enregistrement réel.
 * L'année retenue est celle de la date fournie par `colonneDate` quand elle
 * existe : un enfant entré en 2024 garde 2024, sinon son matricule mentirait
 * sur son ancienneté. Faute de date — la table `membre` n'en porte aucune pour
 * sa création — on retient l'année courante.
 */
const reprendreMatricules = (registre, idUtilisateur, colonnesDate = []) => __awaiter(void 0, void 0, void 0, function* () {
    if (!idUtilisateur) {
        return;
    }
    const champsDate = colonnesDate.length ? `, ${colonnesDate.join(", ")}` : "";
    const aReprendre = yield (0, db_1._selectSql)(`SELECT ${registre.cle} AS id${champsDate}
       FROM ${registre.table}
      WHERE idUtilisateur = ? AND COALESCE(${registre.colonne}, '') = ''
      ORDER BY ${registre.cle} ASC`, [idUtilisateur]);
    const lignes = Array.isArray(aReprendre) ? aReprendre : [];
    if (lignes.length === 0) {
        return;
    }
    const anneeCourante = new Date().getFullYear();
    // Les rangs sont tenus en mémoire le temps de la reprise : relire la base à
    // chaque ligne ferait autant d'allers-retours qu'il y a de personnes.
    const rangs = new Map();
    for (const ligne of lignes) {
        const annee = colonnesDate.map((colonne) => anneeDe(ligne[colonne])).find((valeur) => valeur !== null) ||
            anneeCourante;
        if (!rangs.has(annee)) {
            rangs.set(annee, yield dernierRang(registre, idUtilisateur, annee));
        }
        const rang = (rangs.get(annee) || 0) + 1;
        rangs.set(annee, rang);
        yield (0, db_1._executeSql)(`UPDATE ${registre.table}
          SET ${registre.colonne} = ?
        WHERE ${registre.cle} = ?
          AND idUtilisateur = ?
          AND COALESCE(${registre.colonne}, '') = ''`, [composer(registre.prefixe, annee, rang), ligne.id, idUtilisateur]);
    }
});
exports.reprendreMatricules = reprendreMatricules;
//# sourceMappingURL=matricule.js.map