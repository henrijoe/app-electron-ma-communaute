import React from 'react';

import { Box, GlobalStyles } from '@mui/material';

import { buildEcodimMediaUrl } from 'src/utils/apiClient';

import {
  CATEGORIES_SORTIE,
  REPONSES_CONVERSION,
  SITUATIONS_SOCIALES,
} from '../constantes';

import {
  CaseReponse,
  LigneChamp,
  Pointilles,
  EnTeteEglise,
  styleBandeau,
  formaterDate,
  useIdentiteEglise,
  dateEtLieuNaissance,
} from './fiche-commune';

// ----------------------------------------------------------------------
// Formulaire d'identification de l'enfant, repris du formulaire papier du
// département enfants. Deux usages, comme la fiche de suivi :
//
// - vierge, à remplir à la main lors de l'inscription ;
// - pré-rempli pour un enfant déjà saisi, depuis sa ligne dans la liste.
//
// L'en-tête n'est jamais écrit en dur : le nom de l'église, son logo et ses
// coordonnées viennent des paramètres. Le formulaire d'origine porte l'en-tête
// d'une fédération précise ; imprimé ici, il porte celui de l'église qui l'imprime.

// Règle « @page » NOMMÉE, et non anonyme : plusieurs documents imprimables restent
// montés en même temps dans la page, et react-to-print recopie toutes les balises
// <style> dans son cadre. Une règle générique déclarée par un autre document
// écraserait la nôtre. Voir sections/user/etats/listeMembrePdf.tsx.
export const FICHE_IDENTIFICATION_PAGE_STYLE = `
@page ficheIdentificationPortrait {
  size: A4 portrait;
  margin: 10mm;
}

.fiche-identification-print-root {
  page: ficheIdentificationPortrait;
}
`;

type FormulaireIdentificationEnfantProps = {
  /** Omis pour un formulaire vierge. */
  enfant?: any | null;
};

const Bandeau = ({ titre }: { titre: string }) => (
  <div style={{ ...styleBandeau, marginTop: 12 }}>❖ {titre}</div>
);

export function FormulaireIdentificationEnfant({ enfant }: FormulaireIdentificationEnfantProps) {
  const identite = useIdentiteEglise();
  const photoUrl = enfant?.photoEnfant ? buildEcodimMediaUrl(enfant.photoEnfant) : '';

  // Le tuteur reprend les colonnes « parent ou tuteur » : c'est deja ce qu'elles
  // portent, et les dedoubler creerait deux sources pour la meme information.
  const parent = String(enfant?.nomParentEnfant || '').trim();
  const contactParent = String(enfant?.contactParentEnfant || '').trim();
  const tuteurRenseigne = [parent, contactParent].filter(Boolean).join(' — ');

  /** `undefined` tant que la reponse n'est pas connue : la case reste vierge. */
  const estConverti = (reponse?: string | null): boolean | undefined => {
    if (reponse === 'Oui') return true;
    if (reponse === 'Non') return false;
    return undefined;
  };

  const vitAvec = String(enfant?.vitAvec || '');
  const situationSociale = String(enfant?.situationSociale || '');
  const categorieSortie = String(enfant?.categorieSortieEcodim || '');

  const sexeLisible = (() => {
    if (enfant?.sexeEnfant === 'M') return 'Masculin';
    if (enfant?.sexeEnfant === 'F') return 'Féminin';
    return '';
  })();

  return (
    <>
      <GlobalStyles styles={FICHE_IDENTIFICATION_PAGE_STYLE} />

      <Box
        className="fiche-identification-print-root"
        sx={{
          width: '190mm',
          margin: '0 auto',
          color: '#000',
          backgroundColor: '#fff',
          fontFamily: 'Times New Roman, serif',
        }}
      >
        <EnTeteEglise identite={identite} sousTitre="DÉPARTEMENT ENFANTS — ÉCOLE DU DIMANCHE" />

        <div
          style={{
            textAlign: 'center',
            fontWeight: 700,
            fontSize: 17,
            textDecoration: 'underline',
            marginTop: 12,
          }}
        >
          FORMULAIRE D&apos;IDENTIFICATION ENFANT
        </div>

        {/* ------------------------------------------------- identité de l'enfant */}
        <Bandeau titre="IDENTITÉ ENFANT" />

        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <LigneChamp libelle="Nom" valeur={enfant?.nomEnfant} />
            <LigneChamp libelle="Prénoms" valeur={enfant?.prenomEnfant} />
            <LigneChamp libelle="Date et lieu de naissance" valeur={dateEtLieuNaissance(enfant)} />
            <LigneChamp libelle="Lieu d'habitation" valeur={enfant?.lieuHabitationEnfant} />
            <LigneChamp libelle="N° Appartement" valeur={enfant?.numeroAppartement} />
            <LigneChamp
              libelle="Contacts"
              valeur={enfant?.contactEnfant || contactParent}
            />
            <LigneChamp libelle="Sexe" valeur={sexeLisible} largeur={160} />
          </div>

          {/* Emplacement photo d'identité : rempli si l'enfant en a une. */}
          <div
            style={{
              width: 95,
              height: 105,
              border: '1px solid #000',
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
            ) : (
              <span style={{ fontSize: 10.5, color: '#666', textAlign: 'center' }}>
                PHOTO
                <br />
                4x4
              </span>
            )}
          </div>
        </div>

        {/* ----------------------------------------------------- situation parentale */}
        <Bandeau titre="SITUATION PARENTALE" />

        <div style={{ display: 'flex', gap: 18 }}>
          <div style={{ flex: 1, borderRight: '1px solid #000', paddingRight: 14 }}>
            <div style={{ textAlign: 'center', fontWeight: 700, fontSize: 13.5, marginBottom: 6 }}>
              LE PÈRE
            </div>
            <LigneChamp libelle="Nom" valeur={enfant?.nomPere} taille={12.5} />
            <LigneChamp libelle="Prénoms" valeur={enfant?.prenomPere} taille={12.5} />
            <LigneChamp
              libelle="Lieu d'habitation"
              valeur={enfant?.lieuHabitationPere}
              taille={12.5}
            />
            <LigneChamp libelle="Profession" valeur={enfant?.professionPere} taille={12.5} />
            <LigneChamp libelle="Contact" valeur={enfant?.contactPere} taille={12.5} />
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ textAlign: 'center', fontWeight: 700, fontSize: 13.5, marginBottom: 6 }}>
              LA MÈRE
            </div>
            <LigneChamp libelle="Nom" valeur={enfant?.nomMere} taille={12.5} />
            <LigneChamp libelle="Prénoms" valeur={enfant?.prenomMere} taille={12.5} />
            <LigneChamp
              libelle="Lieu d'habitation"
              valeur={enfant?.lieuHabitationMere}
              taille={12.5}
            />
            <LigneChamp libelle="Profession" valeur={enfant?.professionMere} taille={12.5} />
            <LigneChamp libelle="Contact" valeur={enfant?.contactMere} taille={12.5} />
          </div>
        </div>

        <div style={{ marginTop: 8, fontSize: 12.5 }}>
          <div style={{ marginBottom: 6 }}>Avec qui vis-tu ?</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <CaseReponse libelle="Père" cochee={vitAvec ? vitAvec === 'Pere' : undefined} />
            <CaseReponse libelle="Mère" cochee={vitAvec ? vitAvec === 'Mere' : undefined} />
            <span style={{ display: 'flex', alignItems: 'flex-end', gap: 6, flex: 1, minWidth: 220 }}>
              <span style={{ whiteSpace: 'nowrap' }}>Tuteur (préciser son nom et contact) :</span>
              <span
                style={{
                  flex: 1,
                  borderBottom: '1px dotted #000',
                  paddingLeft: 4,
                  fontWeight: tuteurRenseigne ? 700 : 400,
                  minHeight: 13,
                  textTransform: 'uppercase',
                }}
              >
                {tuteurRenseigne}
              </span>
            </span>
          </div>
        </div>

        <div style={{ marginTop: 10, fontSize: 12.5 }}>
          <div style={{ marginBottom: 6 }}>
            Sont-ils convertis ? (Si oui, préciser l&apos;église)
            {enfant?.religionParents ? (
              <strong style={{ textTransform: 'uppercase' }}> — {enfant.religionParents}</strong>
            ) : null}
          </div>
          <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap' }}>
            <CaseReponse
              libelle={`Père : ${REPONSES_CONVERSION.Oui} = 1, ${REPONSES_CONVERSION.Non} = 2`}
              cochee={estConverti(enfant?.pereConverti)}
            />
            <CaseReponse
              libelle={`Mère : ${REPONSES_CONVERSION.Oui} = 1, ${REPONSES_CONVERSION.Non} = 2`}
              cochee={estConverti(enfant?.mereConverti)}
            />
            <CaseReponse
              libelle={`Tuteur : ${REPONSES_CONVERSION.Oui} = 1, ${REPONSES_CONVERSION.Non} = 2`}
              cochee={estConverti(enfant?.tuteurConverti)}
            />
          </div>
          <div style={{ marginTop: 6 }}>
            <Pointilles />
          </div>
        </div>

        {/* ------------------------------------------------- situation à l'Ecodim */}
        <Bandeau titre="SITUATION À L'ECODIM" />

        <div style={{ display: 'flex', gap: 18 }}>
          <div style={{ flex: 1 }}>
            <LigneChamp
              libelle="Date d'entrée"
              valeur={formaterDate(enfant?.dateEntreeEcodim)}
              taille={12.5}
            />
          </div>
          <div style={{ flex: 1 }}>
            <LigneChamp
              libelle="Niveau"
              valeur={enfant?.niveauEntreeEcodim || enfant?.libelleClasse}
              taille={12.5}
            />
          </div>
        </div>

        <LigneChamp
          libelle="Niveau actuel"
          valeur={enfant?.niveauActuelEcodim || enfant?.libelleClasse}
          taille={12.5}
        />

        <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>
          Baptisé dans le Saint-Esprit
        </div>
        <div style={{ display: 'flex', gap: 18 }}>
          <div style={{ flex: 1 }}>
            <LigneChamp
              libelle="Date"
              valeur={formaterDate(enfant?.dateBaptemeEsprit)}
              taille={12.5}
            />
          </div>
          <div style={{ flex: 1 }}>
            <LigneChamp libelle="Lieu" valeur={enfant?.lieuBaptemeEsprit} taille={12.5} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 18 }}>
          <div style={{ flex: 1 }}>
            <LigneChamp
              libelle="Date de sortie"
              valeur={formaterDate(enfant?.dateSortieEcodim)}
              taille={12.5}
            />
          </div>
          <div style={{ flex: 1 }}>
            <LigneChamp libelle="Motif" valeur={enfant?.motifSortieEcodim} taille={12.5} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 12.5, marginTop: 2 }}>
          {Object.entries(CATEGORIES_SORTIE).map(([valeur, libelle]) => (
            <CaseReponse
              key={valeur}
              libelle={valeur === 'Autres' ? 'Autres (à préciser)' : libelle}
              cochee={categorieSortie ? categorieSortie === valeur : undefined}
            />
          ))}
        </div>

        {/* -------------------------------------------------- situation sociale */}
        <Bandeau titre="SITUATION SOCIALE" />

        <div style={{ fontSize: 12.5, marginBottom: 6 }}>Que fais-tu dans la vie sociale ?</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, fontSize: 12.5 }}>
          <span style={{ whiteSpace: 'nowrap' }}>1 = ÉLÈVE ; 2 = ÉTUDIANT ; 3 = AUTRES</span>
          <span
            style={{
              flex: 1,
              borderBottom: '1px dotted #000',
              paddingLeft: 4,
              fontWeight: situationSociale ? 700 : 400,
              minHeight: 13,
              textTransform: 'uppercase',
            }}
          >
            {[
              SITUATIONS_SOCIALES[situationSociale] || '',
              enfant?.precisionSituationSociale || enfant?.activiteEnfant || '',
            ]
              .filter(Boolean)
              .join(' — ')}
          </span>
          <span style={{ whiteSpace: 'nowrap' }}>Classe ou niveau :</span>
          <span
            style={{
              width: 150,
              borderBottom: '1px dotted #000',
              paddingLeft: 4,
              fontWeight: enfant?.niveauScolaireEnfant ? 700 : 400,
              minHeight: 13,
              textTransform: 'uppercase',
            }}
          >
            {enfant?.niveauScolaireEnfant || ''}
          </span>
        </div>

        {/* ------------------------------------------------------------- départ */}
        <Bandeau titre="DÉPART" />

        <div style={{ display: 'flex', gap: 18 }}>
          <div style={{ flex: 1 }}>
            <LigneChamp libelle="Date" valeur={formaterDate(enfant?.dateDepart)} taille={12.5} />
          </div>
          <div style={{ flex: 2 }}>
            <LigneChamp libelle="Motifs" valeur={enfant?.motifDepart} taille={12.5} />
          </div>
        </div>

        {/* --------------------------------------------------------- signatures */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: 22,
            fontWeight: 700,
            fontSize: 12.5,
          }}
        >
          <span style={{ textDecoration: 'underline' }}>PARENT OU TUTEUR</span>
          <span style={{ textDecoration: 'underline' }}>LE DIRECTEUR</span>
        </div>

        {/* Date d'édition : un formulaire pré-rempli circule, il doit se dater. */}
        {enfant ? (
          <div style={{ marginTop: 10, fontSize: 10.5, fontStyle: 'italic', textAlign: 'right' }}>
            Édité le {formaterDate(new Date().toISOString())}
          </div>
        ) : null}
      </Box>
    </>
  );
}
