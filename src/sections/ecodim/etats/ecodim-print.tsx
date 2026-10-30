import { useRef, useState } from 'react';
import ReactToPrint from 'react-to-print';

import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import { PrintRounded } from '@mui/icons-material';

import { PrintDocumentLayout } from 'src/components/print/print-document';
import { formaterDate } from 'src/utils/format-date';
import { buildEcodimMediaUrl } from 'src/utils/apiClient';

import { estInscrit, libelleFonction } from '../constantes';
import { FicheSuiviEnfant, FICHE_SUIVI_PAGE_STYLE } from './fiche-suivi-enfant';
import {
  FicheInscriptionEnfant,
  FICHE_INSCRIPTION_PAGE_STYLE,
} from './fiche-inscription-enfant';
import {
  FormulaireIdentificationEnfant,
  FICHE_IDENTIFICATION_PAGE_STYLE,
} from './formulaire-identification-enfant';

// ----------------------------------------------------------------------
// Listes imprimables de l'école du dimanche.
//
// Ce bouton n'est monté que hors application desktop : l'impression navigateur
// reste la voie retenue dans tout le projet.

type EcodimPrintProps = {
  classes: any[];
  moniteurs: any[];
  enfants: any[];
  activites: any[];
  /** Mouvements de la caisse, pour le point financier du département. */
  finances?: any[];
  /**
   * Filtres actifs à l'écran, rappelés en tête de chaque liste imprimée.
   *
   * Les listes reçues sont déjà filtrées : sans ce rappel, une feuille de
   * quatre enfants se lirait comme l'effectif entier de l'école.
   */
  sousTitre?: string;
};

const styleTableau: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: 13.5,
};

const styleCellule: React.CSSProperties = {
  border: '1px solid #cbd5e1',
  padding: '6px 8px',
  textAlign: 'left',
};

const styleEntete: React.CSSProperties = {
  ...styleCellule,
  backgroundColor: '#eef2f7',
  fontWeight: 700,
};

// Mêmes libellés que l'écran : la valeur stockée reste sans accent.
const LIBELLES_STATUT: Record<string, string> = {
  Planifiee: 'Planifiée',
  EnCours: 'En cours',
  Terminee: 'Terminée',
  Annulee: 'Annulée',
};

/** Montant lisible, en francs CFA, sans décimale : la monnaie n'en a pas. */
const formaterMontant = (valeur: number | string): string =>
  `${Number(valeur || 0).toLocaleString('fr-FR')} FCFA`;

/** Rappel des filtres, posé en tête de chaque liste imprimée. */
const RappelFiltres = ({ sousTitre }: { sousTitre?: string }) =>
  sousTitre ? <Box sx={{ mb: 1.5, fontSize: 13, color: '#475569' }}>{sousTitre}</Box> : null;

/**
 * Photo de l'enfant sur la liste imprimée, ou son initiale à défaut, comme à
 * l'écran. Le fond de l'initiale est forcé à l'impression : sans cela, le
 * navigateur le retire et il ne reste qu'une lettre flottante.
 */
const PhotoEnfant = ({ enfant }: { enfant: any }) => {
  const source = buildEcodimMediaUrl(enfant.photoEnfant);
  const rond: React.CSSProperties = {
    width: 34,
    height: 34,
    borderRadius: '50%',
    display: 'block',
    margin: '0 auto',
  };

  if (source) {
    return <img src={source} alt="" style={{ ...rond, objectFit: 'cover' }} />;
  }

  return (
    <span
      style={{
        ...rond,
        lineHeight: '34px',
        textAlign: 'center',
        fontWeight: 700,
        color: '#fff',
        backgroundColor: '#94a3b8',
        WebkitPrintColorAdjust: 'exact',
        printColorAdjust: 'exact',
      }}
    >
      {(enfant.nomEnfant || '?').charAt(0).toUpperCase()}
    </span>
  );
};

/**
 * Une des deux listes de l'état des inscriptions.
 *
 * Les deux tableaux sont toujours imprimés, même vides : une section absente
 * laisserait croire qu'elle a été oubliée, quand « aucun » est une réponse.
 */
const TableauInscriptions = ({
  titre,
  enfants,
  avecDate = false,
}: {
  titre: string;
  enfants: any[];
  avecDate?: boolean;
}) => (
  <Box sx={{ mb: 3 }}>
    <Box sx={{ mb: 1, fontSize: 15, fontWeight: 700, color: '#1e293b' }}>{titre}</Box>
    <table style={styleTableau}>
      <thead>
        <tr>
          <th style={{ ...styleEntete, width: 34, textAlign: 'center' }}>N°</th>
          <th style={{ ...styleEntete, width: 50, textAlign: 'center' }}>Photo</th>
          <th style={styleEntete}>Matricule</th>
          <th style={styleEntete}>Nom et prénoms</th>
          <th style={styleEntete}>Classe</th>
          <th style={styleEntete}>Âge</th>
          {avecDate && <th style={styleEntete}>Inscrit le</th>}
          <th style={styleEntete}>Parent ou tuteur</th>
          <th style={styleEntete}>Contact</th>
        </tr>
      </thead>
      <tbody>
        {enfants.length === 0 ? (
          <tr>
            <td style={{ ...styleCellule, textAlign: 'center' }} colSpan={avecDate ? 9 : 8}>
              Aucun enfant
            </td>
          </tr>
        ) : (
          enfants.map((enfant, index) => (
            <tr key={enfant.idEnfantEcodim}>
              <td style={{ ...styleCellule, textAlign: 'center' }}>{index + 1}</td>
              <td style={{ ...styleCellule, padding: '4px' }}>
                <PhotoEnfant enfant={enfant} />
              </td>
              <td style={styleCellule}>{enfant.matriculeEnfant || '—'}</td>
              <td style={styleCellule}>
                {`${enfant.nomEnfant || ''} ${enfant.prenomEnfant || ''}`.trim()}
              </td>
              <td style={styleCellule}>{enfant.libelleClasse || 'Non affecté'}</td>
              <td style={styleCellule}>{ageDepuisNaissance(enfant.dateNaissEnfant)}</td>
              {avecDate && (
                <td style={styleCellule}>
                  {formaterDate(enfant.dateInscriptionEcodim) || '—'}
                </td>
              )}
              <td style={styleCellule}>{enfant.nomParentEnfant || '—'}</td>
              <td style={styleCellule}>{enfant.contactParentEnfant || '—'}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </Box>
);

const ageDepuisNaissance = (date?: string | null): string => {
  if (!date) return '—';

  const naissance = new Date(date);
  if (Number.isNaN(naissance.getTime())) return '—';

  const maintenant = new Date();
  let age = maintenant.getFullYear() - naissance.getFullYear();
  const mois = maintenant.getMonth() - naissance.getMonth();

  if (mois < 0 || (mois === 0 && maintenant.getDate() < naissance.getDate())) {
    age -= 1;
  }

  return age >= 0 ? String(age) : '—';
};

export function EcodimPrint({
  classes,
  moniteurs,
  enfants,
  activites,
  finances = [],
  sousTitre,
}: EcodimPrintProps) {
  const [ancre, setAncre] = useState<null | HTMLElement>(null);

  // Totaux du point financier. Ils sont calculés ici, sur les lignes reçues :
  // l'état doit porter le solde de ce qu'il imprime, pas celui de la caisse
  // entière, sinon une feuille filtrée sur un mois annoncerait le solde annuel.
  const totalRecettes = finances.reduce(
    (somme, ligne) => somme + (Number(ligne.entreeFinance) || 0),
    0
  );
  const totalDepenses = finances.reduce(
    (somme, ligne) => somme + (Number(ligne.sortieFinance) || 0),
    0
  );

  // Une référence par document : react-to-print lit le contenu au moment du clic,
  // avant qu'un changement d'état n'ait eu le temps d'être appliqué. Partager une
  // seule référence imprimerait le document précédemment sélectionné.
  const referenceClasses = useRef<HTMLDivElement>(null);
  const referenceMoniteurs = useRef<HTMLDivElement>(null);
  const referenceEnfants = useRef<HTMLDivElement>(null);
  const referenceInscriptions = useRef<HTMLDivElement>(null);
  const referenceActivites = useRef<HTMLDivElement>(null);
  const referenceFinances = useRef<HTMLDivElement>(null);
  const referenceFiche = useRef<HTMLDivElement>(null);
  const referenceIdentification = useRef<HTMLDivElement>(null);
  const referenceInscription = useRef<HTMLDivElement>(null);

  const references = {
    classes: referenceClasses,
    moniteurs: referenceMoniteurs,
    enfants: referenceEnfants,
    inscriptions: referenceInscriptions,
    activites: referenceActivites,
    finances: referenceFinances,
  };

  const titres = {
    classes: 'Liste des classes',
    moniteurs: 'Liste des moniteurs',
    enfants: 'Liste des enfants',
    inscriptions: 'État des inscriptions',
    activites: 'Programme des activités',
    finances: 'Point financier du département',
  };

  const enfantsInscrits = enfants.filter((enfant) => estInscrit(enfant));
  const enfantsNonInscrits = enfants.filter((enfant) => !estInscrit(enfant));

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<PrintRounded />}
        onClick={(event) => setAncre(event.currentTarget)}
      >
        Imprimer
      </Button>

      <Menu anchorEl={ancre} open={Boolean(ancre)} onClose={() => setAncre(null)}>
        {(
          ['classes', 'moniteurs', 'enfants', 'inscriptions', 'activites', 'finances'] as const
        ).map((cible) => (
          <ReactToPrint
            key={cible}
            trigger={() => <MenuItem>{titres[cible]}</MenuItem>}
            content={() => references[cible].current}
            onAfterPrint={() => setAncre(null)}
          />
        ))}

        <Divider />

        <ReactToPrint
          trigger={() => <MenuItem>Fiche de suivi (vierge)</MenuItem>}
          content={() => referenceFiche.current}
          pageStyle={FICHE_SUIVI_PAGE_STYLE}
          onAfterPrint={() => setAncre(null)}
        />

        <ReactToPrint
          trigger={() => <MenuItem>Fiche d&apos;inscription (vierge)</MenuItem>}
          content={() => referenceInscription.current}
          pageStyle={FICHE_INSCRIPTION_PAGE_STYLE}
          onAfterPrint={() => setAncre(null)}
        />

        <ReactToPrint
          trigger={() => <MenuItem>Formulaire d&apos;identification (vierge)</MenuItem>}
          content={() => referenceIdentification.current}
          pageStyle={FICHE_IDENTIFICATION_PAGE_STYLE}
          onAfterPrint={() => setAncre(null)}
        />
      </Menu>

      <Box sx={{ display: 'none' }}>
        <div ref={referenceClasses}>
          <PrintDocumentLayout title={titres.classes} orientation="portrait">
            <RappelFiltres sousTitre={sousTitre} />
            <table style={styleTableau}>
                <thead>
                  <tr>
                    <th style={styleEntete}>Classe</th>
                    <th style={styleEntete}>Tranche d&apos;âge</th>
                    <th style={styleEntete}>Moniteurs</th>
                    <th style={styleEntete}>Enfants</th>
                  </tr>
                </thead>
                <tbody>
                  {classes.map((classe) => (
                    <tr key={classe.idClasseEcodim}>
                      <td style={styleCellule}>{classe.libelleClasse}</td>
                      <td style={styleCellule}>{classe.trancheAge || '—'}</td>
                      <td style={styleCellule}>{classe.nombreMoniteurs ?? 0}</td>
                      <td style={styleCellule}>{classe.nombreEnfants ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
            </table>
          </PrintDocumentLayout>
        </div>

        <div ref={referenceMoniteurs}>
          <PrintDocumentLayout title={titres.moniteurs} orientation="portrait">
            <RappelFiltres sousTitre={sousTitre} />
            <table style={styleTableau}>
                <thead>
                  <tr>
                    <th style={styleEntete}>Moniteur</th>
                    <th style={styleEntete}>Contact</th>
                    <th style={styleEntete}>Classe</th>
                    <th style={styleEntete}>Rôle</th>
                  </tr>
                </thead>
                <tbody>
                  {moniteurs.map((moniteur) => (
                    <tr key={moniteur.idMoniteur}>
                      <td style={styleCellule}>
                        {`${moniteur.nomMembre || ''} ${moniteur.prenomMembre || ''}`.trim() || '—'}
                      </td>
                      <td style={styleCellule}>{moniteur.contactMembre || '—'}</td>
                      <td style={styleCellule}>{moniteur.libelleClasse || 'Non affecté'}</td>
                      <td style={styleCellule}>
                        {libelleFonction(moniteur.fonctionMoniteur)}
                        {moniteur.estPrincipal ? ' (responsable)' : ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
            </table>
          </PrintDocumentLayout>
        </div>

        <div ref={referenceEnfants}>
          <PrintDocumentLayout title={titres.enfants} orientation="portrait">
            <RappelFiltres sousTitre={sousTitre} />
            <table style={styleTableau}>
                <thead>
                  <tr>
                    <th style={{ ...styleEntete, width: 50, textAlign: 'center' }}>Photo</th>
                    <th style={styleEntete}>Matricule</th>
                    <th style={styleEntete}>Nom</th>
                    <th style={styleEntete}>Prénoms</th>
                    <th style={styleEntete}>Classe</th>
                    <th style={styleEntete}>Âge</th>
                    <th style={styleEntete}>Parent ou tuteur</th>
                    <th style={styleEntete}>Contact</th>
                  </tr>
                </thead>
                <tbody>
                  {enfants.map((enfant) => (
                    <tr key={enfant.idEnfantEcodim}>
                      <td style={{ ...styleCellule, padding: '4px' }}>
                        <PhotoEnfant enfant={enfant} />
                      </td>
                      <td style={styleCellule}>{enfant.matriculeEnfant || '—'}</td>
                      <td style={styleCellule}>{enfant.nomEnfant}</td>
                      <td style={styleCellule}>{enfant.prenomEnfant || '—'}</td>
                      <td style={styleCellule}>{enfant.libelleClasse || 'Non affecté'}</td>
                      <td style={styleCellule}>{ageDepuisNaissance(enfant.dateNaissEnfant)}</td>
                      <td style={styleCellule}>{enfant.nomParentEnfant || '—'}</td>
                      <td style={styleCellule}>{enfant.contactParentEnfant || '—'}</td>
                    </tr>
                  ))}
                </tbody>
            </table>
          </PrintDocumentLayout>
        </div>

        <div ref={referenceInscriptions}>
          <PrintDocumentLayout title={titres.inscriptions} orientation="portrait">
            <RappelFiltres sousTitre={sousTitre} />
            <Box sx={{ mb: 2, fontSize: 14, fontWeight: 600 }}>
              {enfants.length} enfant{enfants.length > 1 ? 's' : ''} · {enfantsInscrits.length}{' '}
              inscrit{enfantsInscrits.length > 1 ? 's' : ''} · {enfantsNonInscrits.length} non
              inscrit{enfantsNonInscrits.length > 1 ? 's' : ''}
            </Box>

            <TableauInscriptions
              titre={`Enfants inscrits (${enfantsInscrits.length})`}
              enfants={enfantsInscrits}
              avecDate
            />
            <TableauInscriptions
              titre={`Enfants non inscrits (${enfantsNonInscrits.length})`}
              enfants={enfantsNonInscrits}
            />
          </PrintDocumentLayout>
        </div>

        <div ref={referenceActivites}>
          <PrintDocumentLayout title={titres.activites} orientation="portrait">
            <RappelFiltres sousTitre={sousTitre} />
            <table style={styleTableau}>
                <thead>
                  <tr>
                    <th style={styleEntete}>Activité</th>
                    <th style={styleEntete}>Type</th>
                    <th style={styleEntete}>Date</th>
                    <th style={styleEntete}>Horaire</th>
                    <th style={styleEntete}>Lieu</th>
                    <th style={styleEntete}>Classe</th>
                    <th style={styleEntete}>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {activites.map((activite) => (
                    <tr key={activite.idActiviteEcodim}>
                      <td style={styleCellule}>{activite.titreActivite}</td>
                      <td style={styleCellule}>{activite.typeActivite || '—'}</td>
                      <td style={styleCellule}>{formaterDate(activite.dateDebutActivite, '—')}</td>
                      <td style={styleCellule}>
                        {activite.heureDebutActivite || '—'}
                        {activite.heureFinActivite ? ` - ${activite.heureFinActivite}` : ''}
                      </td>
                      <td style={styleCellule}>{activite.lieuActivite || '—'}</td>
                      <td style={styleCellule}>{activite.libelleClasse || 'Toutes les classes'}</td>
                      <td style={styleCellule}>{LIBELLES_STATUT[activite.statutActivite] || activite.statutActivite}</td>
                    </tr>
                  ))}
                </tbody>
            </table>
          </PrintDocumentLayout>
        </div>

        <div ref={referenceFinances}>
          <PrintDocumentLayout title={titres.finances} orientation="portrait">
            <RappelFiltres sousTitre={sousTitre} />
            <table style={styleTableau}>
              <thead>
                <tr>
                  <th style={styleEntete}>Date</th>
                  <th style={styleEntete}>Libellé</th>
                  <th style={styleEntete}>Catégorie</th>
                  <th style={{ ...styleEntete, textAlign: 'right' }}>Recette</th>
                  <th style={{ ...styleEntete, textAlign: 'right' }}>Dépense</th>
                </tr>
              </thead>
              <tbody>
                {finances.map((finance) => (
                  <tr key={finance.idFinanceEcodim}>
                    <td style={styleCellule}>{formaterDate(finance.dateFinance, '—')}</td>
                    <td style={styleCellule}>{finance.libelleFinance}</td>
                    <td style={styleCellule}>{finance.categorieFinance || '—'}</td>
                    <td style={{ ...styleCellule, textAlign: 'right' }}>
                      {Number(finance.entreeFinance) > 0
                        ? formaterMontant(finance.entreeFinance)
                        : '—'}
                    </td>
                    <td style={{ ...styleCellule, textAlign: 'right' }}>
                      {Number(finance.sortieFinance) > 0
                        ? formaterMontant(finance.sortieFinance)
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>

              {/* Le pied porte les totaux et le solde : une feuille de caisse
                  qu'il faut encore additionner à la main n'est pas un état. */}
              <tfoot>
                <tr>
                  <td style={{ ...styleEntete, textAlign: 'right' }} colSpan={3}>
                    Totaux
                  </td>
                  <td style={{ ...styleEntete, textAlign: 'right' }}>
                    {formaterMontant(totalRecettes)}
                  </td>
                  <td style={{ ...styleEntete, textAlign: 'right' }}>
                    {formaterMontant(totalDepenses)}
                  </td>
                </tr>
                <tr>
                  <td style={{ ...styleEntete, textAlign: 'right' }} colSpan={3}>
                    Solde
                  </td>
                  <td style={{ ...styleEntete, textAlign: 'right' }} colSpan={2}>
                    {formaterMontant(totalRecettes - totalDepenses)}
                  </td>
                </tr>
              </tfoot>
            </table>

            <div style={{ marginTop: 28, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 700, fontSize: 12 }}>Le trésorier</span>
              <span style={{ fontWeight: 700, fontSize: 12 }}>Le Directeur</span>
            </div>
          </PrintDocumentLayout>
        </div>

        {/* Documents vierges : aucun enfant transmis, tous les champs restent à remplir. */}
        <div ref={referenceFiche}>
          <FicheSuiviEnfant />
        </div>

        <div ref={referenceInscription}>
          <FicheInscriptionEnfant />
        </div>

        <div ref={referenceIdentification}>
          <FormulaireIdentificationEnfant />
        </div>
      </Box>
    </>
  );
}
