import React from 'react';

import { Box, GlobalStyles } from '@mui/material';

import { buildEcodimMediaUrl } from 'src/utils/apiClient';

import {
  LigneChamp,
  CaseReponse,
  formaterDate,
  POLICE_FICHE,
  BLEU_OFFICIEL,
  EnTeteOfficiel,
  useIdentiteEglise,
  dateEtLieuNaissance,
} from './fiche-commune';

// ----------------------------------------------------------------------
// Fiche d'inscription de l'enfant — formulaire officiel du département enfants,
// celui qu'on remplit à l'arrivée d'un enfant à l'école du dimanche.
//
// Elle ne remplace pas le formulaire d'identification : celui-ci sert au suivi
// détaillé (parcours, sortie, situation sociale), celle-là à l'inscription.
//
// Vierge ou pré-remplie, la mise en page ne change pas : une fiche imprimée pour
// être complétée à la main doit avoir exactement les mêmes repères que celle
// qu'on imprime déjà remplie.

export const FICHE_INSCRIPTION_PAGE_STYLE = `
@page ficheInscriptionPortrait {
  size: A4 portrait;
  margin: 10mm;
}

.fiche-inscription-print-root {
  page: ficheInscriptionPortrait;
}
`;

/** Bandeau de section : fond gris barré d'un trait, comme sur l'original. */
const Bandeau = ({ titre }: { titre: string }) => (
  <div style={{ marginTop: 14, marginBottom: 8 }}>
    <div
      style={{
        backgroundColor: '#D9D9D9',
        color: BLEU_OFFICIEL,
        fontWeight: 700,
        fontSize: 12.5,
        padding: '2px 8px',
      }}
    >
      {titre}
    </div>
    <div style={{ height: 2, backgroundColor: '#8EA9DB' }} />
  </div>
);

type FicheInscriptionEnfantProps = {
  /** Omis pour une fiche vierge. */
  enfant?: any | null;
};

export function FicheInscriptionEnfant({ enfant }: FicheInscriptionEnfantProps) {
  const identite = useIdentiteEglise();
  const photoUrl = enfant?.photoEnfant ? buildEcodimMediaUrl(enfant.photoEnfant) : '';

  // L'année ecclésiastique court sur deux années civiles : de septembre à août.
  const maintenant = new Date();
  const anneeDebut = maintenant.getMonth() >= 8 ? maintenant.getFullYear() : maintenant.getFullYear() - 1;

  /**
   * Baptême du Saint-Esprit : la fiche demande OUI ou NON.
   *
   * Sans enfant, les deux cases restent vides — c'est une fiche à remplir. Avec
   * un enfant, une date de baptême enregistrée vaut OUI ; son absence vaut NON,
   * et non « on ne sait pas », puisque c'est ainsi que la saisie est conçue.
   */
  const baptemeEsprit = enfant ? Boolean(enfant.dateBaptemeEsprit) : undefined;

  const nomCompletParent = (nom?: string, prenom?: string) =>
    `${String(nom || '').trim()} ${String(prenom || '').trim()}`.trim();

  return (
    <>
      <GlobalStyles styles={FICHE_INSCRIPTION_PAGE_STYLE} />

      <Box
        className="fiche-inscription-print-root"
        sx={{
          width: '190mm',
          margin: '0 auto',
          color: '#000',
          backgroundColor: '#fff',
          fontFamily: POLICE_FICHE,
        }}
      >
        <EnTeteOfficiel identite={identite} />

        <div
          style={{
            textAlign: 'center',
            fontWeight: 700,
            fontSize: 17,
            textDecoration: 'underline',
            color: BLEU_OFFICIEL,
            marginTop: 14,
          }}
        >
          FICHE D&apos;INSCRIPTION DE L&apos;ENFANT
        </div>

        {/* --------------------------------------------- année + emplacement photo */}
        <div style={{ display: 'flex', alignItems: 'flex-start', marginTop: 12 }}>
          <div style={{ flex: 1, textAlign: 'center', paddingTop: 10, fontWeight: 700 }}>
            ANNÉE ECCLÉSIASTIQUE {anneeDebut} / {anneeDebut + 1}
          </div>

          <div
            style={{
              width: 92,
              height: 92,
              border: `1px solid ${BLEU_OFFICIEL}`,
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            {photoUrl ? (
              <img
                src={photoUrl}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : null}
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <LigneChamp libelle="RÉGION" valeur={identite.region} />
          <LigneChamp libelle="ÉGLISE" valeur={identite.nom} />
        </div>

        {/* ------------------------------------------------------------- l'élève */}
        <Bandeau titre="L'ÉLÈVE" />

        {/* Même place que sur la fiche de suivi : le matricule en tête de
            l'identité, pour rattacher la feuille au dossier. */}
        <LigneChamp libelle="MATRICULE" valeur={enfant?.matriculeEnfant} />
        <LigneChamp libelle="NOM" valeur={enfant?.nomEnfant} />
        <LigneChamp libelle="PRÉNOMS" valeur={enfant?.prenomEnfant} />
        <LigneChamp libelle="DATE ET LIEU DE NAISSANCE" valeur={dateEtLieuNaissance(enfant)} />

        <div style={{ display: 'flex', gap: 18 }}>
          <div style={{ flex: 1 }}>
            <LigneChamp libelle="CLASSE ECODIM" valeur={enfant?.libelleClasse} />
          </div>
          <div style={{ flex: 1 }}>
            <LigneChamp libelle="GROUPE À L'ECODIM" valeur={enfant?.groupeEcodimEnfant} />
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 26,
            marginBottom: 9,
            fontSize: 13.5,
            fontWeight: 700,
          }}
        >
          <span>BAPTÊME DU SAINT-ESPRIT :</span>
          <CaseReponse libelle="OUI" cochee={baptemeEsprit === undefined ? undefined : baptemeEsprit} />
          <CaseReponse
            libelle="NON"
            cochee={baptemeEsprit === undefined ? undefined : !baptemeEsprit}
          />
        </div>

        <div style={{ display: 'flex', gap: 18 }}>
          <div style={{ flex: 1 }}>
            <LigneChamp libelle="NIVEAU SCOLAIRE" valeur={enfant?.niveauScolaireEnfant} />
          </div>
          <div style={{ flex: 1 }}>
            <LigneChamp libelle="ÉCOLE" valeur={enfant?.ecoleEnfant} />
          </div>
        </div>

        <LigneChamp
          libelle="AUTRE OCCUPATION SI PAS À L'ÉCOLE"
          valeur={enfant?.activiteEnfant}
        />

        {/* ----------------------------------------------------------- les parents */}
        <Bandeau titre="LES PARENTS" />

        <LigneChamp
          libelle="NOM DU PÈRE"
          valeur={nomCompletParent(enfant?.nomPere, enfant?.prenomPere)}
        />
        <LigneChamp
          libelle="NOM DE LA MÈRE"
          valeur={nomCompletParent(enfant?.nomMere, enfant?.prenomMere)}
        />

        <div style={{ display: 'flex', gap: 18 }}>
          <div style={{ flex: 1 }}>
            <LigneChamp libelle="RELIGION DU PÈRE" valeur={enfant?.religionPere} />
          </div>
          <div style={{ flex: 1 }}>
            <LigneChamp libelle="RELIGION DE LA MÈRE" valeur={enfant?.religionMere} />
          </div>
        </div>

        <LigneChamp
          libelle="AVEC QUI VIENT-IL À L'ÉGLISE"
          valeur={enfant?.avecQuiVientEglise}
        />
        <LigneChamp
          libelle="RESPONSABILITÉ DU TUTEUR À L'ÉGLISE"
          valeur={enfant?.responsabiliteTuteurEglise}
        />

        <div style={{ display: 'flex', gap: 18 }}>
          <div style={{ flex: 1 }}>
            <LigneChamp libelle="DOMICILE" valeur={enfant?.lieuHabitationEnfant} />
          </div>
          <div style={{ flex: 1 }}>
            <LigneChamp libelle="PROFESSION" valeur={enfant?.professionTuteur} />
          </div>
        </div>

        <LigneChamp
          libelle="CONTACTS"
          valeur={enfant?.contactParentEnfant || enfant?.contactEnfant}
        />

        {/* ------------------------------------------------- date et signatures */}
        <div style={{ textAlign: 'right', marginTop: 22, fontSize: 12.5 }}>
          Date d&apos;inscription le{' '}
          <span style={{ fontWeight: 700 }}>
            {/* La date d'entrée reste en secours : avant la case « inscrit »,
                c'est elle que cette ligne affichait. */}
            {formaterDate(enfant?.dateInscriptionEcodim || enfant?.dateEntreeEcodim) ||
              '……/……/20……'}
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: 30,
            fontWeight: 700,
            fontSize: 12.5,
          }}
        >
          <span>Le Président national</span>
          <span>Le Directeur</span>
        </div>
      </Box>
    </>
  );
}
