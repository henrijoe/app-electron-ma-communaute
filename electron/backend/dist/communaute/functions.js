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
exports.sanitizeStorageName = exports.getGalerieEventDirectory = exports.getGalerieMediaRootDirectory = exports.getChurchLogosDirectory = exports.getMemberPhotosDirectory = exports.saveFileToBase64 = exports.getFileToBase64 = exports.getChurchLogoPath = exports.getAvatarsPath = exports.errorMsg = exports.msg = exports.isProd = void 0;
const path_1 = __importDefault(require("path"));
const sqliteDB_1 = __importDefault(require("../db/sqliteDB"));
// import * as sharp from 'sharp';
require('dotenv').config();
exports.isProd = process.env.NODE_ENV === 'production'
    ? true
    : false;
exports.msg = { name: "ERROR_OCCURED", message: "Une erreur est survenue." };
function hasOnlyProperties(obj, properties) {
    return Object.keys(obj).length === properties.length &&
        properties.every(prop => Object.keys(obj).includes(prop));
}
const errorMsg = (response) => {
    const error = { error: response };
    if (error.hasOwnProperty("error") && hasOnlyProperties(error.error, ['name', 'message']))
        return error.error;
    return (exports.isProd ? exports.msg : error);
};
exports.errorMsg = errorMsg;
const fs = require("fs");
// const sharp = require("sharp");
const _ = require("lodash");
const getMemberPhotosDirectory = () => {
    const memberPhotosDir = path_1.default.join(sqliteDB_1.default.getSqliteDirectory(), 'photo-membre');
    if (!fs.existsSync(memberPhotosDir)) {
        fs.mkdirSync(memberPhotosDir, { recursive: true });
    }
    return memberPhotosDir;
};
exports.getMemberPhotosDirectory = getMemberPhotosDirectory;
const getChurchLogosDirectory = () => {
    const churchLogosDir = path_1.default.join(sqliteDB_1.default.getSqliteDirectory(), 'logo-eglise');
    if (!fs.existsSync(churchLogosDir)) {
        fs.mkdirSync(churchLogosDir, { recursive: true });
    }
    return churchLogosDir;
};
exports.getChurchLogosDirectory = getChurchLogosDirectory;
const getGalerieMediaRootDirectory = () => {
    const galerieDir = path_1.default.join(sqliteDB_1.default.getSqliteDirectory(), 'galerie-evenements');
    if (!fs.existsSync(galerieDir)) {
        fs.mkdirSync(galerieDir, { recursive: true });
    }
    return galerieDir;
};
exports.getGalerieMediaRootDirectory = getGalerieMediaRootDirectory;
const sanitizeStorageName = (value) => (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, ' ')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
exports.sanitizeStorageName = sanitizeStorageName;
const getGalerieEventDirectory = (folderName) => {
    const safeFolderName = sanitizeStorageName(folderName) || `evenement-${Date.now()}`;
    const galleryDir = path_1.default.join(getGalerieMediaRootDirectory(), safeFolderName);
    if (!fs.existsSync(galleryDir)) {
        fs.mkdirSync(galleryDir, { recursive: true });
    }
    return galleryDir;
};
exports.getGalerieEventDirectory = getGalerieEventDirectory;
const getAvatarsPath = (fileNameOrId) => {
    const fileName = typeof fileNameOrId === 'number'
        ? `${fileNameOrId}_avatar.jpg`
        : fileNameOrId;
    return path_1.default.join(getMemberPhotosDirectory(), fileName);
};
exports.getAvatarsPath = getAvatarsPath;
const getChurchLogoPath = (fileNameOrId) => {
    const fileName = typeof fileNameOrId === 'number'
        ? `eglise_${fileNameOrId}.jpg`
        : fileNameOrId;
    return path_1.default.join(getChurchLogosDirectory(), fileName);
};
exports.getChurchLogoPath = getChurchLogoPath;
// Fonction pour lire un fichier et retourner sa représentation en base64
const getFileToBase64 = (filePath) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const file = filePath;
            if (fs.existsSync(file)) {
                const buffer = fs.readFileSync(file);
                const avatar = buffer.toString('base64');
                resolve(`data:image/${path_1.default.extname(file).substring(1)};base64,${avatar}`);
            }
            else {
                resolve('');
            }
        }
        catch (error) {
            console.log('getFileToBase64.error => ', error.message);
            reject(error);
        }
    }));
};
exports.getFileToBase64 = getFileToBase64;
// Fonction pour enregistrer une chaîne base64 dans un fichier
const saveFileToBase64 = (filePath, fileFromBase64) => {
    if (fileFromBase64 == "")
        return;
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const file = filePath;
            const buffer = Buffer.from(fileFromBase64, "base64");
            const parentDir = path_1.default.dirname(file);
            if (!fs.existsSync(parentDir)) {
                fs.mkdirSync(parentDir, { recursive: true });
            }
            fs.writeFileSync(file, buffer);
            resolve(true);
        }
        catch (error) {
            console.log('saveFileToBase64.error => ', error.message);
            reject(error);
        }
    }));
};
exports.saveFileToBase64 = saveFileToBase64;
//# sourceMappingURL=functions.js.map