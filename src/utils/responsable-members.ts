import type { IMembre } from 'src/store/membreSlice';

export type ResponsableMemberOption = {
  value: string;
  label: string;
  contact: string;
};

const normalizeResponsibleName = (value: unknown): string =>
  String(value || '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();

export const getMembreFullName = (membre: Partial<IMembre>): string =>
  [membre.prenomMembre, membre.nomMembre]
    .map((part) => String(part || '').trim())
    .filter(Boolean)
    .join(' ')
    .trim();

const isResponsibleMember = (membre: IMembre, responsibilityIds?: number[]): boolean => {
  const idResponsabilite = Number(membre.idResponsabilite || 0);

  if (!idResponsabilite) {
    return false;
  }

  return responsibilityIds?.length ? responsibilityIds.includes(idResponsabilite) : true;
};

export const buildResponsableMemberOptions = (
  membres: IMembre[],
  responsibilityIds?: number[]
): ResponsableMemberOption[] => {
  const source = Array.isArray(membres) ? membres : [];
  const specificResponsibles = source.filter((membre) => isResponsibleMember(membre, responsibilityIds));
  const fallbackResponsibles = responsibilityIds?.length
    ? source.filter((membre) => isResponsibleMember(membre))
    : [];
  const responsables = specificResponsibles.length > 0 ? specificResponsibles : fallbackResponsibles;
  const seen = new Set<string>();

  return responsables
    .map((membre) => {
      const fullName = getMembreFullName(membre);

      return {
        value: fullName,
        label: membre.contactMembre ? `${fullName} - ${membre.contactMembre}` : fullName,
        contact: membre.contactMembre || '',
      };
    })
    .filter((option) => {
      const key = normalizeResponsibleName(option.value);
      if (!key || seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    })
    .sort((a, b) => a.value.localeCompare(b.value));
};

export const findResponsableContact = (membres: IMembre[], responsableName?: string | null): string => {
  const normalizedName = normalizeResponsibleName(responsableName);
  if (!normalizedName) {
    return '';
  }

  const match = (Array.isArray(membres) ? membres : []).find(
    (membre) => normalizeResponsibleName(getMembreFullName(membre)) === normalizedName
  );

  return match?.contactMembre || '';
};

