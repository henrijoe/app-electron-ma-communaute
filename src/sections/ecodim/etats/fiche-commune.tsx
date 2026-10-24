import type { IReduxState } from 'src/store/store';

import React from 'react';
import { useSelector } from 'react-redux';

import { buildChurchLogoUrl } from 'src/utils/apiClient';
import { resolveStaticAssetUrl } from 'src/utils/asset-url';

// ----------------------------------------------------------------------
// Briques communes aux formulaires papier de l'école du dimanche (fiche de suivi,
// formulaire d'identification). Chacun garde sa propre règle « @page », mais tous
// partagent la même mise en page : pointillés, lignes « LIBELLÉ : valeur », bandeaux
// de section et en-tête d'église.

export const styleCadre: React.CSSProperties = {
  border: '1.5px solid #000',
  borderRadius: 4,
  padding: '6px 10px',
};

/**
 * Le bleu des formulaires du département enfants.
 *
 * Les documents officiels portent leur en-tête dans ce bleu sombre, et le titre
 * avec. Le reproduire à l'identique est ce qui fait qu'une fiche imprimée ici
 * se range sans détonner à côté de celles remplies à la main.
 */
export const BLEU_OFFICIEL = '#1F3864';

/** Serif du corps des fiches, dans l'esprit du Cambria des originaux. */
export const POLICE_FICHE = 'Cambria, Georgia, "Times New Roman", serif';

/** Sans-serif de l'en-tête, en capitales et en gras sur les originaux. */
export const POLICE_ENTETE = 'Arial, Helvetica, sans-serif';

export const styleTableau: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: 12.5,
};

export const styleCellule: React.CSSProperties = {
  border: '1px solid #000',
  padding: '5px 4px',
  textAlign: 'center',
  height: 23,
};

export const styleEntete: React.CSSProperties = {
  ...styleCellule,
  backgroundColor: '#e8e8e8',
  fontWeight: 700,
  height: 'auto',
};

export const styleBandeau: React.CSSProperties = {
  backgroundColor: '#e8e8e8',
  border: '1px solid #000',
  fontWeight: 700,
  fontSize: 13.5,
  padding: '3px 6px',
  marginTop: 14,
  marginBottom: 4,
};

/** Trait de pointillés : l'espace laissé libre quand la donnée n'est pas connue. */
export const Pointilles = ({ largeur = '100%' }: { largeur?: string | number }) => (
  <span
    style={{
      display: 'inline-block',
      width: largeur,
      borderBottom: '1px dotted #000',
      height: 14,
      verticalAlign: 'bottom',
    }}
  />
);

/**
 * Ligne « LIBELLÉ : valeur », où la valeur s'écrit sur les pointillés si elle est
 * connue. Une fiche vierge et une fiche pré-remplie partagent ainsi exactement la
 * même mise en page.
 */
export const LigneChamp = ({
  libelle,
  valeur,
  largeur = '100%',
  taille = 13.5,
}: {
  libelle: string;
  valeur?: string | null;
  largeur?: string | number;
  taille?: number;
}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'flex-end',
      gap: 6,
      marginBottom: 9,
      fontSize: taille,
    }}
  >
    <span style={{ whiteSpace: 'nowrap' }}>{libelle} :</span>
    <span
      style={{
        flex: largeur === '100%' ? 1 : 'none',
        width: largeur === '100%' ? undefined : largeur,
        borderBottom: '1px dotted #000',
        paddingLeft: 4,
        paddingBottom: 1,
        fontWeight: valeur ? 700 : 400,
        minHeight: 16,
        // Les formulaires officiels se remplissent en capitales : une saisie en
        // minuscules ne doit pas donner un document qui détonne.
        textTransform: 'uppercase',
      }}
    >
      {valeur || ''}
    </span>
  </div>
);

/**
 * Case du formulaire papier.
 *
 * `cochee` vaut `undefined` sur un document vierge : la case reste vide, à cocher
 * à la main. Elle vaut `false` quand la réponse est connue et négative — ce qui
 * n'est pas la même chose qu'une absence de réponse, et doit rester distinguable.
 */
export const CaseReponse = ({ libelle, cochee }: { libelle?: string; cochee?: boolean }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12.5 }}>
    {libelle ? <span>{libelle}</span> : null}
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 30,
        height: 16,
        border: '1px solid #000',
        fontWeight: 700,
        fontSize: 11.5,
        lineHeight: 1,
      }}
    >
      {cochee ? 'X' : ''}
    </span>
  </span>
);

export const formaterDate = (date?: string | null): string => {
  if (!date) return '';

  const valeur = new Date(date);
  if (Number.isNaN(valeur.getTime())) return String(date);

  return valeur.toLocaleDateString('fr-FR');
};

/** « 02/04/2018 à Abidjan » tient sur une seule ligne du formulaire. */
export const dateEtLieuNaissance = (enfant?: any | null): string => {
  if (!enfant) return '';

  const date = formaterDate(enfant.dateNaissEnfant);
  const lieu = String(enfant.lieuNaissEnfant || '').trim();

  if (date && lieu) return `${date} à ${lieu}`;
  return date || lieu;
};

const logoImprimable = (identite: any): string | null => {
  const chemin = identite?.logoEglise || identite?.logoUtilisateur;

  if (!chemin) return null;
  if (/^(https?:|data:|blob:|file:)/i.test(chemin)) return chemin;
  if (identite?.logoEglise && chemin === identite.logoEglise) return buildChurchLogoUrl(chemin);

  return resolveStaticAssetUrl(chemin);
};

export type IdentiteEglise = {
  nom: string;
  /** Dénomination, telle qu'elle coiffe les fiches officielles. */
  denomination: string;
  /** Région ecclésiastique, saisie dans les paramètres de l'église. */
  region: string;
  contact: string;
  logoUrl: string | null;
};

/**
 * Identité de l'église telle qu'elle doit apparaître en tête des formulaires.
 *
 * Rien n'est écrit en dur : le nom, le logo et les coordonnées viennent des
 * paramètres de l'église. Les formulaires papier d'origine portent l'en-tête d'une
 * fédération précise ; imprimés ici, ils portent celui de l'église qui les imprime.
 */
export const useIdentiteEglise = (): IdentiteEglise => {
  const userConnected = useSelector((state: IReduxState) => state.application.userConnected);
  const utilisateurData = useSelector(
    (state: IReduxState) => state.authentification.utilisateurData
  );

  const identite: any = { ...(utilisateurData || {}), ...(userConnected || {}) };

  return {
    nom: identite.nomTemple || identite.nomEgliseCourt || '',
    denomination: String(identite.nomEglise || '').trim(),
    region: String(identite.regionEglise || '').trim(),
    contact: [
      identite.lieuEglise,
      identite.boitePostaleEglise,
      identite.telephoneSecretariatEglise || identite.telephoneUtilisateur,
      identite.emailEglise || identite.email,
    ]
      .map((valeur: any) => String(valeur || '').trim())
      .filter(Boolean)
      .join(' • '),
    logoUrl: logoImprimable(identite),
  };
};

/** Cartouche d'en-tête : logo à gauche, identité de l'église au centre. */
export const EnTeteEglise = ({
  identite,
  sousTitre,
}: {
  identite: IdentiteEglise;
  sousTitre: string;
}) => (
  <div style={{ ...styleCadre, display: 'flex', alignItems: 'center', gap: 10 }}>
    <div
      style={{
        width: 62,
        height: 62,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {identite.logoUrl ? (
        <img
          src={identite.logoUrl}
          alt=""
          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
        />
      ) : null}
    </div>

    <div style={{ flex: 1, textAlign: 'center', lineHeight: 1.35 }}>
      <div style={{ fontWeight: 700, fontSize: 13.5, textTransform: 'uppercase' }}>
        {identite.nom || <Pointilles largeur="60%" />}
      </div>
      {identite.contact ? (
        <div style={{ fontSize: 10.5, fontStyle: 'italic' }}>{identite.contact}</div>
      ) : null}
      <div style={{ fontWeight: 700, fontSize: 12.5, marginTop: 3 }}>{sousTitre}</div>
    </div>

    {/* Pendant du logo : réservé au cachet ou au sigle de la fédération. */}
    <div style={{ width: 62, height: 62, flexShrink: 0 }} />
  </div>
);

/**
 * Lignes d'identité de la fédération, telles qu'elles figurent sur les formulaires
 * d'origine du département enfants.
 *
 * Elles sont ici parce que ce sont celles des documents fournis. La dénomination
 * et la région viennent, elles, des paramètres de l'église : une paroisse qui
 * saisit les siennes voit les siennes. Seules ces deux lignes de référence
 * restent écrites ici, faute d'un champ qui les porte.
 */
const MENTION_LEGALE = 'Association cultuelle reconnue par arrêté n° 303/1 cab du 1er mars 1960';
const DENOMINATION_PAR_DEFAUT = 'ÉGLISE ÉVANGÉLIQUE DES ASSEMBLÉES DE DIEU DE CÔTE D’IVOIRE';
const DEPARTEMENT = 'DÉPARTEMENT ENFANTS — DEEADCI';

/** Les points de séparation de l'en-tête d'origine, sous chaque mention. */
const Separateur = () => (
  <div style={{ letterSpacing: 1, lineHeight: 1 }}>·····················</div>
);

/**
 * Cartouche officiel des fiches du département enfants.
 *
 * Le bandeau arrondi, le bleu, les capitales : tout vient du formulaire papier,
 * pour qu'une fiche imprimée ici se range sans détonner à côté des autres. Les
 * deux emplacements latéraux reçoivent le logo de l'église — ceux de la
 * fédération sont des images qui ne sont pas dans l'application.
 */
export const EnTeteOfficiel = ({ identite }: { identite: IdentiteEglise }) => (
  <div
    style={{
      border: `1.5px solid ${BLEU_OFFICIEL}`,
      borderRadius: 26,
      padding: '6px 14px',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      fontFamily: POLICE_ENTETE,
      color: BLEU_OFFICIEL,
    }}
  >
    <div style={{ width: 58, height: 58, flexShrink: 0 }}>
      {identite.logoUrl ? (
        <img
          src={identite.logoUrl}
          alt=""
          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
        />
      ) : null}
    </div>

    <div style={{ flex: 1, textAlign: 'center', lineHeight: 1.3 }}>
      <div style={{ fontWeight: 700, fontSize: 11 }}>
        {identite.denomination || DENOMINATION_PAR_DEFAUT}
      </div>
      <div style={{ fontStyle: 'italic', fontWeight: 700, fontSize: 9 }}>{MENTION_LEGALE}</div>
      <div style={{ fontWeight: 700, fontSize: 10 }}>{DEPARTEMENT}</div>
      <Separateur />
      <div style={{ fontWeight: 700, fontSize: 10.5 }}>
        {identite.region ? identite.region.toUpperCase() : <Pointilles largeur="55%" />}
      </div>
      <Separateur />
    </div>

    <div style={{ width: 58, height: 58, flexShrink: 0 }} />
  </div>
);
