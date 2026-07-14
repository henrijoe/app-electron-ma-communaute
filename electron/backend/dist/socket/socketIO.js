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
exports.initializeSocket = void 0;
const initializeSocket = (io, cnxInfos) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            io.on("connection", (socket) => __awaiter(void 0, void 0, void 0, function* () {
                /**
                 * Toutes les applications qui vont se connecter au serveur
                 * doivent fournir un objet contenant des informations sur
                 * le device, l'application, l'utilisateur... lors de  l'initialisation
                 * de leur socket.io-client.
                 * Ces informations sont récupérée ici avec socket.handshake.query
                 */
                const socketCnxInfos = Object.assign(Object.assign({}, cnxInfos), { socketID: socket.id });
                io.to(socket.id).emit("connected", socketCnxInfos);
                console.log("Socket ~ connected----");
                socket.on('disconnect', () => {
                    console.log("SOCKET DISONNCET+++");
                });
            }));
            resolve(true);
        }
        catch (error) {
            console.log("🚀 ~ returnnewPromise<boolean> ~ error:", error);
            reject(error);
        }
    }));
};
exports.initializeSocket = initializeSocket;
//# sourceMappingURL=socketIO.js.map