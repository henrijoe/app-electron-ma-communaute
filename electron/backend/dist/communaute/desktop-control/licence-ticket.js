"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifierCodeSigne = exports.estCodeSigne = exports.numeroMachineDepuisEmpreinte = void 0;
const crypto_1 = __importDefault(require("crypto"));
// Codes d'activation signés.
//
// Le client envoie le numéro de son ordinateur, et le générateur (tenu hors de ce
// dépôt) signe un code pour ce numéro avec une clé privée. L'application n'embarque
// que la clé publique : elle sait vérifier un code, pas en fabriquer un, et tout se
// passe sans internet.
//
// Le numéro de l'ordinateur n'est pas écrit dans le code : il entre seulement dans ce
// qui est signé. Sur une autre machine, la signature ne correspond donc plus.
//
// Le format doit rester identique à celui de generateur-licences/generateur.cjs.
const CLE_PUBLIQUE = crypto_1.default.createPublicKey({
    key: Buffer.from("MCowBQYDK2VwAyEAh5ugvPdIfMzlJ8FcNm+IR5rOcl1Nlyl6dc/fKQEwd1U=", "base64"),
    format: "der",
    type: "spki",
});
// Base 32 sans I, L, O ni U : ces lettres se confondent quand un code est recopié.
const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
const PREFIXE = "MC2";
const VERSION = 1;
const LONGUEUR_ENTETE = 7; // version (1) + identifiant (4) + durée en jours (2)
const LONGUEUR_SIGNATURE = 64;
const LONGUEUR_NUMERO = 12;
const versBase32 = (octets) => {
    let bits = 0;
    let valeur = 0;
    let sortie = "";
    for (const octet of octets) {
        valeur = (valeur << 8) | octet;
        bits += 8;
        while (bits >= 5) {
            sortie += ALPHABET[(valeur >>> (bits - 5)) & 31];
            bits -= 5;
        }
        valeur &= (1 << bits) - 1;
    }
    if (bits > 0) {
        sortie += ALPHABET[(valeur << (5 - bits)) & 31];
    }
    return sortie;
};
const depuisBase32 = (texte) => {
    const octets = [];
    let bits = 0;
    let valeur = 0;
    for (const caractere of texte) {
        const position = ALPHABET.indexOf(caractere);
        if (position < 0) {
            return null;
        }
        valeur = (valeur << 5) | position;
        bits += 5;
        if (bits >= 8) {
            octets.push((valeur >>> (bits - 8)) & 255);
            bits -= 8;
        }
        valeur &= (1 << bits) - 1;
    }
    return Buffer.from(octets);
};
/** Tolère ce qu'une copie par WhatsApp ou une saisie peut changer : espaces, casse, O pour 0. */
const normaliser = (valeur) => String(valeur || "")
    .toUpperCase()
    .replace(/[^0-9A-Z]/g, "")
    .replace(/O/g, "0")
    .replace(/[IL]/g, "1");
/** Le numéro à envoyer pour recevoir un code, tiré de l'empreinte de la machine. */
const numeroMachineDepuisEmpreinte = (empreinte) => versBase32(crypto_1.default.createHash("sha256").update(`numero-machine|${empreinte}`).digest())
    .slice(0, LONGUEUR_NUMERO)
    .replace(/(.{4})(?=.)/g, "$1-");
exports.numeroMachineDepuisEmpreinte = numeroMachineDepuisEmpreinte;
/** Distingue un code signé des anciens codes de forfait « MC-XXXX-… ». */
const estCodeSigne = (code) => /^\s*MC2\b/i.test(String(code || ""));
exports.estCodeSigne = estCodeSigne;
/** Renvoie le contenu du code s'il a bien été signé pour cet ordinateur, sinon null. */
const verifierCodeSigne = (code, numeroMachine) => {
    const propre = normaliser(code);
    if (!propre.startsWith(PREFIXE)) {
        return null;
    }
    const octets = depuisBase32(propre.slice(PREFIXE.length));
    if (!octets || octets.length !== LONGUEUR_ENTETE + LONGUEUR_SIGNATURE || octets[0] !== VERSION) {
        return null;
    }
    const id = octets.subarray(1, 5).toString("hex");
    const jours = octets.readUInt16BE(5);
    const signature = octets.subarray(LONGUEUR_ENTETE);
    const message = Buffer.from(`MC-TICKET-V${VERSION}|${normaliser(numeroMachine)}|${id}|${jours}`);
    if (jours < 1 || !crypto_1.default.verify(null, message, CLE_PUBLIQUE, signature)) {
        return null;
    }
    return { id, jours };
};
exports.verifierCodeSigne = verifierCodeSigne;
//# sourceMappingURL=licence-ticket.js.map