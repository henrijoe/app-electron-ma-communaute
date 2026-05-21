import type { IMembre } from 'src/store/membreSlice';

export const DUPLICATE_MEMBER_MESSAGE = 'Ce membre a deja ete enregistre.';

export const normalizeMemberPhone = (value: unknown): string =>
  String(value ?? '').replace(/\D/g, '');

export const normalizeMemberBirthDate = (value: unknown): string => {
  const raw = String(value ?? '').trim();

  if (!raw) return '';
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);

  const frenchMatch = raw.match(/^(\d{2})[/-](\d{2})[/-](\d{4})$/);
  if (frenchMatch) {
    return `${frenchMatch[3]}-${frenchMatch[2]}-${frenchMatch[1]}`;
  }

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return raw;

  return parsed.toISOString().slice(0, 10);
};

export const getMemberDuplicateKey = (membre: Pick<IMembre, 'contactMembre' | 'dateNaissMembre'>): string => {
  const phone = normalizeMemberPhone(membre.contactMembre);
  const birthDate = normalizeMemberBirthDate(membre.dateNaissMembre);

  return phone && birthDate ? `${phone}|${birthDate}` : '';
};

export const findDuplicateMember = (
  membres: IMembre[],
  candidate: Pick<IMembre, 'contactMembre' | 'dateNaissMembre'>,
  ignoredMemberId?: number | null
): IMembre | null => {
  const candidateKey = getMemberDuplicateKey(candidate);

  if (!candidateKey) return null;

  return (
    (Array.isArray(membres) ? membres : []).find((membre) => {
      if (ignoredMemberId && Number(membre.idMembre) === Number(ignoredMemberId)) return false;
      return getMemberDuplicateKey(membre) === candidateKey;
    }) || null
  );
};
