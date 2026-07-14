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
exports.openTunnel = exports.getTunnelStatus = exports.closeTunnel = void 0;
let activeTunnel = null;
let activeStatus = {
    active: false,
    expiresAt: null,
    localPort: null,
    requestedSubdomain: '',
    startedAt: null,
    url: '',
};
let autoCloseTimer = null;
const DEFAULT_TUNNEL_TTL_MINUTES = 120;
const slugify = (value) => String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
const buildTunnelSubdomain = (nomTemple, contactEglise) => {
    const templeSlug = slugify(nomTemple || 'eglise');
    const contactSlug = slugify(contactEglise || 'contact');
    const uniqueSuffix = Math.random().toString(36).slice(2, 7);
    return ['ma-communaute', templeSlug, contactSlug, uniqueSuffix].filter(Boolean).join('-').slice(0, 63);
};
const clearAutoCloseTimer = () => {
    if (autoCloseTimer) {
        clearTimeout(autoCloseTimer);
        autoCloseTimer = null;
    }
};
const resetStatus = () => {
    activeStatus = {
        active: false,
        expiresAt: null,
        localPort: null,
        requestedSubdomain: '',
        startedAt: null,
        url: '',
    };
};
const closeTunnel = () => {
    clearAutoCloseTimer();
    if (activeTunnel) {
        activeTunnel.close();
        activeTunnel = null;
    }
    resetStatus();
};
exports.closeTunnel = closeTunnel;
const getTunnelStatus = () => (Object.assign({}, activeStatus));
exports.getTunnelStatus = getTunnelStatus;
const openTunnel = ({ contactEglise, nomTemple, port, ttlMinutes, }) => __awaiter(void 0, void 0, void 0, function* () {
    const localtunnel = require('localtunnel');
    const requestedSubdomain = buildTunnelSubdomain(nomTemple, contactEglise);
    const ttl = Math.max(10, Number(ttlMinutes || process.env.TUNNEL_TTL_MINUTES || DEFAULT_TUNNEL_TTL_MINUTES));
    if (activeTunnel) {
        return (0, exports.getTunnelStatus)();
    }
    const tunnel = yield localtunnel({
        port,
        local_host: process.env.TUNNEL_LOCAL_HOST || '127.0.0.1',
        subdomain: requestedSubdomain,
    });
    activeTunnel = tunnel;
    const startedAt = new Date();
    const expiresAt = new Date(startedAt.getTime() + ttl * 60 * 1000);
    activeStatus = {
        active: true,
        expiresAt: expiresAt.toISOString(),
        localPort: port,
        requestedSubdomain,
        startedAt: startedAt.toISOString(),
        url: tunnel.url,
    };
    tunnel.on('close', () => {
        activeTunnel = null;
        clearAutoCloseTimer();
        resetStatus();
    });
    tunnel.on('error', () => {
        activeTunnel = null;
        clearAutoCloseTimer();
        resetStatus();
    });
    clearAutoCloseTimer();
    autoCloseTimer = setTimeout(() => {
        (0, exports.closeTunnel)();
    }, ttl * 60 * 1000);
    return (0, exports.getTunnelStatus)();
});
exports.openTunnel = openTunnel;
//# sourceMappingURL=tunnel.js.map