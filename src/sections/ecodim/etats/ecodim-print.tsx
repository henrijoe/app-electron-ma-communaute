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
import { libelleFonction } from '../constantes';
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

export function EcodimPrint({ classes, moniteurs, enfants, activites }: EcodimPrintProps) {
  const [ancre, setAncre] = useState<null | HTMLElement>(null);

  // Une référence par document : react-to-print lit le contenu au moment du clic,
  // avant qu'un changement d'état n'ait eu le temps d'être appliqué. Partager une
  // seule référence imprimerait le document précédemment sélectionné.
  const referenceClasses = useRef<HTMLDivElement>(null);
  const referenceMoniteurs = useRef<HTMLDivElement>(null);
  const referenceEnfants = useRef<HTMLDivElement>(null);
  const referenceActivites = useRef<HTMLDivElement>(null);
  const referenceFiche = useRef<HTMLDivElement>(null);
  const referenceIdentification = useRef<HTMLDivElement>(null);
  const referenceInscription = useRef<HTMLDivElement>(null);

  const references = {
    classes: referenceClasses,
    moniteurs: referenceMoniteurs,
    enfants: referenceEnfants,
    activites: referenceActivites,
  };

  const titres = {
    classes: 'Liste des classes',
    moniteurs: 'Liste des moniteurs',
    enfants: 'Liste des enfants',
    activites: 'Programme des activités',
  };

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
        {(['classes', 'moniteurs', 'enfants', 'activites'] as const).map((cible) => (
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
            <table style={styleTableau}>
                <thead>
                  <tr>
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

        <div ref={referenceActivites}>
          <PrintDocumentLayout title={titres.activites} orientation="portrait">
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
