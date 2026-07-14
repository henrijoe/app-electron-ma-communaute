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
exports.sendSmtpMail = exports.isSmtpConfigured = void 0;
const net = require('net');
const tls = require('tls');
const getSmtpConfig = () => {
    const host = String(process.env.SMTP_HOST || '').trim();
    const user = String(process.env.SMTP_USER || '').trim();
    const password = String(process.env.SMTP_PASSWORD || '').trim();
    const from = String(process.env.SMTP_FROM || user || '').trim();
    const port = Number(process.env.SMTP_PORT || 587);
    const secure = String(process.env.SMTP_SECURE || '').toLowerCase() === 'true' || port === 465;
    if (!host || !user || !password || !from) {
        return null;
    }
    return { host, port, secure, user, password, from };
};
const isSmtpConfigured = () => Boolean(getSmtpConfig());
exports.isSmtpConfigured = isSmtpConfigured;
const waitForResponse = (socket) => new Promise((resolve, reject) => {
    let buffer = '';
    const cleanup = () => {
        socket.off('data', onData);
        socket.off('error', onError);
    };
    const onError = (error) => {
        cleanup();
        reject(error);
    };
    const onData = (chunk) => {
        buffer += chunk.toString('utf8');
        const lines = buffer.split(/\r?\n/).filter(Boolean);
        const lastLine = lines[lines.length - 1] || '';
        if (/^\d{3}\s/.test(lastLine)) {
            cleanup();
            resolve(buffer);
        }
    };
    socket.on('data', onData);
    socket.on('error', onError);
});
const sendCommand = (socket, command, expectedCodes) => __awaiter(void 0, void 0, void 0, function* () {
    socket.write(`${command}\r\n`);
    const response = yield waitForResponse(socket);
    const code = Number(response.slice(0, 3));
    if (!expectedCodes.includes(code)) {
        throw new Error(`Erreur SMTP (${code}): ${response.trim()}`);
    }
    return response;
});
const connectSocket = (config) => new Promise((resolve, reject) => {
    const socket = config.secure
        ? tls.connect(config.port, config.host, { servername: config.host, rejectUnauthorized: false }, () => resolve(socket))
        : net.connect(config.port, config.host, () => resolve(socket));
    socket.once('error', reject);
});
const upgradeToTls = (socket, config) => new Promise((resolve, reject) => {
    const secureSocket = tls.connect({
        socket,
        servername: config.host,
        rejectUnauthorized: false,
    }, () => resolve(secureSocket));
    secureSocket.once('error', reject);
});
const escapeData = (value) => value
    .replace(/\r?\n/g, '\r\n')
    .split('\r\n')
    .map((line) => (line.startsWith('.') ? `.${line}` : line))
    .join('\r\n');
const buildMessage = (config, payload) => {
    const from = config.from;
    const to = payload.to;
    const subject = payload.subject.replace(/\r?\n/g, ' ');
    return [
        `From: ${from}`,
        `To: ${to}`,
        `Subject: ${subject}`,
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=utf-8',
        '',
        payload.text,
    ].join('\r\n');
};
const sendSmtpMail = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const config = getSmtpConfig();
    if (!config) {
        throw new Error('SMTP_NOT_CONFIGURED');
    }
    let socket = yield connectSocket(config);
    try {
        yield waitForResponse(socket);
        yield sendCommand(socket, 'EHLO localhost', [250]);
        if (!config.secure) {
            yield sendCommand(socket, 'STARTTLS', [220]);
            socket = yield upgradeToTls(socket, config);
            yield sendCommand(socket, 'EHLO localhost', [250]);
        }
        yield sendCommand(socket, 'AUTH LOGIN', [334]);
        yield sendCommand(socket, Buffer.from(config.user).toString('base64'), [334]);
        yield sendCommand(socket, Buffer.from(config.password).toString('base64'), [235]);
        yield sendCommand(socket, `MAIL FROM:<${config.from}>`, [250]);
        yield sendCommand(socket, `RCPT TO:<${payload.to}>`, [250, 251]);
        yield sendCommand(socket, 'DATA', [354]);
        socket.write(`${escapeData(buildMessage(config, payload))}\r\n.\r\n`);
        const dataResponse = yield waitForResponse(socket);
        const dataCode = Number(dataResponse.slice(0, 3));
        if (dataCode !== 250) {
            throw new Error(`Erreur SMTP (${dataCode}): ${dataResponse.trim()}`);
        }
        yield sendCommand(socket, 'QUIT', [221]);
    }
    finally {
        socket.end();
    }
});
exports.sendSmtpMail = sendSmtpMail;
//# sourceMappingURL=smtpMailer.js.map