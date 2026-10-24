"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controllers_1 = __importDefault(require("./controllers"));
const abonnementRouter = express_1.default.Router();
// Souscription et consultation : réservées à un compte authentifié.
abonnementRouter.post("/abonnement/souscrire", controllers_1.default.souscrire);
// Vérification à la demande : indispensable tant qu'aucun webhook n'est joignable
// (test en local), et filet de sécurité ensuite si une notification se perd.
abonnementRouter.get("/abonnement/verifier/:reference", controllers_1.default.verifier);
abonnementRouter.get("/abonnement/etat/:idUtilisateur", controllers_1.default.etat);
// Notification SasPay : appelée par leurs serveurs, donc sans jeton. L'authenticité
// est établie par la signature HMAC, pas par l'authentification applicative.
abonnementRouter.post("/abonnement/webhook", controllers_1.default.webhook);
exports.default = abonnementRouter;
//# sourceMappingURL=routes.js.map