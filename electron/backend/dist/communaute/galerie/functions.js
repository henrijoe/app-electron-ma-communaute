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
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const AdmZip = require("adm-zip");
const db_1 = require("../../db");
const functions_1 = require("../functions");
const buildEventFolderName = (idGalerie, titreGalerie, dateEvenement) => {
    const safeTitle = (0, functions_1.sanitizeStorageName)(titreGalerie || `evenement-${idGalerie}`);
    const safeDate = (0, functions_1.sanitizeStorageName)(dateEvenement || new Date().toISOString().slice(0, 10));
    return `${idGalerie}-${safeDate}-${safeTitle}`;
};
const ensureSafeGalleryPath = (candidatePath) => {
    const rootPath = path_1.default.resolve((0, functions_1.getGalerieMediaRootDirectory)());
    const resolvedPath = path_1.default.resolve(candidatePath);
    if (!resolvedPath.startsWith(rootPath)) {
        throw new Error("Chemin galerie invalide.");
    }
    return resolvedPath;
};
const getGalerieById = (idGalerie) => __awaiter(void 0, void 0, void 0, function* () {
    const sql = `
    SELECT g.*, COUNT(gi.idGalerieImage) AS nombreImages
    FROM galerie g
    LEFT JOIN galerie_image gi ON gi.idGalerie = g.idGalerie
    WHERE g.idGalerie = ?
    GROUP BY g.idGalerie
  `;
    const result = yield (0, db_1._selectSql)(sql, [idGalerie]);
    return result.length > 0 ? result[0] : null;
});
const getGalerieImageById = (idGalerieImage) => __awaiter(void 0, void 0, void 0, function* () {
    const sql = `SELECT * FROM galerie_image WHERE idGalerieImage = ?`;
    const result = yield (0, db_1._selectSql)(sql, [idGalerieImage]);
    return result.length > 0 ? result[0] : null;
});
const ajouterGalerie = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const values = [
        data.titreGalerie,
        data.typeEvenement,
        data.dateEvenement || null,
        data.lieuEvenement || "",
        data.descriptionGalerie || "",
        "",
        "",
        data.idUtilisateur,
    ];
    const sql = `
    INSERT INTO galerie(
      titreGalerie,
      typeEvenement,
      dateEvenement,
      lieuEvenement,
      descriptionGalerie,
      couvertureGalerie,
      dossierGalerie,
      idUtilisateur
    ) VALUES (?,?,?,?,?,?,?,?)
  `;
    const inserted = yield (0, db_1._executeSql)(sql, values);
    const idGalerie = Number(inserted.insertId);
    const dossierGalerie = buildEventFolderName(idGalerie, data.titreGalerie, data.dateEvenement);
    yield (0, db_1._executeSql)(`UPDATE galerie SET dossierGalerie = ? WHERE idGalerie = ?`, [dossierGalerie, idGalerie]);
    (0, functions_1.getGalerieEventDirectory)(dossierGalerie);
    const galerie = yield getGalerieById(idGalerie);
    if (!galerie) {
        throw new Error("Galerie introuvable apres creation.");
    }
    return galerie;
});
const recupGaleriesByUtilisateur = (idUtilisateur) => __awaiter(void 0, void 0, void 0, function* () {
    const sql = `
    SELECT g.*, COUNT(gi.idGalerieImage) AS nombreImages
    FROM galerie g
    LEFT JOIN galerie_image gi ON gi.idGalerie = g.idGalerie
    WHERE g.idUtilisateur = ?
    GROUP BY g.idGalerie
    ORDER BY COALESCE(g.dateEvenement, g.dateCreation) DESC, g.idGalerie DESC
  `;
    const result = yield (0, db_1._selectSql)(sql, [idUtilisateur]);
    return Array.isArray(result) ? result : [];
});
const modifierGalerie = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const sql = `
    UPDATE galerie
    SET titreGalerie = ?, typeEvenement = ?, dateEvenement = ?, lieuEvenement = ?, descriptionGalerie = ?, idUtilisateur = ?
    WHERE idGalerie = ?
  `;
    yield (0, db_1._executeSql)(sql, [
        data.titreGalerie,
        data.typeEvenement,
        data.dateEvenement || null,
        data.lieuEvenement || "",
        data.descriptionGalerie || "",
        data.idUtilisateur,
        data.idGalerie,
    ]);
    return true;
});
const recupImagesGalerie = (idGalerie) => __awaiter(void 0, void 0, void 0, function* () {
    const sql = `SELECT * FROM galerie_image WHERE idGalerie = ? ORDER BY idGalerieImage DESC`;
    const result = yield (0, db_1._selectSql)(sql, [idGalerie]);
    return Array.isArray(result) ? result : [];
});
const ajouterImagesGalerie = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const galerie = yield getGalerieById(payload.idGalerie);
    if (!galerie) {
        throw new Error("Evenement galerie introuvable.");
    }
    const dossierGalerie = galerie.dossierGalerie || buildEventFolderName(payload.idGalerie, galerie.titreGalerie, galerie.dateEvenement);
    if (!galerie.dossierGalerie) {
        yield (0, db_1._executeSql)(`UPDATE galerie SET dossierGalerie = ? WHERE idGalerie = ?`, [dossierGalerie, payload.idGalerie]);
    }
    const eventDir = (0, functions_1.getGalerieEventDirectory)(dossierGalerie);
    const insertedImages = [];
    for (let index = 0; index < payload.images.length; index += 1) {
        const image = payload.images[index];
        const extension = (image.typeMime || "image/jpeg").split("/")[1] || "jpg";
        const safeBaseName = (0, functions_1.sanitizeStorageName)(path_1.default.parse(image.nomOriginal || `image-${index + 1}`).name) || `image-${index + 1}`;
        const nomFichier = `${Date.now()}-${index + 1}-${safeBaseName}.${extension}`;
        const cheminImage = `${dossierGalerie}/${nomFichier}`.replace(/\\/g, "/");
        const filePath = ensureSafeGalleryPath(path_1.default.join(eventDir, nomFichier));
        const base64Data = image.base64.replace(/^data:image\/\w+;base64,/, "");
        yield (0, functions_1.saveFileToBase64)(filePath, base64Data);
        const insertSql = `
      INSERT INTO galerie_image(
        idGalerie,
        nomFichier,
        cheminImage,
        tailleImage,
        typeMime,
        legendeImage,
        idUtilisateur
      ) VALUES (?,?,?,?,?,?,?)
    `;
        const inserted = yield (0, db_1._executeSql)(insertSql, [
            payload.idGalerie,
            nomFichier,
            cheminImage,
            null,
            image.typeMime || "image/jpeg",
            image.legendeImage || "",
            payload.idUtilisateur,
        ]);
        const currentImage = yield getGalerieImageById(Number(inserted.insertId));
        if (currentImage) {
            insertedImages.push(currentImage);
        }
    }
    if (!galerie.couvertureGalerie && insertedImages.length > 0) {
        yield (0, db_1._executeSql)(`UPDATE galerie SET couvertureGalerie = ? WHERE idGalerie = ?`, [insertedImages[0].cheminImage, payload.idGalerie]);
    }
    return insertedImages;
});
const modifierImageGalerie = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const image = yield getGalerieImageById(payload.idGalerieImage);
    if (!image) {
        throw new Error("Image galerie introuvable.");
    }
    if (typeof payload.idUtilisateur === "number" && Number(image.idUtilisateur) !== Number(payload.idUtilisateur)) {
        throw new Error("Modification non autorisee pour cette image.");
    }
    yield (0, db_1._executeSql)(`UPDATE galerie_image SET legendeImage = ? WHERE idGalerieImage = ?`, [payload.legendeImage || "", payload.idGalerieImage]);
    const updated = yield getGalerieImageById(payload.idGalerieImage);
    if (!updated) {
        throw new Error("Image galerie introuvable apres modification.");
    }
    return updated;
});
const definirCouvertureGalerie = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const galerie = yield getGalerieById(payload.idGalerie);
    if (!galerie) {
        throw new Error("Evenement galerie introuvable.");
    }
    if (typeof payload.idUtilisateur === "number" && Number(galerie.idUtilisateur) !== Number(payload.idUtilisateur)) {
        throw new Error("Modification non autorisee pour cette galerie.");
    }
    const image = yield getGalerieImageById(payload.idGalerieImage);
    if (!image || Number(image.idGalerie) !== Number(payload.idGalerie)) {
        throw new Error("Image de couverture introuvable pour cet evenement.");
    }
    yield (0, db_1._executeSql)(`UPDATE galerie SET couvertureGalerie = ? WHERE idGalerie = ?`, [image.cheminImage, payload.idGalerie]);
    return true;
});
const supprimerImageGalerie = (idGalerieImage, idUtilisateur) => __awaiter(void 0, void 0, void 0, function* () {
    const image = yield getGalerieImageById(idGalerieImage);
    if (!image) {
        return false;
    }
    const galerie = yield getGalerieById(image.idGalerie);
    if (!galerie) {
        throw new Error("Evenement galerie introuvable.");
    }
    if (typeof idUtilisateur === "number" && Number(galerie.idUtilisateur) !== Number(idUtilisateur)) {
        throw new Error("Suppression non autorisee pour cette image.");
    }
    const absolutePath = ensureSafeGalleryPath(path_1.default.join((0, functions_1.getGalerieMediaRootDirectory)(), image.cheminImage));
    if (fs_1.default.existsSync(absolutePath)) {
        fs_1.default.unlinkSync(absolutePath);
    }
    yield (0, db_1._executeSql)(`DELETE FROM galerie_image WHERE idGalerieImage = ?`, [idGalerieImage]);
    if (galerie.couvertureGalerie === image.cheminImage) {
        const remainingImages = yield recupImagesGalerie(image.idGalerie);
        const nextCover = remainingImages.length > 0 ? remainingImages[0].cheminImage : "";
        yield (0, db_1._executeSql)(`UPDATE galerie SET couvertureGalerie = ? WHERE idGalerie = ?`, [nextCover, image.idGalerie]);
    }
    return true;
});
const buildGalerieZip = (idGalerie, idUtilisateur) => __awaiter(void 0, void 0, void 0, function* () {
    const galerie = yield getGalerieById(idGalerie);
    if (!galerie) {
        throw new Error("Evenement galerie introuvable.");
    }
    if (typeof idUtilisateur === "number" && Number(galerie.idUtilisateur) !== Number(idUtilisateur)) {
        throw new Error("Telechargement non autorise pour cet evenement.");
    }
    const eventDir = ensureSafeGalleryPath((0, functions_1.getGalerieEventDirectory)(galerie.dossierGalerie));
    const zip = new AdmZip();
    if (fs_1.default.existsSync(eventDir)) {
        zip.addLocalFolder(eventDir, galerie.dossierGalerie);
    }
    const fileName = `${(0, functions_1.sanitizeStorageName)(galerie.titreGalerie || galerie.dossierGalerie || `galerie-${idGalerie}`)}.zip`;
    const filePath = path_1.default.join(os_1.default.tmpdir(), `${Date.now()}-${fileName}`);
    zip.writeZip(filePath);
    return { filePath, fileName };
});
const supprimerGalerie = (idGalerie, idUtilisateur) => __awaiter(void 0, void 0, void 0, function* () {
    const galerie = yield getGalerieById(idGalerie);
    if (!galerie) {
        return false;
    }
    if (typeof idUtilisateur === "number" && Number(galerie.idUtilisateur) !== Number(idUtilisateur)) {
        throw new Error("Suppression non autorisee pour cet evenement.");
    }
    const eventDir = ensureSafeGalleryPath((0, functions_1.getGalerieEventDirectory)(galerie.dossierGalerie));
    if (fs_1.default.existsSync(eventDir)) {
        fs_1.default.rmSync(eventDir, { force: true, recursive: true });
    }
    yield (0, db_1._executeSql)(`DELETE FROM galerie_image WHERE idGalerie = ?`, [idGalerie]);
    yield (0, db_1._executeSql)(`DELETE FROM galerie WHERE idGalerie = ?`, [idGalerie]);
    return true;
});
exports.default = {
    ajouterGalerie,
    ajouterImagesGalerie,
    buildGalerieZip,
    definirCouvertureGalerie,
    getGalerieById,
    modifierGalerie,
    modifierImageGalerie,
    recupGaleriesByUtilisateur,
    recupImagesGalerie,
    supprimerGalerie,
    supprimerImageGalerie,
};
//# sourceMappingURL=functions.js.map