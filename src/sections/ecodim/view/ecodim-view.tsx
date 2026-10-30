import type { IReduxState } from 'src/store/store';

import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import { useRef, useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import Grid from '@mui/material/Unstable_Grid2';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import Checkbox from '@mui/material/Checkbox';
import Autocomplete from '@mui/material/Autocomplete';
import FormControlLabel from '@mui/material/FormControlLabel';
import TableRow from '@mui/material/TableRow';
import MenuItem from '@mui/material/MenuItem';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CardContent from '@mui/material/CardContent';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import InputAdornment from '@mui/material/InputAdornment';
import {
  AddRounded,
  EventRounded,
  FactCheckRounded,
  SavingsRounded,
  TableChartRounded,
  PhotoCameraRounded,
  PersonRounded,
  MenuBookRounded,
  GradeRounded,
  CloseRounded,
  SearchRounded,
  SchoolRounded,
  GroupsRounded,
  ChildCareRounded,
} from '@mui/icons-material';

import { alpha } from '@mui/material/styles';

import { DashboardContent } from 'src/layouts/dashboard';
import { varAlpha } from 'src/theme/styles';
import { apiClient, buildEcodimMediaUrl, getApiErrorMessage } from 'src/utils/apiClient';
import { getSessionUser, getScopeUserIdFromUser, isDesktopAppRuntime } from 'src/utils/access-control';
import { subscribeToCommunauteEvent } from 'src/utils/socket-client';

import ConfirmDialog from 'src/components/alert/confirmDialog';
import { useNotificationSnackbar } from 'src/components/alert/notificationSnackbar';
import { SelectRecherche } from 'src/components/select-recherche';
import { formaterDateHeure } from 'src/utils/format-date';
import { getPhotoUrl } from 'src/sections/user/utils';

import { EcodimPrint } from '../etats/ecodim-print';
import { CulteEditorDialog } from './culte-editor-dialog';
import { SelecteurMembre } from './selecteur-membre';
import { ClassesDuMoniteur } from './classes-du-moniteur';
import { AssiduiteGrille } from './assiduite-grille';
import { FinancesGrille } from './finances-grille';
import { InscriptionQrEnfant } from './inscription-qr-enfant';
import { EvaluationsGrille } from './evaluations-grille';
import { RowActions } from './row-actions';
import { GalerieActivite, ActiviteImagesDialog } from './activite-images-dialog';
import { exporterEcodimExcel } from '../etats/ecodim-excel';
import { FicheSuiviEnfant, FICHE_SUIVI_PAGE_STYLE } from '../etats/fiche-suivi-enfant';
import {
  FicheInscriptionEnfant,
  FICHE_INSCRIPTION_PAGE_STYLE,
} from '../etats/fiche-inscription-enfant';
import {
  FormulaireIdentificationEnfant,
  FICHE_IDENTIFICATION_PAGE_STYLE,
} from '../etats/formulaire-identification-enfant';
import {
  FONCTIONS_MONITEUR,
  CATEGORIES_SORTIE,
  TYPES_EVALUATION,
  estInscrit,
  libelleSexe,
  nomIntervenant,
  PERSONNES_REFERENTES,
  REPONSES_CONVERSION,
  SITUATIONS_SOCIALES,
  libelleFonction,
} from '../constantes';

// ----------------------------------------------------------------------

type Classe = {
  idClasseEcodim: number;
  libelleClasse: string;
  trancheAge: string;
  ageMin: number | null;
  ageMax: number | null;
  descriptionClasse: string;
  actifClasse: number;
  nombreEnfants?: number;
  nombreMoniteurs?: number;
};

type Moniteur = {
  idMoniteur: number;
  idMembre: number;
  idClasseEcodim: number | null;
  estPrincipal: number;
  estResponsable?: number;
  classes?: { idClasseEcodim: number; estPrincipal?: number; libelleClasse?: string }[];
  fonctionMoniteur?: string;
  dateAffectation: string | null;
  actifMoniteur: number;
  nomMembre?: string;
  prenomMembre?: string;
  contactMembre?: string;
  libelleClasse?: string;
};

/**
 * Nom affiché d'un moniteur.
 *
 * Déclarée au niveau du module parce qu'elle ne dépend d'aucun état. Définie
 * dans le composant, elle se retrouvait APRÈS les filtres qui l'appellent, et
 * le premier rendu levait une erreur de zone morte. Le compilateur ne la voyait
 * pas : l'appel a lieu dans une fonction imbriquée, où il ne vérifie plus
 * l'ordre des déclarations.
 */
const nomComplet = (moniteur: Moniteur) =>
  `${moniteur.nomMembre || ''} ${moniteur.prenomMembre || ''}`.trim() || 'Membre introuvable';

type Enfant = {
  idEnfantEcodim: number;
  nomEnfant: string;
  prenomEnfant: string;
  sexeEnfant: string;
  lieuHabitationEnfant?: string;
  photoEnfant?: string;
  dateNaissEnfant: string | null;
  niveauScolaireEnfant: string;
  nomParentEnfant: string;
  contactParentEnfant: string;
  idClasseEcodim: number | null;
  actifEnfant: number;
  libelleClasse?: string;
};

type Activite = {
  idActiviteEcodim: number;
  titreActivite: string;
  typeActivite: string;
  lieuActivite: string;
  dateDebutActivite: string | null;
  heureDebutActivite: string;
  heureFinActivite: string;
  idClasseEcodim: number | null;
  statutActivite: string;
  idMoniteurDirigeant?: number | null;
  idMoniteurEnseignant?: number | null;
  textesBibliques?: string;
  nombreFilles?: number | null;
  nombreGarcons?: number | null;
  nombreMoniteurs?: number | null;
  nomDirigeant?: string;
  prenomDirigeant?: string;
  nomEnseignant?: string;
  prenomEnseignant?: string;
  libelleClasse?: string;
};

// Statuts stockes en base, volontairement sans accent : l'affichage passe par ce
// dictionnaire, comme pour les statuts de l'agenda.
const LIBELLES_STATUT: Record<string, string> = {
  Planifiee: 'Planifiée',
  EnCours: 'En cours',
  Terminee: 'Terminée',
  Annulee: 'Annulée',
};

/**
 * Année ecclésiastique en cours, au format « 2026-2027 ».
 *
 * Elle démarre en septembre : saisir une évaluation en octobre 2026 relève de
 * l'année 2026-2027, mais une évaluation de mars 2027 aussi.
 */
const anneeEcclesiastiqueCourante = (): string => {
  const maintenant = new Date();
  const debut =
    maintenant.getMonth() >= 8 ? maintenant.getFullYear() : maintenant.getFullYear() - 1;

  return `${debut}-${debut + 1}`;
};

const evaluationVide = {
  idEvaluation: null as number | null,
  libelleEvaluation: '',
  typeEvaluation: 'Locale',
  classesEvaluation: [] as number[],
  dateEvaluation: '',
  coefficient: '1',
  noteSur: '20',
  anneeEcclesiastique: anneeEcclesiastiqueCourante(),
};

const activiteVide = {
  idActiviteEcodim: null as number | null,
  titreActivite: '',
  typeActivite: '',
  descriptionActivite: '',
  lieuActivite: '',
  dateDebutActivite: '',
  dateFinActivite: '',
  heureDebutActivite: '',
  heureFinActivite: '',
  idClasseEcodim: '',
  idMoniteurDirigeant: '',
  idMoniteurEnseignant: '',
  textesBibliques: '',
  nombreFilles: '',
  nombreGarcons: '',
  nombreMoniteurs: '',
  statutActivite: 'Planifiee',
};

// Les volets, dans l'ordre des onglets. L'index sert aussi bien à la carte
// qu'à l'onglet et au bouton d'ajout : une seule source, aucune divergence possible.
/** Mois, pour le filtre de période. L'index + 1 donne la valeur « 01 » à « 12 ». */
const MOIS_LIBELLES = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
];

const CARTES = [
  {
    libelle: 'Classes',
    ajout: 'Ajouter une classe',
    couleur: 'primary' as const,
    icone: <SchoolRounded />,
  },
  {
    libelle: 'Moniteurs',
    ajout: 'Ajouter un moniteur',
    couleur: 'secondary' as const,
    icone: <GroupsRounded />,
  },
  {
    libelle: 'Enfants',
    ajout: 'Ajouter un enfant',
    couleur: 'success' as const,
    icone: <ChildCareRounded />,
  },
  {
    libelle: 'Cultes',
    ajout: 'Ajouter un culte',
    couleur: 'info' as const,
    icone: <MenuBookRounded />,
  },
  {
    libelle: 'Évaluations',
    ajout: 'Ajouter une évaluation',
    couleur: 'error' as const,
    icone: <GradeRounded />,
  },
  {
    libelle: 'Activités',
    ajout: 'Ajouter une activité',
    couleur: 'warning' as const,
    icone: <EventRounded />,
  },
  {
    libelle: 'Assiduité',
    // Rien à ajouter ici : l'assiduité se saisit dans la grille, séance par
    // séance. Un libellé vide masque le bouton « + » de la carte comme celui
    // de l'en-tête, sans rompre la correspondance carte / onglet.
    ajout: '',
    couleur: 'info' as const,
    icone: <FactCheckRounded />,
  },
  {
    // Cet onglet est volontairement ajouté EN DERNIER : les positions servent
    // d'identifiants dans tout l'écran (`onglet === 3`, `onglet === 6`...), et
    // l'insérer au milieu décalerait tous les onglets suivants.
    libelle: 'Finances',
    ajout: 'Ajouter un mouvement',
    couleur: 'success' as const,
    icone: <SavingsRounded />,
  },
];

/**
 * Les filtres qui agissent réellement sur chaque onglet, dans l'ordre de CARTES.
 *
 * Tous les onglets affichaient les quatre mêmes filtres. Or un mois ne veut
 * rien dire pour une classe, et un moniteur rien pour la caisse : la liste ne
 * bougeait pas, et on cherchait pourquoi. Un filtre qui ne change rien là où il
 * est posé est une promesse que l'écran ne tient pas.
 *
 * Cette table décide seulement de ce qui est AFFICHÉ. Ce qui est appliqué reste
 * décidé par chaque liste : les cartes du haut comptent les sept volets à la
 * fois, et la carte Cultes doit suivre le mois même quand on regarde l'onglet
 * des classes.
 */
const FILTRES_PAR_ONGLET: ('classe' | 'periode' | 'moniteur' | 'inscription')[][] = [
  ['classe'], // Classes
  ['classe', 'moniteur'], // Moniteurs
  ['classe', 'inscription'], // Enfants
  ['classe', 'periode', 'moniteur'], // Cultes
  [], // Évaluations : la grille porte ses propres filtres
  ['classe', 'periode', 'moniteur'], // Activités
  [], // Assiduité : la grille porte ses propres filtres
  ['periode'], // Finances
];

/**
 * Libellé de la tranche d'âge, déduit des deux bornes.
 *
 * Il était saisi à la main en plus des bornes, ce qui revenait à écrire deux fois la
 * même information : rien n'empêchait alors d'afficher « 3 à 6 ans » au-dessus de 7
 * et 10. Les bornes font foi, le libellé n'en est que la mise en forme.
 */
const construireTrancheAge = (
  ageMin: number | string | null,
  ageMax: number | string | null
): string => {
  const min = ageMin === '' || ageMin === null ? null : Number(ageMin);
  const max = ageMax === '' || ageMax === null ? null : Number(ageMax);
  const minValide = min !== null && !Number.isNaN(min);
  const maxValide = max !== null && !Number.isNaN(max);

  if (minValide && maxValide) return `${min} à ${max} ans`;
  if (minValide) return `${min} ans et plus`;
  if (maxValide) return `Jusqu'à ${max} ans`;
  return '';
};

const formaterDate = (date?: string | null): string => {
  if (!date) return '—';

  const valeur = new Date(date);
  if (Number.isNaN(valeur.getTime())) return String(date);

  return valeur.toLocaleDateString('fr-FR');
};

const classeVide = {
  idClasseEcodim: null as number | null,
  libelleClasse: '',
  ageMin: '',
  ageMax: '',
  descriptionClasse: '',
};

const moniteurVide = {
  idMoniteur: null as number | null,
  idMembre: '',
  classesEncadrees: [] as { idClasseEcodim: number; estPrincipal?: number }[],
  fonctionMoniteur: '',
  dateAffectation: '',
};

const enfantVide = {
  idEnfantEcodim: null as number | null,
  nomEnfant: '',
  prenomEnfant: '',
  sexeEnfant: '',
  dateNaissEnfant: '',
  lieuNaissEnfant: '',
  lieuHabitationEnfant: '',
  numeroAppartement: '',
  contactEnfant: '',
  photoEnfant: '',

  nomPere: '',
  prenomPere: '',
  lieuHabitationPere: '',
  professionPere: '',
  contactPere: '',
  pereConverti: '',

  nomMere: '',
  prenomMere: '',
  lieuHabitationMere: '',
  professionMere: '',
  contactMere: '',
  mereConverti: '',

  religionParents: '',
  religionPere: '',
  religionMere: '',
  tuteurConverti: '',
  vitAvec: '',

  // Fiche d'inscription du département enfants.
  groupeEcodimEnfant: '',
  ecoleEnfant: '',
  avecQuiVientEglise: '',
  responsabiliteTuteurEglise: '',
  professionTuteur: '',

  // 0 ou 1, comme la colonne : l'enfant relu du serveur arrive sous cette forme.
  inscritEcodim: 0,
  dateInscriptionEcodim: '',

  dateEntreeEcodim: '',
  niveauEntreeEcodim: '',
  niveauActuelEcodim: '',
  dateBaptemeEsprit: '',
  lieuBaptemeEsprit: '',
  dateSortieEcodim: '',
  motifSortieEcodim: '',
  categorieSortieEcodim: '',

  situationSociale: '',
  precisionSituationSociale: '',

  dateDepart: '',
  motifDepart: '',
  niveauScolaireEnfant: '',
  activiteEnfant: '',
  nomParentEnfant: '',
  contactParentEnfant: '',
  emailParentEnfant: '',
  adresseParentEnfant: '',
  idClasseEcodim: '',
};

// L'âge se déduit de la date de naissance : une donnée saisie deux fois finit
// toujours par diverger.
const calculerAge = (dateNaissance?: string | null): string => {
  if (!dateNaissance) return '—';

  const naissance = new Date(dateNaissance);
  if (Number.isNaN(naissance.getTime())) return '—';

  const maintenant = new Date();
  let age = maintenant.getFullYear() - naissance.getFullYear();
  const mois = maintenant.getMonth() - naissance.getMonth();

  if (mois < 0 || (mois === 0 && maintenant.getDate() < naissance.getDate())) {
    age -= 1;
  }

  return age >= 0 ? `${age} ans` : '—';
};

const contient = (valeur: unknown, recherche: string): boolean =>
  String(valeur ?? '')
    .toLowerCase()
    .includes(recherche);

// ----------------------------------------------------------------------

export function EcodimView() {
  const sessionUser = useSelector((state: IReduxState) => getSessionUser(state));
  const listMembre = useSelector((state: IReduxState) => (state as any).membre?.listMembre || []);
  const idUtilisateur = getScopeUserIdFromUser(sessionUser) || 0;
  const navigate = useNavigate();
  const isDesktopApp = isDesktopAppRuntime();
  const { showNotification, NotificationComponent } = useNotificationSnackbar();

  const [onglet, setOnglet] = useState(0);
  const [page, setPage] = useState(0);
  const [lignesParPage, setLignesParPage] = useState(5);
  const [cultes, setCultes] = useState<any[]>([]);
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [presences, setPresences] = useState<any[]>([]);
  /** Mouvements de la caisse du département : recettes et dépenses. */
  const [finances, setFinances] = useState<any[]>([]);
  /** Compteur d'ouvertures demandées au dialogue de saisie de la caisse. */
  const [demandeAjoutFinance, setDemandeAjoutFinance] = useState(0);
  const [culteEnEdition, setCulteEnEdition] = useState<any | null>(null);
  const [editeurCulteOuvert, setEditeurCulteOuvert] = useState(false);
  const [recherche, setRecherche] = useState('');
  // Filtres partagés : ils s’appliquent à tous les volets qui portent la
  // dimension concernée, et aux cartes du haut. Une chaîne vide vaut « tout ».
  const [classeFiltre, setClasseFiltre] = useState('');
  const [moisFiltre, setMoisFiltre] = useState('');
  const [anneeFiltre, setAnneeFiltre] = useState('');
  const [moniteurFiltre, setMoniteurFiltre] = useState('');
  // « inscrits », « non-inscrits » ou vide. Ne concerne que les enfants.
  const [inscriptionFiltre, setInscriptionFiltre] = useState('');
  const [classes, setClasses] = useState<Classe[]>([]);
  const [moniteurs, setMoniteurs] = useState<Moniteur[]>([]);
  const [enfants, setEnfants] = useState<Enfant[]>([]);
  const [activites, setActivites] = useState<Activite[]>([]);
  const [chargement, setChargement] = useState(false);

  // Le store n'est rempli qu'après un passage par l'onglet Membre. Sans ce repli, la
  // liste déroulante des moniteurs serait vide pour qui ouvre Ecodim en premier.
  const [membresCharges, setMembresCharges] = useState<any[]>([]);
  const membres = (listMembre as any[]).length ? (listMembre as any[]) : membresCharges;

  const [formClasse, setFormClasse] = useState(classeVide);
  const [formMoniteur, setFormMoniteur] = useState(moniteurVide);
  const [formEnfant, setFormEnfant] = useState(enfantVide);
  const [formActivite, setFormActivite] = useState(activiteVide);
  const [formEvaluation, setFormEvaluation] = useState<any>(evaluationVide);
  const [dialogue, setDialogue] = useState<
    'classe' | 'moniteur' | 'enfant' | 'activite' | 'evaluation' | null
  >(null);
  const [enregistrement, setEnregistrement] = useState(false);
  const [activiteImages, setActiviteImages] = useState<any | null>(null);
  const [suppression, setSuppression] = useState<{ type: string; libelle: string; action: () => Promise<void> } | null>(null);

  const charger = useCallback(async () => {
    if (!idUtilisateur) {
      setClasses([]);
      setMoniteurs([]);
      setEnfants([]);
      setCultes([]);
      setEvaluations([]);
      setNotes([]);
      setPresences([]);
      setFinances([]);
      return;
    }

    try {
      setChargement(true);
      // allSettled : un volet vide ou en erreur ne doit pas vider les deux autres.
      const [
        classesRes,
        moniteursRes,
        enfantsRes,
        activitesRes,
        cultesRes,
        evaluationsRes,
        notesRes,
        presencesRes,
        financesRes,
      ] = await Promise.allSettled([
          apiClient.getClassesEcodim(idUtilisateur),
          apiClient.getMoniteursEcodim(idUtilisateur),
          apiClient.getEnfantsEcodim(idUtilisateur),
          apiClient.getActivitesEcodim(idUtilisateur),
          apiClient.getCultesEcodim(idUtilisateur),
          apiClient.getEvaluationsEcodim(idUtilisateur),
          apiClient.getNotesEcodim(idUtilisateur),
          apiClient.getPresencesEcodim(idUtilisateur),
          apiClient.getFinancesEcodim(idUtilisateur),
        ]);

      const extraire = (resultat: PromiseSettledResult<any>): any[] =>
        resultat.status === 'fulfilled' && Array.isArray(resultat.value?.data)
          ? resultat.value.data
          : [];

      setClasses(extraire(classesRes));
      setMoniteurs(extraire(moniteursRes));
      setEnfants(extraire(enfantsRes));
      setActivites(extraire(activitesRes));
      setCultes(extraire(cultesRes));
      setEvaluations(extraire(evaluationsRes));
      setNotes(extraire(notesRes));
      setPresences(extraire(presencesRes));
      setFinances(extraire(financesRes));
    } finally {
      setChargement(false);
    }
  }, [idUtilisateur]);

  useEffect(() => {
    charger();
  }, [charger]);

  useEffect(() => {
    if (!idUtilisateur || (listMembre as any[]).length) {
      return;
    }

    apiClient
      .getMembresByUtilisateur(idUtilisateur)
      .then((reponse) => {
        setMembresCharges(Array.isArray(reponse?.data) ? reponse.data : []);
      })
      // Une église sans membre répond 400 "Aucun membre trouvé" : c'est une liste vide,
      // pas une panne.
      .catch(() => setMembresCharges([]));
  }, [idUtilisateur, listMembre]);

  // Les écrans ouverts sur d'autres postes se mettent à jour sans rechargement.
  useEffect(() => {
    const evenements = [
      'ajouterClasseEcodim', 'modifierClasseEcodim', 'supprimerClasseEcodim',
      'ajouterMoniteurEcodim', 'modifierMoniteurEcodim', 'supprimerMoniteurEcodim',
      'ajouterEnfantEcodim', 'modifierEnfantEcodim', 'supprimerEnfantEcodim',
      'ajouterActiviteEcodim', 'modifierActiviteEcodim', 'supprimerActiviteEcodim',
    ];

    const abonnements = evenements.map((evenement) =>
      subscribeToCommunauteEvent(evenement, (charge: any) => {
        if (!charge?.idUtilisateur || Number(charge.idUtilisateur) === Number(idUtilisateur)) {
          charger();
        }
      })
    );

    return () => abonnements.forEach((desabonner) => desabonner());
  }, [charger, idUtilisateur]);

  const terme = recherche.trim().toLowerCase();

  /** Une date tombe-t-elle dans le mois et l’année retenus ? */
  const dansLaPeriode = useCallback(
    (valeur?: string | null): boolean => {
      if (!moisFiltre && !anneeFiltre) return true;

      const jour = String(valeur || '').slice(0, 10);
      // Sans date, la ligne ne peut pas être située : la filtrer sur une
      // période reviendrait à affirmer qu’elle n’y est pas.
      if (!jour) return false;

      const [annee, mois] = jour.split('-');

      return (!anneeFiltre || annee === anneeFiltre) && (!moisFiltre || mois === moisFiltre);
    },
    [moisFiltre, anneeFiltre]
  );

  /**
   * Les années présentes dans les données, pour ne proposer que du réel.
   *
   * La liste n'est pas une plage calculée mais le relevé des dates réellement
   * enregistrées : proposer une année sans aucune ligne donnerait un tableau
   * vide sans que rien n'explique pourquoi.
   *
   * Toute source datée sur laquelle le filtre de période agit doit figurer
   * ici — sinon son année n'est jamais proposée, et ses lignes deviennent
   * infiltrables.
   */
  const anneesDisponibles = useMemo(() => {
    const annees = new Set<string>();

    const ajouter = (valeur?: string | null) => {
      const annee = String(valeur || '').slice(0, 4);
      if (/^\d{4}$/.test(annee)) annees.add(annee);
    };

    cultes.forEach((culte) => ajouter(culte.dateCulte));
    activites.forEach((activite) => ajouter(activite.dateDebutActivite));
    evaluations.forEach((evaluation) => ajouter(evaluation.dateEvaluation));
    finances.forEach((finance) => ajouter(finance.dateFinance));

    return Array.from(annees).sort().reverse();
  }, [cultes, activites, evaluations, finances]);

  /** Le moniteur retenu dirige-t-il ou enseigne-t-il cette séance ? */
  const intervientDans = useCallback(
    (idDirigeant?: number | null, idEnseignant?: number | null): boolean =>
      !moniteurFiltre ||
      String(idDirigeant || '') === moniteurFiltre ||
      String(idEnseignant || '') === moniteurFiltre,
    [moniteurFiltre]
  );

  const reinitialiserFiltres = useCallback(() => {
    setRecherche('');
    setClasseFiltre('');
    setMoisFiltre('');
    setAnneeFiltre('');
    setMoniteurFiltre('');
    setInscriptionFiltre('');
    setPage(0);
  }, []);

  /**
   * Les filtres en cours, pour les afficher et les retirer un par un.
   *
   * Ils restent visibles sur les onglets où la barre est masquée : un filtre
   * qui réduit les cartes sans apparaître nulle part se lirait comme une
   * erreur de calcul.
   */
  const filtresActifs = useMemo(() => {
    const actifs: { cle: string; libelle: string; retirer: () => void }[] = [];

    if (recherche.trim()) {
      actifs.push({
        cle: 'recherche',
        libelle: `« ${recherche.trim()} »`,
        retirer: () => setRecherche(''),
      });
    }

    if (classeFiltre) {
      const classe = classes.find(
        (element) => String(element.idClasseEcodim) === classeFiltre
      );
      actifs.push({
        cle: 'classe',
        libelle: classe?.libelleClasse || `Classe ${classeFiltre}`,
        retirer: () => setClasseFiltre(''),
      });
    }

    if (moisFiltre) {
      actifs.push({
        cle: 'mois',
        libelle: MOIS_LIBELLES[Number(moisFiltre) - 1] || moisFiltre,
        retirer: () => setMoisFiltre(''),
      });
    }

    if (anneeFiltre) {
      actifs.push({ cle: 'annee', libelle: anneeFiltre, retirer: () => setAnneeFiltre('') });
    }

    if (moniteurFiltre) {
      const moniteur = moniteurs.find(
        (element) => String(element.idMoniteur) === moniteurFiltre
      );
      actifs.push({
        cle: 'moniteur',
        libelle: moniteur ? nomComplet(moniteur) : `Moniteur ${moniteurFiltre}`,
        retirer: () => setMoniteurFiltre(''),
      });
    }

    if (inscriptionFiltre) {
      actifs.push({
        cle: 'inscription',
        libelle: inscriptionFiltre === 'inscrits' ? 'Enfants inscrits' : 'Enfants non inscrits',
        retirer: () => setInscriptionFiltre(''),
      });
    }

    return actifs;
  }, [
    recherche,
    classeFiltre,
    moisFiltre,
    anneeFiltre,
    moniteurFiltre,
    inscriptionFiltre,
    classes,
    moniteurs,
  ]);

  /** Les filtres montrés sur l'onglet courant. */
  const filtresDeLOnglet = FILTRES_PAR_ONGLET[onglet] || [];

  /** Les classes d’un moniteur, telles que le serveur les joint. */
  const classesDuMoniteur = (moniteur: any): string[] =>
    (Array.isArray(moniteur?.classes) ? moniteur.classes : []).map((lien: any) =>
      String(lien.idClasseEcodim)
    );

  const classesFiltrees = useMemo(
    () =>
      classes.filter(
        (classe) =>
          (!classeFiltre || String(classe.idClasseEcodim) === classeFiltre) &&
          (!terme ||
            contient(classe.libelleClasse, terme) ||
            contient(classe.trancheAge, terme) ||
            contient(construireTrancheAge(classe.ageMin, classe.ageMax), terme))
      ),
    [classes, terme, classeFiltre]
  );

  const moniteursFiltres = useMemo(
    () =>
      moniteurs.filter(
        (moniteur) =>
          (!classeFiltre || classesDuMoniteur(moniteur).includes(classeFiltre)) &&
          (!moniteurFiltre || String(moniteur.idMoniteur) === moniteurFiltre) &&
          (!terme ||
            contient(moniteur.nomMembre, terme) ||
            contient(moniteur.prenomMembre, terme) ||
            contient(moniteur.libelleClasse, terme) ||
            contient(libelleFonction(moniteur.fonctionMoniteur), terme))
      ),
    [moniteurs, terme, classeFiltre, moniteurFiltre]
  );

  const enfantsFiltres = useMemo(
    () =>
      enfants.filter(
        (enfant) =>
          (!classeFiltre || String(enfant.idClasseEcodim) === classeFiltre) &&
          (!inscriptionFiltre ||
            estInscrit(enfant) === (inscriptionFiltre === 'inscrits')) &&
          (!terme ||
            // Le matricule d'abord : c'est l'identifiant qu'on reçoit par
            // téléphone, et le seul qui ne laisse aucun doute entre homonymes.
            contient((enfant as any).matriculeEnfant, terme) ||
            contient(enfant.nomEnfant, terme) ||
            contient(enfant.prenomEnfant, terme) ||
            contient(enfant.libelleClasse, terme) ||
            contient(enfant.nomParentEnfant, terme))
      ),
    [enfants, terme, classeFiltre, inscriptionFiltre]
  );

  // Totaux des cartes, dans l'ordre exact de CARTES. Les deux listes doivent rester
  // alignées : c'est la seule chose qui les relie.
  /** Les lignes d'une page. Le même découpage pour les cinq onglets. */
  const pageDe = useCallback(
    <T,>(liste: T[]): T[] => liste.slice(page * lignesParPage, page * lignesParPage + lignesParPage),
    [page, lignesParPage]
  );


  const cultesFiltres = useMemo(
    () =>
      cultes.filter(
        (culte) =>
          (!classeFiltre || String(culte.idClasseEcodim) === classeFiltre) &&
          dansLaPeriode(culte.dateCulte) &&
          intervientDans(culte.idMoniteurDirigeant, culte.idMoniteurEnseignant) &&
          (!terme ||
          contient(culte.libelleClasse, terme) ||
          contient(culte.leconDuJour, terme) ||
          contient(culte.passageBiblique, terme) ||
          contient(
            nomIntervenant(culte.nomDirigeant, culte.prenomDirigeant, culte.nomDirigeantExterne),
            terme
          ) ||
          contient(
            nomIntervenant(culte.nomEnseignant, culte.prenomEnseignant, culte.nomEnseignantExterne),
            terme
          ) ||
            contient(formaterDate(culte.dateCulte), terme))
      ),
    [cultes, terme, classeFiltre, dansLaPeriode, intervientDans]
  );

  const activitesFiltrees = useMemo(
    () =>
      activites.filter(
        (activite) =>
          // Choisir une classe ne montre que SES activités. Les activités
          // ouvertes à toute l'école concernent certes cette classe, mais on
          // les cherche sous « Toutes les classes », pas sous « Cadet ».
          (!classeFiltre || String(activite.idClasseEcodim) === classeFiltre) &&
          dansLaPeriode(activite.dateDebutActivite) &&
          intervientDans(activite.idMoniteurDirigeant, activite.idMoniteurEnseignant) &&
          (!terme ||
            contient(activite.titreActivite, terme) ||
            contient(activite.typeActivite, terme) ||
            contient(activite.lieuActivite, terme) ||
            contient(activite.libelleClasse, terme))
      ),
    [activites, terme, classeFiltre, dansLaPeriode, intervientDans]
  );

  /**
   * Mouvements de caisse retenus : la période et la recherche, rien d'autre.
   *
   * La classe n'entre pas en compte, et c'est délibéré. La caisse est celle du
   * département : la plupart des mouvements ne visent aucune classe en
   * particulier, et filtrer dessus donnerait un solde qui n'est celui de
   * personne. Comme le filtre de classe reste posé d'un onglet à l'autre, il ne
   * doit pas non plus agir ici en coulisse alors qu'il n'y est plus affiché.
   */
  const financesFiltrees = useMemo(
    () =>
      finances.filter(
        (finance) =>
          dansLaPeriode(finance.dateFinance) &&
          (!terme ||
            contient(finance.libelleFinance, terme) ||
            contient(finance.categorieFinance, terme) ||
            contient(finance.observationFinance, terme) ||
            contient(finance.libelleClasse, terme) ||
            contient(finance.titreActivite, terme) ||
            contient(formaterDate(finance.dateFinance), terme))
      ),
    [finances, terme, dansLaPeriode]
  );

  /** Évaluations retenues : le filtre de classe passe par leurs rattachements. */
  const evaluationsFiltrees = useMemo(
    () =>
      evaluations.filter((evaluation) => {
        const classesLiees = (Array.isArray(evaluation.classes) ? evaluation.classes : []).map(
          (valeur: any) => String(valeur?.idClasseEcodim ?? valeur)
        );

        return (
          (!classeFiltre || classesLiees.includes(classeFiltre)) &&
          dansLaPeriode(evaluation.dateEvaluation) &&
          (!terme ||
            contient(evaluation.libelleEvaluation, terme) ||
            contient(evaluation.typeEvaluation, terme))
        );
      }),
    [evaluations, terme, classeFiltre, dansLaPeriode]
  );

  /** Séances appelées retenues : une présence suit le culte auquel elle tient. */
  const seancesAppelees = useMemo(() => {
    const cultesRetenus = new Set(
      cultes
        .filter(
          (culte) =>
            (!classeFiltre || String(culte.idClasseEcodim) === classeFiltre) &&
            dansLaPeriode(culte.dateCulte)
        )
        .map((culte) => Number(culte.idCulteEcodim))
    );

    return new Set(
      presences
        .map((presence) => Number(presence.idCulteEcodim))
        .filter((identifiant) => cultesRetenus.has(identifiant))
    ).size;
  }, [cultes, presences, classeFiltre, dansLaPeriode]);

  // Totaux des cartes : ceux des listes FILTRÉES, et non des données brutes.
  // Un filtre qui réduit le tableau sans bouger le chiffre au-dessus donne deux
  // réponses différentes à la même question, sur le même écran.
  const totauxCartes = useMemo(
    () => [
      classesFiltrees.length,
      moniteursFiltres.length,
      enfantsFiltres.length,
      cultesFiltres.length,
      evaluationsFiltrees.length,
      activitesFiltrees.length,
      // Séances dont l'appel a été fait : le nombre de lignes de présence ne
      // voudrait rien dire, il grandit avec l'effectif de la classe.
      seancesAppelees,
      // Pour la caisse, le nombre de mouvements. Le solde a sa place sur la
      // grille elle-même, où il tient en toutes lettres avec sa devise ; réduit
      // au chiffre nu d'une carte, il se confondrait avec un effectif.
      financesFiltrees.length,
    ],
    [
      classesFiltrees,
      moniteursFiltres,
      enfantsFiltres,
      cultesFiltres,
      evaluationsFiltrees,
      activitesFiltrees,
      seancesAppelees,
      financesFiltrees,
    ]
  );

  const nombreLignesCourantes = [
    classesFiltrees.length,
    moniteursFiltres.length,
    enfantsFiltres.length,
    cultesFiltres.length,
    // L'onglet des évaluations n'est pas une liste paginée mais une grille.
    0,
    activitesFiltrees.length,
    // L'assiduité non plus : elle a ses propres filtres de classe et de mois.
    0,
    // La caisse porte sa propre pagination, comme les deux grilles ci-dessus.
    0,
  ][onglet];

  // Un membre déjà moniteur ne doit pas pouvoir être ajouté une seconde fois.
  const membresDisponibles = useMemo(() => {
    const dejaMoniteurs = new Set(
      moniteurs
        .filter((moniteur) => moniteur.idMoniteur !== formMoniteur.idMoniteur)
        .map((moniteur) => Number(moniteur.idMembre))
    );

    return membres.filter((membre) => !dejaMoniteurs.has(Number(membre.idMembre)));
  }, [membres, moniteurs, formMoniteur.idMoniteur]);

  // Ouvre le formulaire du volet demandé. Partagé par le bouton d'en-tête et par
  // les « + » des cartes, pour qu'ils ne puissent pas diverger.
  const ouvrirFormulaire = useCallback((index: number) => {
    setOnglet(index);
    setPage(0);

    if (index === 0) {
      setFormClasse(classeVide);
      setDialogue('classe');
    } else if (index === 1) {
      setFormMoniteur(moniteurVide);
      setDialogue('moniteur');
    } else if (index === 2) {
      setFormEnfant(enfantVide);
      setDialogue('enfant');
    } else if (index === 3) {
      // Le cahier de texte s'ouvre en plein écran, pas dans une boîte de dialogue.
      setCulteEnEdition(null);
      setEditeurCulteOuvert(true);
    } else if (index === 4) {
      setFormEvaluation(evaluationVide);
      setDialogue('evaluation');
    } else if (index === 5) {
      setFormActivite(activiteVide);
      setDialogue('activite');
    } else if (index === 7) {
      // La caisse a son propre dialogue, porté par sa grille. On l'ouvre en
      // incrémentant un compteur plutôt qu'en posant un booléen : deux clics
      // successifs sur le « + » doivent rouvrir la saisie, ce qu'un booléen
      // déjà à vrai ne ferait pas.
      setDemandeAjoutFinance((precedent) => precedent + 1);
    }

    // L'assiduité n'ouvre aucun formulaire : l'appel se saisit dans la grille.
  }, []);

  /**
   * Volet exporté par le bouton Excel : celui qui est affiché.
   *
   * Les évaluations et l'assiduité n'y figurent pas. Leurs grilles ont leur
   * propre export, qui suit les filtres de classe et de période affichés ;
   * exporter depuis l'en-tête donnerait des chiffres différents de ceux qu'on a
   * sous les yeux. Le bouton disparaît donc sur ces deux onglets.
   */
  const voletExportable = (
    ['classes', 'moniteurs', 'enfants', 'cultes', null, 'activites', null, 'finances'] as const
  )[onglet];

  const apresEcriture = useCallback(
    async (message: string) => {
      showNotification(message, 'success');
      setDialogue(null);
      await charger();
    },
    [charger, showNotification]
  );

  const enregistrerClasse = useCallback(async () => {
    if (!formClasse.libelleClasse.trim()) {
      showNotification('Le nom de la classe est requis.', 'warning');
      return;
    }

    try {
      setEnregistrement(true);
      const charge = {
        ...formClasse,
        ageMin: formClasse.ageMin === '' ? null : Number(formClasse.ageMin),
        ageMax: formClasse.ageMax === '' ? null : Number(formClasse.ageMax),
        // Toujours réécrit depuis les bornes : la colonne reste alimentée pour
        // l'impression et l'export, sans pouvoir diverger des nombres.
        trancheAge: construireTrancheAge(formClasse.ageMin, formClasse.ageMax),
        idUtilisateur,
      };

      if (formClasse.idClasseEcodim) {
        await apiClient.updateClasseEcodim(charge);
        await apresEcriture('Classe modifiée.');
      } else {
        await apiClient.createClasseEcodim(charge);
        await apresEcriture('Classe ajoutée.');
      }
    } catch (error) {
      showNotification(getApiErrorMessage(error, "Enregistrement impossible."), 'error');
    } finally {
      setEnregistrement(false);
    }
  }, [apresEcriture, formClasse, idUtilisateur, showNotification]);

  const enregistrerMoniteur = useCallback(async () => {
    if (!formMoniteur.idMembre) {
      showNotification('Choisissez le membre qui sera moniteur.', 'warning');
      return;
    }

    try {
      setEnregistrement(true);
      const charge = {
        ...formMoniteur,
        idMembre: Number(formMoniteur.idMembre),
        // Les rattachements remplacent l'ancienne classe unique.
        classes: formMoniteur.classesEncadrees,
        idUtilisateur,
      };

      if (formMoniteur.idMoniteur) {
        await apiClient.updateMoniteurEcodim(charge);
        await apresEcriture('Moniteur modifié.');
      } else {
        await apiClient.createMoniteurEcodim(charge);
        await apresEcriture('Moniteur ajouté.');
      }
    } catch (error) {
      showNotification(getApiErrorMessage(error, "Enregistrement impossible."), 'error');
    } finally {
      setEnregistrement(false);
    }
  }, [apresEcriture, formMoniteur, idUtilisateur, showNotification]);

  // Fiche de suivi d'un enfant : un seul document monté, rempli à la demande.
  // Imprimer une fiche par ligne monterait autant de documents cachés qu'il y a
  // d'enfants, pour un seul réellement utilisé.
  const [ficheEnfant, setFicheEnfant] = useState<any | null>(null);
  const [identificationEnfant, setIdentificationEnfant] = useState<any | null>(null);
  const [inscriptionEnfant, setInscriptionEnfant] = useState<any | null>(null);
  const referenceFiche = useRef<HTMLDivElement>(null);
  const referenceIdentification = useRef<HTMLDivElement>(null);
  const referenceInscription = useRef<HTMLDivElement>(null);

  const lancerImpressionFiche = useReactToPrint({
    content: () => referenceFiche.current,
    pageStyle: FICHE_SUIVI_PAGE_STYLE,
    onAfterPrint: () => setFicheEnfant(null),
  });

  const lancerImpressionIdentification = useReactToPrint({
    content: () => referenceIdentification.current,
    pageStyle: FICHE_IDENTIFICATION_PAGE_STYLE,
    onAfterPrint: () => setIdentificationEnfant(null),
  });

  const lancerImpressionInscription = useReactToPrint({
    content: () => referenceInscription.current,
    pageStyle: FICHE_INSCRIPTION_PAGE_STYLE,
    onAfterPrint: () => setInscriptionEnfant(null),
  });

  useEffect(() => {
    // L'impression n'est demandée qu'une fois l'enfant posé dans l'état : react-to-print
    // lit le contenu immédiatement, avant tout nouveau rendu.
    if (ficheEnfant) {
      lancerImpressionFiche?.();
    }
  }, [ficheEnfant, lancerImpressionFiche]);

  useEffect(() => {
    if (identificationEnfant) {
      lancerImpressionIdentification?.();
    }
  }, [identificationEnfant, lancerImpressionIdentification]);

  useEffect(() => {
    if (inscriptionEnfant) {
      lancerImpressionInscription?.();
    }
  }, [inscriptionEnfant, lancerImpressionInscription]);

  const ouvrirFicheClasse = useCallback(
    (classe: any) => navigate(`/ecodim/classe/${classe.idClasseEcodim}`),
    [navigate]
  );

  const ouvrirFicheMoniteur = useCallback(
    (moniteur: any) => navigate(`/ecodim/moniteur/${moniteur.idMoniteur}`),
    [navigate]
  );

  const ouvrirFicheEnfant = useCallback(
    (enfant: any) => navigate(`/ecodim/enfant/${enfant.idEnfantEcodim}`),
    [navigate]
  );

  const champPhotoEnfant = useRef<HTMLInputElement>(null);

  /**
   * Source affichable de l'aperçu. Le formulaire porte soit une image fraîchement
   * choisie (base64), soit le nom du fichier déjà stocké : les deux ne se résolvent
   * pas de la même façon.
   */
  const apercuPhotoEnfant = useCallback(
    (valeur?: string) => {
      if (!valeur) return '';
      return valeur.startsWith('data:image/') ? valeur : buildEcodimMediaUrl(valeur);
    },
    []
  );

  const choisirPhotoEnfant = useCallback(
    (fichier?: File | null) => {
      if (!fichier) return;

      if (!fichier.type.startsWith('image/')) {
        showNotification('Choisissez une image (JPG ou PNG).', 'warning');
        return;
      }

      if (fichier.size > 5 * 1024 * 1024) {
        showNotification('La photo ne doit pas dépasser 5 Mo.', 'warning');
        return;
      }

      const lecteur = new FileReader();
      lecteur.onload = () =>
        setFormEnfant((precedent: any) => ({
          ...precedent,
          photoEnfant: String(lecteur.result || ''),
        }));
      lecteur.onerror = () => showNotification("La photo n'a pas pu être lue.", 'error');
      lecteur.readAsDataURL(fichier);

      if (champPhotoEnfant.current) {
        // Sans cette remise à zéro, rechoisir le même fichier ne déclenche rien.
        champPhotoEnfant.current.value = '';
      }
    },
    [showNotification]
  );

  const retirerPhotoEnfant = useCallback(() => {
    setFormEnfant((precedent: any) => ({ ...precedent, photoEnfant: '' }));
  }, []);

  const enregistrerEnfant = useCallback(async () => {
    if (!formEnfant.nomEnfant.trim()) {
      showNotification("Le nom de l'enfant est requis.", 'warning');
      return;
    }

    if (!formEnfant.sexeEnfant) {
      showNotification("Indiquez si l'enfant est un garçon ou une fille.", 'warning');
      return;
    }

    if (estInscrit(formEnfant) && !formEnfant.dateInscriptionEcodim) {
      showNotification("Indiquez la date d'inscription de l'enfant.", 'warning');
      return;
    }

    try {
      setEnregistrement(true);
      const charge = {
        ...formEnfant,
        idClasseEcodim: formEnfant.idClasseEcodim === '' ? null : Number(formEnfant.idClasseEcodim),
        idUtilisateur,
      };

      if (formEnfant.idEnfantEcodim) {
        await apiClient.updateEnfantEcodim(charge);
        await apresEcriture('Enfant modifié.');
      } else {
        await apiClient.createEnfantEcodim(charge);
        await apresEcriture('Enfant ajouté.');
      }
    } catch (error) {
      showNotification(getApiErrorMessage(error, "Enregistrement impossible."), 'error');
    } finally {
      setEnregistrement(false);
    }
  }, [apresEcriture, formEnfant, idUtilisateur, showNotification]);

  const enregistrerActivite = useCallback(async () => {
    if (!formActivite.titreActivite.trim()) {
      showNotification("L'intitulé de l'activité est requis.", 'warning');
      return;
    }

    try {
      setEnregistrement(true);
      const charge = {
        ...formActivite,
        idClasseEcodim:
          formActivite.idClasseEcodim === '' ? null : Number(formActivite.idClasseEcodim),
        idMoniteurDirigeant: formActivite.idMoniteurDirigeant
          ? Number(formActivite.idMoniteurDirigeant)
          : null,
        idMoniteurEnseignant: formActivite.idMoniteurEnseignant
          ? Number(formActivite.idMoniteurEnseignant)
          : null,
        nombreFilles: Number(formActivite.nombreFilles) || 0,
        nombreGarcons: Number(formActivite.nombreGarcons) || 0,
        idUtilisateur,
      };

      if (formActivite.idActiviteEcodim) {
        await apiClient.updateActiviteEcodim(charge);
        await apresEcriture('Activité modifiée.');
      } else {
        await apiClient.createActiviteEcodim(charge);
        await apresEcriture('Activité ajoutée.');
      }
    } catch (error) {
      showNotification(getApiErrorMessage(error, 'Enregistrement impossible.'), 'error');
    } finally {
      setEnregistrement(false);
    }
  }, [apresEcriture, formActivite, idUtilisateur, showNotification]);

  const enregistrerEvaluation = useCallback(async () => {
    if (!formEvaluation.libelleEvaluation.trim()) {
      showNotification("L'intitulé de l'évaluation est requis.", 'warning');
      return;
    }

    if (!formEvaluation.classesEvaluation?.length) {
      showNotification("Choisissez au moins une classe pour l'évaluation.", 'warning');
      return;
    }

    try {
      setEnregistrement(true);
      const charge = {
        ...formEvaluation,
        classes: formEvaluation.classesEvaluation,
        coefficient: Number(formEvaluation.coefficient) || 1,
        noteSur: Number(formEvaluation.noteSur) || 20,
        idUtilisateur,
      };

      if (formEvaluation.idEvaluation) {
        await apiClient.updateEvaluationEcodim(charge);
        await apresEcriture('Évaluation modifiée.');
      } else {
        await apiClient.createEvaluationEcodim(charge);
        await apresEcriture('Évaluation ajoutée.');
      }
    } catch (error) {
      showNotification(getApiErrorMessage(error, 'Enregistrement impossible.'), 'error');
    } finally {
      setEnregistrement(false);
    }
  }, [apresEcriture, formEvaluation, idUtilisateur, showNotification]);

  const confirmerSuppression = useCallback(async () => {
    if (!suppression) return;

    try {
      await suppression.action();
      showNotification('Suppression effectuée.', 'success');
      await charger();
    } catch (error) {
      showNotification(getApiErrorMessage(error, 'Suppression impossible.'), 'error');
    } finally {
      setSuppression(null);
    }
  }, [charger, showNotification, suppression]);

  return (
    <DashboardContent>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ sm: 'center' }}
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h4">Ecodim</Typography>
          <Typography variant="body2" color="text.secondary">
            École du dimanche : classes, moniteurs et enfants.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5}>
          {/* Inscription par QR code : visible aussi en desktop, car c'est ce
              poste qui héberge le backend et affiche le code aux parents. */}
          {onglet === 2 && (
            <InscriptionQrEnfant
              idUtilisateur={idUtilisateur}
              nomEglise={
                (sessionUser as any)?.nomEgliseCourt || (sessionUser as any)?.nomTemple || ''
              }
              classes={classes}
              onEnfantCree={charger}
              showNotification={showNotification}
            />
          )}

          {/* Impression réservée au navigateur, comme partout ailleurs dans le projet. */}
          {/* Export et impression restent réservés au navigateur, comme ailleurs
              dans le projet. */}
          {!isDesktopApp && voletExportable && (
            <Button
              variant="outlined"
              color="success"
              startIcon={<TableChartRounded />}
              onClick={() => {
                // Les listes filtrées, et non les listes complètes : le fichier
                // doit contenir ce que le tableau montre au moment du clic.
                exporterEcodimExcel({
                  volet: voletExportable,
                  classes: classesFiltrees,
                  moniteurs: moniteursFiltres,
                  enfants: enfantsFiltres,
                  activites: activitesFiltrees,
                  cultes: cultesFiltres,
                  finances: financesFiltrees,
                  nomEglise: (sessionUser as any)?.nomEgliseCourt || (sessionUser as any)?.nomTemple,
                });
                showNotification(`Export Excel de « ${CARTES[onglet].libelle} » généré.`, 'success');
              }}
            >
              Excel
            </Button>
          )}

          {!isDesktopApp && (
            <EcodimPrint
              classes={classesFiltrees}
              moniteurs={moniteursFiltres}
              enfants={enfantsFiltres}
              activites={activitesFiltrees}
              finances={financesFiltrees}
              sousTitre={filtresActifs.map((filtre) => filtre.libelle).join(' · ')}
            />
          )}

          {!isDesktopApp && CARTES[onglet].ajout && (
            <Button
              variant="contained"
              startIcon={<AddRounded />}
              onClick={() => ouvrirFormulaire(onglet)}
            >
              {CARTES[onglet].ajout}
            </Button>
          )}
        </Stack>
      </Stack>

      {/* Mêmes cartes que « Cas sociaux » : cliquer dessus change d'onglet, le « + »
          ouvre directement le formulaire correspondant. */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {CARTES.map((carte, index) => (
          <Grid key={carte.libelle} xs={6} sm={4} lg={12 / CARTES.length}>
            <Card
              onClick={() => setOnglet(index)}
              sx={{
                cursor: 'pointer',
                border: (muiTheme) =>
                  `1px solid ${alpha(muiTheme.palette[carte.couleur].main, onglet === index ? 0.35 : 0.12)}`,
                bgcolor: (muiTheme) =>
                  onglet === index
                    ? alpha(muiTheme.palette[carte.couleur].main, 0.08)
                    : muiTheme.palette.background.paper,
              }}
            >
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box sx={{ color: `${carte.couleur}.main`, display: 'flex' }}>{carte.icone}</Box>
                  {!isDesktopApp && carte.ajout && (
                    <Tooltip title={carte.ajout}>
                      <IconButton
                        size="small"
                        color={carte.couleur}
                        onClick={(event) => {
                          // Le clic ne doit pas remonter à la carte, qui se contente
                          // de changer d'onglet.
                          event.stopPropagation();
                          ouvrirFormulaire(index);
                        }}
                        sx={{ border: 1, borderColor: 'divider' }}
                      >
                        <AddRounded fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Stack>
                <Typography variant="h4" sx={{ mt: 1.5 }}>
                  {totauxCartes[index]}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {carte.libelle}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card>
        <Tabs
          value={onglet}
          onChange={(_, valeur) => {
            setOnglet(valeur);
            setPage(0);
          }}
          sx={{ px: 2, pt: 1 }}
        >
          <Tab label="Classes" />
          <Tab label="Moniteurs" />
          <Tab label="Enfants" />
          <Tab label="Cultes" />
          <Tab label="Évaluations" />
          <Tab label="Activités" />
          <Tab label="Assiduité" />
        </Tabs>

        <Divider />

        {/* Les deux grilles — évaluations et assiduité — ont leurs propres filtres
            de classe et de période. La recherche générale n'agit pas sur elles :
            l'afficher là promettrait quelque chose qui ne se produit pas. */}
        {onglet !== 4 && onglet !== 6 && (
          <Box sx={{ p: 2 }}>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={1.5}
              alignItems={{ xs: 'stretch', md: 'center' }}
              useFlexGap
              flexWrap="wrap"
            >
              {/* La recherche ne prend plus toute la largeur : elle en laisse
                  aux filtres, qui répondent à des questions qu’un mot-clé ne
                  sait pas poser — « les cultes de mars », « la classe des
                  Cadets », « les séances de tel moniteur ». */}
              <TextField
                size="small"
                value={recherche}
                onChange={(event) => {
                  setRecherche(event.target.value);
                  setPage(0);
                }}
                placeholder="Rechercher..."
                sx={{ flex: 1, minWidth: 180, maxWidth: { md: 280 } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRounded />
                    </InputAdornment>
                  ),
                }}
              />

              {/* Chaque onglet ne montre que les filtres qui le concernent
                  (voir FILTRES_PAR_ONGLET). */}
              {filtresDeLOnglet.includes('classe') && (
                <SelectRecherche
                  label="Classe"
                  size="small"
                  value={classeFiltre}
                  onChange={(event) => {
                    setClasseFiltre(event.target.value);
                    setPage(0);
                  }}
                  sx={{ minWidth: 170 }}
                >
                  <MenuItem value="">Toutes les classes</MenuItem>
                  {classes.map((classe) => (
                    <MenuItem key={classe.idClasseEcodim} value={String(classe.idClasseEcodim)}>
                      {classe.libelleClasse}
                    </MenuItem>
                  ))}
                </SelectRecherche>
              )}

              {filtresDeLOnglet.includes('inscription') && (
                <SelectRecherche
                  label="Inscription"
                  size="small"
                  value={inscriptionFiltre}
                  onChange={(event) => {
                    setInscriptionFiltre(event.target.value);
                    setPage(0);
                  }}
                  sx={{ minWidth: 170 }}
                >
                  <MenuItem value="">Tous les enfants</MenuItem>
                  <MenuItem value="inscrits">Inscrits</MenuItem>
                  <MenuItem value="non-inscrits">Non inscrits</MenuItem>
                </SelectRecherche>
              )}

              {/* Le mois et l'année ne concernent que les volets datés : cultes,
                  activités et caisse. Une classe, un moniteur ou un enfant n'ont
                  pas de date, et restent entiers. */}
              {filtresDeLOnglet.includes('periode') && (
                <SelectRecherche
                  label="Mois"
                  size="small"
                  value={moisFiltre}
                  onChange={(event) => {
                    setMoisFiltre(event.target.value);
                    setPage(0);
                  }}
                  sx={{ minWidth: 140 }}
                >
                  <MenuItem value="">Tous les mois</MenuItem>
                  {MOIS_LIBELLES.map((libelle, index) => (
                    <MenuItem key={libelle} value={String(index + 1).padStart(2, '0')}>
                      {libelle}
                    </MenuItem>
                  ))}
                </SelectRecherche>
              )}

              {filtresDeLOnglet.includes('periode') && (
                <SelectRecherche
                  label="Année"
                  size="small"
                  value={anneeFiltre}
                  onChange={(event) => {
                    setAnneeFiltre(event.target.value);
                    setPage(0);
                  }}
                  sx={{ minWidth: 130 }}
                >
                  <MenuItem value="">Toutes les années</MenuItem>
                  {anneesDisponibles.map((annee) => (
                    <MenuItem key={annee} value={annee}>
                      {annee}
                    </MenuItem>
                  ))}
                </SelectRecherche>
              )}

              {filtresDeLOnglet.includes('moniteur') && (
                <SelectRecherche
                  label="Moniteur"
                  size="small"
                  value={moniteurFiltre}
                  onChange={(event) => {
                    setMoniteurFiltre(event.target.value);
                    setPage(0);
                  }}
                  sx={{ minWidth: 180 }}
                >
                  <MenuItem value="">Tous les moniteurs</MenuItem>
                  {moniteurs.map((moniteur) => (
                    <MenuItem key={moniteur.idMoniteur} value={String(moniteur.idMoniteur)}>
                      {nomComplet(moniteur)}
                    </MenuItem>
                  ))}
                </SelectRecherche>
              )}
            </Stack>
          </Box>
        )}

        {/* Rappel des filtres actifs. Il s’affiche aussi sur les deux grilles,
            où la barre est masquée : un filtre qui agit sur les cartes sans
            être visible nulle part serait un piège. */}
        {filtresActifs.length > 0 && (
          <Stack
            direction="row"
            spacing={1}
            flexWrap="wrap"
            useFlexGap
            alignItems="center"
            sx={{ px: 2, pb: 2 }}
          >
            <Typography variant="caption" color="text.secondary">
              Filtres actifs :
            </Typography>

            {filtresActifs.map((filtre) => (
              <Chip
                key={filtre.cle}
                size="small"
                label={filtre.libelle}
                onDelete={filtre.retirer}
              />
            ))}

            <Button size="small" onClick={reinitialiserFiltres}>
              Tout effacer
            </Button>
          </Stack>
        )}

        <TableContainer>
          {onglet === 0 && (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Classe</TableCell>
                  <TableCell>Tranche d&apos;âge</TableCell>
                  <TableCell>Responsable</TableCell>
                  <TableCell align="center">Moniteurs</TableCell>
                  <TableCell align="center">Enfants</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pageDe(classesFiltrees).map((classe) => (
                  <TableRow
                    key={classe.idClasseEcodim}
                    hover
                    onDoubleClick={() => ouvrirFicheClasse(classe)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>{classe.libelleClasse}</TableCell>
                    <TableCell>
                      {construireTrancheAge(classe.ageMin, classe.ageMax) ||
                        classe.trancheAge ||
                        '—'}
                    </TableCell>
                    <TableCell>
                      {(classe as any).nomResponsable || (
                        <Typography variant="body2" color="text.disabled">
                          Non désigné
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">{classe.nombreMoniteurs ?? 0}</TableCell>
                    <TableCell align="center">{classe.nombreEnfants ?? 0}</TableCell>
                    <TableCell align="right" onClick={(event) => event.stopPropagation()}>
                      <RowActions
                        actions={[
                          {
                            libelle: 'Détail',
                            icone: 'solar:eye-bold',
                            onClick: () => ouvrirFicheClasse(classe),
                          },
                          {
                            libelle: 'Modifier',
                            icone: 'solar:pen-bold',
                            onClick: () => {
                              setFormClasse({
                                idClasseEcodim: classe.idClasseEcodim,
                                libelleClasse: classe.libelleClasse || '',
                                ageMin: classe.ageMin === null ? '' : String(classe.ageMin),
                                ageMax: classe.ageMax === null ? '' : String(classe.ageMax),
                                descriptionClasse: classe.descriptionClasse || '',
                              } as any);
                              setDialogue('classe');
                            },
                          },
                          {
                            libelle: 'Supprimer',
                            icone: 'solar:trash-bin-trash-bold',
                            destructrice: true,
                            onClick: () =>
                              setSuppression({
                                type: 'classe',
                                libelle: classe.libelleClasse,
                                action: async () => {
                                  await apiClient.deleteClasseEcodim({
                                    idClasseEcodim: classe.idClasseEcodim,
                                    idUtilisateur,
                                  });
                                },
                              }),
                          },
                        ]}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {onglet === 1 && (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Photo</TableCell>
                  <TableCell>Moniteur</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Classe</TableCell>
                  <TableCell>Rôle</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pageDe(moniteursFiltres).map((moniteur) => (
                  <TableRow
                    key={moniteur.idMoniteur}
                    hover
                    onDoubleClick={() => ouvrirFicheMoniteur(moniteur)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>
                      {/* La photo vient de la fiche membre du moniteur : rien
                          n'est stocké ici, et elle suit si elle y change. */}
                      <Avatar
                        src={getPhotoUrl((moniteur as any).photoMembre || '') || undefined}
                        sx={{ width: 36, height: 36 }}
                      >
                        {(moniteur.nomMembre || '?').charAt(0).toUpperCase()}
                      </Avatar>
                    </TableCell>
                    <TableCell>{nomComplet(moniteur)}</TableCell>
                    <TableCell>{moniteur.contactMembre || '—'}</TableCell>
                    <TableCell>{moniteur.libelleClasse || 'Non affecté'}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        <Chip
                          size="small"
                          label={libelleFonction(moniteur.fonctionMoniteur)}
                        />
                        {Boolean((moniteur as any).estResponsable) && (
                          <Chip size="small" color="primary" label="Responsable" />
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell align="right" onClick={(event) => event.stopPropagation()}>
                      <RowActions
                        actions={[
                          {
                            libelle: 'Détail',
                            icone: 'solar:eye-bold',
                            onClick: () => ouvrirFicheMoniteur(moniteur),
                          },
                          {
                            libelle: 'Modifier',
                            icone: 'solar:pen-bold',
                            onClick: () => {
                              setFormMoniteur({
                                idMoniteur: moniteur.idMoniteur,
                                idMembre: String(moniteur.idMembre || ''),
                                classesEncadrees: (moniteur.classes || []).map((lien: any) => ({
                                  idClasseEcodim: Number(lien.idClasseEcodim),
                                  estPrincipal: Number(lien.estPrincipal) === 1 ? 1 : 0,
                                })),
                                fonctionMoniteur: moniteur.fonctionMoniteur || '',
                                dateAffectation: moniteur.dateAffectation || '',
                              } as any);
                              setDialogue('moniteur');
                            },
                          },
                          {
                            libelle: 'Retirer',
                            icone: 'solar:trash-bin-trash-bold',
                            destructrice: true,
                            onClick: () =>
                              setSuppression({
                                type: 'moniteur',
                                libelle: nomComplet(moniteur),
                                action: async () => {
                                  await apiClient.deleteMoniteurEcodim({
                                    idMoniteur: moniteur.idMoniteur,
                                    idUtilisateur,
                                  });
                                },
                              }),
                          },
                        ]}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {onglet === 2 && (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: 64 }}>Photo</TableCell>
                  {/* Le matricule vient en tête : c'est lui qu'on dicte au
                      téléphone et qu'on cherche dans la barre de recherche. */}
                  <TableCell>Matricule</TableCell>
                  <TableCell>Nom</TableCell>
                  <TableCell>Prénoms</TableCell>
                  <TableCell>Classe</TableCell>
                  <TableCell>Inscription</TableCell>
                  <TableCell>Sexe</TableCell>
                  <TableCell>Âge</TableCell>
                  <TableCell>Lieu d&apos;habitation</TableCell>
                  <TableCell>Niveau scolaire</TableCell>
                  <TableCell>Parent / tuteur</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pageDe(enfantsFiltres).map((enfant) => (
                  <TableRow
                    key={enfant.idEnfantEcodim}
                    hover
                    // Double-clic, comme sur la liste des membres : un simple clic
                    // sur une ligne large se déclenche trop facilement.
                    onDoubleClick={() => ouvrirFicheEnfant(enfant)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>
                      <Avatar
                        src={buildEcodimMediaUrl((enfant as any).photoEnfant) || undefined}
                        sx={{ width: 36, height: 36 }}
                      >
                        {(enfant.nomEnfant || '?').charAt(0).toUpperCase()}
                      </Avatar>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                        {(enfant as any).matriculeEnfant || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>{enfant.nomEnfant}</TableCell>
                    <TableCell>{enfant.prenomEnfant || '—'}</TableCell>
                    <TableCell>{enfant.libelleClasse || 'Non affecté'}</TableCell>
                    <TableCell>
                      {estInscrit(enfant) ? (
                        <Tooltip
                          title={
                            (enfant as any).dateInscriptionEcodim
                              ? `Inscrit le ${formaterDate((enfant as any).dateInscriptionEcodim)}`
                              : ''
                          }
                        >
                          <Chip label="Inscrit" color="success" size="small" variant="outlined" />
                        </Tooltip>
                      ) : (
                        <Chip label="Non inscrit" size="small" variant="outlined" />
                      )}
                    </TableCell>
                    <TableCell>{libelleSexe(enfant.sexeEnfant) || '—'}</TableCell>
                    <TableCell>{calculerAge(enfant.dateNaissEnfant)}</TableCell>
                    <TableCell>{enfant.lieuHabitationEnfant || '—'}</TableCell>
                    <TableCell>{enfant.niveauScolaireEnfant || '—'}</TableCell>
                    <TableCell>
                      {enfant.nomParentEnfant || '—'}
                      {enfant.contactParentEnfant ? ` • ${enfant.contactParentEnfant}` : ''}
                    </TableCell>
                    <TableCell align="right" onClick={(event) => event.stopPropagation()}>
                      <RowActions
                        actions={[
                          {
                            libelle: 'Détail',
                            icone: 'solar:eye-bold',
                            onClick: () => ouvrirFicheEnfant(enfant),
                          },
                          {
                            libelle: 'Modifier',
                            icone: 'solar:pen-bold',
                            onClick: () => {
                              setFormEnfant({ ...enfantVide, ...(enfant as any) } as any);
                              setDialogue('enfant');
                            },
                          },
                          {
                            // L'impression reste réservée au navigateur, comme partout
                            // ailleurs dans le projet.
                            libelle: 'Fiche de suivi',
                            icone: 'solar:printer-bold',
                            masquee: isDesktopApp,
                            onClick: () => setFicheEnfant(enfant),
                          },
                          {
                            libelle: "Fiche d'inscription",
                            icone: 'solar:clipboard-text-bold',
                            masquee: isDesktopApp,
                            onClick: () => setInscriptionEnfant(enfant),
                          },
                          {
                            libelle: "Formulaire d'identification",
                            icone: 'solar:document-text-bold',
                            masquee: isDesktopApp,
                            onClick: () => setIdentificationEnfant(enfant),
                          },
                          {
                            libelle: 'Supprimer',
                            icone: 'solar:trash-bin-trash-bold',
                            destructrice: true,
                            onClick: () =>
                              setSuppression({
                                type: 'enfant',
                                libelle: `${enfant.nomEnfant} ${enfant.prenomEnfant || ''}`.trim(),
                                action: async () => {
                                  await apiClient.deleteEnfantEcodim({
                                    idEnfantEcodim: enfant.idEnfantEcodim,
                                    idUtilisateur,
                                  });
                                },
                              }),
                          },
                        ]}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {onglet === 3 && (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Classe</TableCell>
                  <TableCell>Dirigeant</TableCell>
                  <TableCell>Enseignant</TableCell>
                  <TableCell>Passage</TableCell>
                  <TableCell align="center">Enfants</TableCell>
                  <TableCell align="right">Offrande</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pageDe(cultesFiltres).map((culte) => (
                  <TableRow
                    key={culte.idCulteEcodim}
                    hover
                    onClick={() => {
                      setCulteEnEdition(culte);
                      setEditeurCulteOuvert(true);
                    }}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>{formaterDate(culte.dateCulte)}</TableCell>
                    <TableCell>{culte.libelleClasse || '—'}</TableCell>
                    <TableCell>
                      {nomIntervenant(
                        culte.nomDirigeant,
                        culte.prenomDirigeant,
                        culte.nomDirigeantExterne
                      )}
                    </TableCell>
                    <TableCell>
                      {nomIntervenant(
                        culte.nomEnseignant,
                        culte.prenomEnseignant,
                        culte.nomEnseignantExterne
                      )}
                    </TableCell>
                    <TableCell>{culte.passageBiblique || '—'}</TableCell>
                    <TableCell align="center">
                      {(Number(culte.nombreFilles) || 0) + (Number(culte.nombreGarcons) || 0)}
                    </TableCell>
                    <TableCell align="right">
                      {Number(culte.montantOffrande || 0).toLocaleString('fr-FR')}
                    </TableCell>
                    <TableCell align="right" onClick={(event) => event.stopPropagation()}>
                      <RowActions
                        actions={[
                          {
                            libelle: 'Ouvrir le cahier',
                            icone: 'solar:eye-bold',
                            onClick: () => {
                              setCulteEnEdition(culte);
                              setEditeurCulteOuvert(true);
                            },
                          },
                          {
                            libelle: 'Supprimer',
                            icone: 'solar:trash-bin-trash-bold',
                            destructrice: true,
                            onClick: () =>
                              setSuppression({
                                type: 'culte',
                                libelle: `le culte du ${formaterDate(culte.dateCulte)}`,
                                action: async () => {
                                  await apiClient.deleteCulteEcodim({
                                    idCulteEcodim: culte.idCulteEcodim,
                                    idUtilisateur,
                                  });
                                },
                              }),
                          },
                        ]}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {onglet === 4 && (
            <Box sx={{ p: 2 }}>
              <EvaluationsGrille
                classes={classes}
                enfants={enfants}
                evaluations={evaluations}
                notes={notes}
                idUtilisateur={idUtilisateur}
                modifiable={!isDesktopApp}
                onEnregistre={charger}
                onModifierEvaluation={(evaluation) => {
                  setFormEvaluation({
                    ...evaluationVide,
                    ...evaluation,
                    classesEvaluation: (evaluation.classes || []).map(Number),
                    coefficient: String(evaluation.coefficient ?? 1),
                    noteSur: String(evaluation.noteSur ?? 20),
                  });
                  setDialogue('evaluation');
                }}
                onSupprimerEvaluation={(evaluation) =>
                  setSuppression({
                    type: 'evaluation',
                    libelle: evaluation.libelleEvaluation,
                    action: async () => {
                      await apiClient.deleteEvaluationEcodim({
                        idEvaluation: evaluation.idEvaluation,
                        idUtilisateur,
                      });
                    },
                  })
                }
                showNotification={showNotification}
              />

            </Box>
          )}

          {onglet === 5 && (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Activité</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Lieu</TableCell>
                  <TableCell>Classe</TableCell>
                  {/* « Nbre » plutôt qu'« Enfants » et « Moniteurs » : ces deux
                      colonnes portent un effectif, pas des noms. Les titres
                      courts les faisaient lire comme la liste des présents. */}
                  <TableCell align="center">Nbre enfants</TableCell>
                  <TableCell align="center">Nbre moniteurs</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pageDe(activitesFiltrees).map((activite) => (
                  <TableRow key={activite.idActiviteEcodim} hover>
                    <TableCell>{activite.titreActivite}</TableCell>
                    <TableCell>{activite.typeActivite || '—'}</TableCell>
                    <TableCell>
                      {formaterDateHeure(
                        activite.dateDebutActivite,
                        activite.heureDebutActivite,
                        '—'
                      )}
                    </TableCell>
                    <TableCell>{activite.lieuActivite || '—'}</TableCell>
                    <TableCell>{activite.libelleClasse || 'Toutes les classes'}</TableCell>
                    <TableCell align="center">
                      {(Number(activite.nombreFilles) || 0) +
                        (Number(activite.nombreGarcons) || 0) || '—'}
                    </TableCell>
                    <TableCell align="center">
                      {Number(activite.nombreMoniteurs) || '—'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        color={
                          activite.statutActivite === 'Annulee'
                            ? 'error'
                            : activite.statutActivite === 'Terminee'
                              ? 'default'
                              : 'primary'
                        }
                        label={LIBELLES_STATUT[activite.statutActivite] || activite.statutActivite}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <RowActions
                        actions={[
                          {
                            libelle: 'Photos',
                            icone: 'solar:gallery-bold',
                            onClick: () => setActiviteImages(activite),
                          },
                          {
                            libelle: 'Modifier',
                            icone: 'solar:pen-bold',
                            onClick: () => {
                              setFormActivite({ ...activiteVide, ...(activite as any) } as any);
                              setDialogue('activite');
                            },
                          },
                          {
                            libelle: 'Supprimer',
                            icone: 'solar:trash-bin-trash-bold',
                            destructrice: true,
                            onClick: () =>
                              setSuppression({
                                type: 'activite',
                                libelle: activite.titreActivite,
                                action: async () => {
                                  await apiClient.deleteActiviteEcodim({
                                    idActiviteEcodim: activite.idActiviteEcodim,
                                    idUtilisateur,
                                  });
                                },
                              }),
                          },
                        ]}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {onglet === 7 && (
            <Box sx={{ p: 2 }}>
              <FinancesGrille
                finances={financesFiltrees}
                classes={classes}
                idUtilisateur={idUtilisateur}
                chargement={chargement}
                demandeAjout={demandeAjoutFinance}
                onEnregistre={charger}
                onNotifier={showNotification}
              />
            </Box>
          )}

          {onglet === 6 && (
            <Box sx={{ p: 2 }}>
              <AssiduiteGrille
                classes={classes}
                enfants={enfants}
                cultes={cultes}
                presences={presences}
                idUtilisateur={idUtilisateur}
                modifiable={!isDesktopApp}
                onEnregistre={charger}
                onNotifier={showNotification}
              />
            </Box>
          )}
        </TableContainer>

        {/* Mêmes réglages que la liste des membres, pour que les deux écrans se
            manipulent de la même façon.

            Les deux grilles — évaluations et assiduité — ne sont pas des listes
            paginées : elles comptent leurs propres lignes et portent leur propre
            pagination. Cette barre y affichait « 0–0 sur 0 », ce qui laissait
            croire à un tableau vide juste en dessous de vingt-quatre lignes. */}
        {onglet !== 4 && onglet !== 6 && onglet !== 7 && (
          <TablePagination
            component="div"
            page={page}
            count={nombreLignesCourantes}
            rowsPerPage={lignesParPage}
            rowsPerPageOptions={[5, 10, 25]}
            onPageChange={(_, nouvelle) => setPage(nouvelle)}
            onRowsPerPageChange={(event) => {
              setLignesParPage(parseInt(event.target.value, 10));
              setPage(0);
            }}
            labelRowsPerPage="Lignes par page :"
            labelDisplayedRows={({ from, to, count }) => `${from}–${to} sur ${count}`}
          />
        )}

        {!chargement &&
          ((onglet === 0 && classesFiltrees.length === 0) ||
            (onglet === 1 && moniteursFiltres.length === 0) ||
            (onglet === 2 && enfantsFiltres.length === 0) ||
            (onglet === 3 && cultesFiltres.length === 0) ||
            (onglet === 5 && activitesFiltrees.length === 0)) && (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="subtitle1">Aucun résultat</Typography>
              <Typography variant="body2" color="text.secondary">
                {
                  [
                    'Commencez par créer les classes de votre école du dimanche.',
                    'Désignez des moniteurs parmi les membres de votre église.',
                    'Inscrivez les enfants et rattachez-les à une classe.',
                    "Saisissez le cahier de texte rempli dans chaque classe le dimanche.",
                    'Créez les évaluations, puis saisissez les notes de chaque classe.',
                    'Planifiez les cultes des enfants, sorties, répétitions et fêtes.',
                  ][onglet]
                }
              </Typography>
            </Box>
          )}
      </Card>

      {/* ----------------------------------------------------- dialogue classe */}
      <Dialog open={dialogue === 'classe'} onClose={() => setDialogue(null)} fullWidth maxWidth="sm">
        <DialogTitle>{formClasse.idClasseEcodim ? 'Modifier la classe' : 'Nouvelle classe'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Nom de la classe *"
              value={formClasse.libelleClasse}
              onChange={(event) => setFormClasse({ ...formClasse, libelleClasse: event.target.value })}
              fullWidth
            />
            <Stack direction="row" spacing={2}>
              <TextField
                label="Âge minimum"
                type="number"
                value={formClasse.ageMin}
                onChange={(event) => setFormClasse({ ...formClasse, ageMin: event.target.value })}
                fullWidth
              />
              <TextField
                label="Âge maximum"
                type="number"
                value={formClasse.ageMax}
                onChange={(event) => setFormClasse({ ...formClasse, ageMax: event.target.value })}
                fullWidth
              />
            </Stack>
            <Typography variant="caption" color="text.secondary" sx={{ mt: -1 }}>
              Tranche affichée :{' '}
              {construireTrancheAge(formClasse.ageMin, formClasse.ageMax) || 'non précisée'}
            </Typography>
            <TextField
              label="Description"
              value={formClasse.descriptionClasse}
              onChange={(event) =>
                setFormClasse({ ...formClasse, descriptionClasse: event.target.value })
              }
              multiline
              rows={2}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogue(null)}>Annuler</Button>
          <Button variant="contained" onClick={enregistrerClasse} disabled={enregistrement}>
            {enregistrement ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* --------------------------------------------------- dialogue moniteur */}
      <Dialog open={dialogue === 'moniteur'} onClose={() => setDialogue(null)} fullWidth maxWidth="sm">
        <DialogTitle>{formMoniteur.idMoniteur ? 'Modifier le moniteur' : 'Nouveau moniteur'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Alert severity="info">
              Les moniteurs sont choisis parmi les membres de l&apos;église. Si la personne n&apos;y
              figure pas encore, créez-la d&apos;abord dans l&apos;onglet Membre.
            </Alert>

            <SelectRecherche
              label="Membre *"
              value={formMoniteur.idMembre}
              onChange={(event) => setFormMoniteur({ ...formMoniteur, idMembre: event.target.value })}
              fullWidth
            >
              {membresDisponibles.map((membre: any) => (
                <MenuItem key={membre.idMembre} value={String(membre.idMembre)}>
                  {`${membre.nomMembre || ''} ${membre.prenomMembre || ''}`.trim()}
                </MenuItem>
              ))}
            </SelectRecherche>

            <ClassesDuMoniteur
              classes={classes}
              valeur={formMoniteur.classesEncadrees}
              onChange={(rattachements) =>
                setFormMoniteur({ ...formMoniteur, classesEncadrees: rattachements })
              }
            />

            <SelectRecherche
              label="Rôle"
              value={formMoniteur.fonctionMoniteur || ''}
              onChange={(event) =>
                setFormMoniteur({ ...formMoniteur, fonctionMoniteur: event.target.value })
              }
              fullWidth
            >
              <MenuItem value="">Aucun</MenuItem>
              {Object.entries(FONCTIONS_MONITEUR).map(([valeur, libelle]) => (
                <MenuItem key={valeur} value={valeur}>
                  {libelle}
                </MenuItem>
              ))}
            </SelectRecherche>

            <TextField
              label="Date d'affectation"
              type="date"
              value={formMoniteur.dateAffectation || ''}
              onChange={(event) =>
                setFormMoniteur({ ...formMoniteur, dateAffectation: event.target.value })
              }
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogue(null)}>Annuler</Button>
          <Button variant="contained" onClick={enregistrerMoniteur} disabled={enregistrement}>
            {enregistrement ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ------------------------------------------------ dialogue évaluation */}
      <Dialog
        open={dialogue === 'evaluation'}
        onClose={() => setDialogue(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {formEvaluation.idEvaluation ? "Modifier l'évaluation" : 'Nouvelle évaluation'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Intitulé *"
              placeholder="Ex : Comprehesion des léçons"
              value={formEvaluation.libelleEvaluation}
              onChange={(event) =>
                setFormEvaluation({ ...formEvaluation, libelleEvaluation: event.target.value })
              }
              fullWidth
            />

            <SelectRecherche
              label="Type"
              value={formEvaluation.typeEvaluation}
              onChange={(event) =>
                setFormEvaluation({ ...formEvaluation, typeEvaluation: event.target.value })
              }
              fullWidth
            >
              {Object.entries(TYPES_EVALUATION).map(([valeur, libelle]) => (
                <MenuItem key={valeur} value={valeur}>
                  {libelle}
                </MenuItem>
              ))}
            </SelectRecherche>

            <SelectRecherche
              label="Classe concernée"
              value={formEvaluation.idClasseEcodim}
              onChange={(event) =>
                setFormEvaluation({ ...formEvaluation, idClasseEcodim: event.target.value })
              }
              fullWidth
            >
              <MenuItem value="">Toutes les classes</MenuItem>
              {classes.map((classe) => (
                <MenuItem key={classe.idClasseEcodim} value={String(classe.idClasseEcodim)}>
                  {classe.libelleClasse}
                </MenuItem>
              ))}
            </SelectRecherche>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Date"
                type="date"
                value={formEvaluation.dateEvaluation || ''}
                onChange={(event) =>
                  setFormEvaluation({ ...formEvaluation, dateEvaluation: event.target.value })
                }
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
              <TextField
                label="Notée sur"
                type="number"
                value={formEvaluation.noteSur}
                onChange={(event) =>
                  setFormEvaluation({ ...formEvaluation, noteSur: event.target.value })
                }
                fullWidth
              />
              <TextField
                label="Coefficient"
                type="number"
                helperText="Pèse dans la moyenne"
                value={formEvaluation.coefficient}
                onChange={(event) =>
                  setFormEvaluation({ ...formEvaluation, coefficient: event.target.value })
                }
                fullWidth
              />
            </Stack>

            <TextField
              label="Année ecclésiastique"
              placeholder="Ex : 2026-2027"
              value={formEvaluation.anneeEcclesiastique}
              onChange={(event) =>
                setFormEvaluation({ ...formEvaluation, anneeEcclesiastique: event.target.value })
              }
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogue(null)}>Annuler</Button>
          <Button variant="contained" onClick={enregistrerEvaluation} disabled={enregistrement}>
            {enregistrement ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={dialogue === 'enfant'} onClose={() => setDialogue(null)} fullWidth maxWidth="md">
        <DialogTitle>{formEnfant.idEnfantEcodim ? "Modifier l'enfant" : 'Nouvel enfant'}</DialogTitle>
        <DialogContent>
          <Stack alignItems="center" spacing={2} sx={{ mt: 1, mb: 2 }}>
            <Box position="relative">
              <Avatar
                src={apercuPhotoEnfant(formEnfant.photoEnfant) || undefined}
                sx={{
                  width: { xs: 92, sm: 120 },
                  height: { xs: 92, sm: 120 },
                  border: '2px solid #ccc',
                  backgroundColor: '#f5f5f5',
                }}
              >
                {!formEnfant.photoEnfant && (
                  <PersonRounded sx={{ fontSize: { xs: 44, sm: 60 } }} />
                )}
              </Avatar>

              <IconButton
                component="label"
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '&:hover': { backgroundColor: 'primary.dark' },
                }}
              >
                <PhotoCameraRounded />
                <input
                  ref={champPhotoEnfant}
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(event) => choisirPhotoEnfant(event.target.files?.[0])}
                />
              </IconButton>

              {Boolean(formEnfant.photoEnfant) && (
                <IconButton
                  onClick={retirerPhotoEnfant}
                  sx={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    backgroundColor: 'error.main',
                    color: 'white',
                    '&:hover': { backgroundColor: 'error.dark' },
                  }}
                >
                  <CloseRounded />
                </IconButton>
              )}
            </Box>

            <Typography variant="caption" color="text.secondary">
              Cliquez sur l&apos;icône appareil photo pour ajouter une photo
            </Typography>
          </Stack>

          {/* L'inscription vient en premier : tous les enfants qui fréquentent
              l'Ecodim sont saisis, et c'est cette case qui distingue ceux qui
              sont inscrits. Placée au milieu de la fiche, elle passerait
              inaperçue et resterait décochée par oubli. */}
          <Box
            sx={{
              mb: 2,
              p: 2,
              borderRadius: 1.5,
              border: '1px solid',
              borderColor: estInscrit(formEnfant) ? 'success.main' : 'divider',
              // Une teinte transparente plutôt que success.lighter : ce vert pâle
              // rendrait le texte blanc illisible en mode sombre.
              bgcolor: (theme) =>
                estInscrit(formEnfant)
                  ? varAlpha(theme.vars.palette.success.mainChannel, 0.08)
                  : varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
            }}
          >
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Inscription à l&apos;Ecodim
            </Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={estInscrit(formEnfant)}
                      onChange={(event) =>
                        setFormEnfant((precedent: any) => ({
                          ...precedent,
                          inscritEcodim: event.target.checked ? 1 : 0,
                          // Cocher propose la date du jour : c'est le cas le plus
                          // courant, et une inscription sans date ne s'enregistre pas.
                          dateInscriptionEcodim: event.target.checked
                            ? precedent.dateInscriptionEcodim ||
                              new Date().toISOString().slice(0, 10)
                            : '',
                        }))
                      }
                    />
                  }
                  label="L'enfant est inscrit"
                />
              </Grid>
              <Grid xs={12} md={6}>
                <TextField
                  label="Date d'inscription"
                  type="date"
                  value={formEnfant.dateInscriptionEcodim || ''}
                  onChange={(event) =>
                    setFormEnfant({ ...formEnfant, dateInscriptionEcodim: event.target.value })
                  }
                  disabled={!estInscrit(formEnfant)}
                  helperText={
                    estInscrit(formEnfant) ? undefined : "Cochez la case pour saisir la date"
                  }
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Grid>
            </Grid>
          </Box>

          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid xs={12} md={6}>
              <TextField
                label="Nom *"
                value={formEnfant.nomEnfant}
                onChange={(event) => setFormEnfant({ ...formEnfant, nomEnfant: event.target.value })}
                fullWidth
              />
            </Grid>
            <Grid xs={12} md={6}>
              <TextField
                label="Prénoms"
                value={formEnfant.prenomEnfant}
                onChange={(event) => setFormEnfant({ ...formEnfant, prenomEnfant: event.target.value })}
                fullWidth
              />
            </Grid>
            <Grid xs={12} md={6}>
              <SelectRecherche
                label="Sexe *"
                value={formEnfant.sexeEnfant}
                onChange={(event) => setFormEnfant({ ...formEnfant, sexeEnfant: event.target.value })}
                fullWidth
              >
                <MenuItem value="M">Masculin</MenuItem>
                <MenuItem value="F">Féminin</MenuItem>
              </SelectRecherche>
            </Grid>
            <Grid xs={12} md={6}>
              <TextField
                label="Date de naissance"
                type="date"
                value={formEnfant.dateNaissEnfant || ''}
                onChange={(event) =>
                  setFormEnfant({ ...formEnfant, dateNaissEnfant: event.target.value })
                }
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Grid>
            <Grid xs={12} md={6}>
              <TextField
                label="Lieu de naissance"
                value={formEnfant.lieuNaissEnfant}
                onChange={(event) =>
                  setFormEnfant({ ...formEnfant, lieuNaissEnfant: event.target.value })
                }
                fullWidth
              />
            </Grid>
            <Grid xs={12} md={6}>
              <TextField
                label="Lieu d'habitation"
                value={formEnfant.lieuHabitationEnfant}
                onChange={(event) =>
                  setFormEnfant({ ...formEnfant, lieuHabitationEnfant: event.target.value })
                }
                fullWidth
              />
            </Grid>
            <Grid xs={12} md={6}>
              <TextField
                label="N° d'appartement"
                value={formEnfant.numeroAppartement}
                onChange={(event) =>
                  setFormEnfant({ ...formEnfant, numeroAppartement: event.target.value })
                }
                fullWidth
              />
            </Grid>
            <Grid xs={12} md={6}>
              <TextField
                label="Contact de l'enfant"
                value={formEnfant.contactEnfant}
                onChange={(event) =>
                  setFormEnfant({ ...formEnfant, contactEnfant: event.target.value })
                }
                fullWidth
              />
            </Grid>
            <Grid xs={12} md={6}>
              <SelectRecherche
                label="Classe"
                value={formEnfant.idClasseEcodim}
                onChange={(event) =>
                  setFormEnfant({ ...formEnfant, idClasseEcodim: event.target.value })
                }
                fullWidth
              >
                <MenuItem value="">Aucune</MenuItem>
                {classes.map((classe) => (
                  <MenuItem key={classe.idClasseEcodim} value={String(classe.idClasseEcodim)}>
                    {classe.libelleClasse}
                  </MenuItem>
                ))}
              </SelectRecherche>
            </Grid>
            <Grid xs={12} md={6}>
              <TextField
                label="Groupe à l'Ecodim"
                placeholder="Le groupe dans la classe, s'il y en a"
                value={formEnfant.groupeEcodimEnfant}
                onChange={(event) =>
                  setFormEnfant({ ...formEnfant, groupeEcodimEnfant: event.target.value })
                }
                fullWidth
              />
            </Grid>
            <Grid xs={12} md={6}>
              <TextField
                label="Niveau scolaire"
                value={formEnfant.niveauScolaireEnfant}
                onChange={(event) =>
                  setFormEnfant({ ...formEnfant, niveauScolaireEnfant: event.target.value })
                }
                fullWidth
              />
            </Grid>
            <Grid xs={12} md={6}>
              <TextField
                label="École"
                value={formEnfant.ecoleEnfant}
                onChange={(event) =>
                  setFormEnfant({ ...formEnfant, ecoleEnfant: event.target.value })
                }
                fullWidth
              />
            </Grid>
            <Grid xs={12} md={6}>
              <TextField
                label="Activité"
                value={formEnfant.activiteEnfant}
                onChange={(event) =>
                  setFormEnfant({ ...formEnfant, activiteEnfant: event.target.value })
                }
                fullWidth
              />
            </Grid>

            <Grid xs={12}>
              <Divider sx={{ my: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Parent ou tuteur
                </Typography>
              </Divider>
            </Grid>

            <Grid xs={12}>
              <SelecteurMembre
                membres={membres}
                libelle="Le parent ou tuteur est-il membre de l'église ?"
                onChoisir={(membre) =>
                  setFormEnfant((precedent: any) => ({
                    ...precedent,
                    nomParentEnfant: `${membre.nom} ${membre.prenom}`.trim(),
                    contactParentEnfant: membre.contact,
                    adresseParentEnfant: membre.lieuHabitation,
                    tuteurConverti: 'Oui',
                  }))
                }
              />
            </Grid>
            <Grid xs={12} md={6}>
              <TextField
                label="Nom du parent ou tuteur"
                value={formEnfant.nomParentEnfant}
                onChange={(event) =>
                  setFormEnfant({ ...formEnfant, nomParentEnfant: event.target.value })
                }
                fullWidth
              />
            </Grid>
            <Grid xs={12} md={6}>
              <TextField
                label="Contact"
                value={formEnfant.contactParentEnfant}
                onChange={(event) =>
                  setFormEnfant({ ...formEnfant, contactParentEnfant: event.target.value })
                }
                fullWidth
              />
            </Grid>
            <Grid xs={12} md={6}>
              <TextField
                label="Email"
                value={formEnfant.emailParentEnfant}
                onChange={(event) =>
                  setFormEnfant({ ...formEnfant, emailParentEnfant: event.target.value })
                }
                fullWidth
              />
            </Grid>
            <Grid xs={12} md={6}>
              <TextField
                label="Adresse"
                value={formEnfant.adresseParentEnfant}
                onChange={(event) =>
                  setFormEnfant({ ...formEnfant, adresseParentEnfant: event.target.value })
                }
                fullWidth
              />
            </Grid>
            <Grid xs={12} md={6}>
              <SelectRecherche
                label="Le tuteur est-il converti ?"
                value={formEnfant.tuteurConverti || ''}
                onChange={(event) =>
                  setFormEnfant({ ...formEnfant, tuteurConverti: event.target.value })
                }
                fullWidth
              >
                <MenuItem value="">Non précisé</MenuItem>
                {Object.entries(REPONSES_CONVERSION).map(([valeur, libelle]) => (
                  <MenuItem key={valeur} value={valeur}>
                    {libelle}
                  </MenuItem>
                ))}
              </SelectRecherche>
            </Grid>
            <Grid xs={12} md={6}>
              <TextField
                label="Église des parents"
                placeholder="À préciser si les parents sont convertis"
                value={formEnfant.religionParents}
                onChange={(event) =>
                  setFormEnfant({ ...formEnfant, religionParents: event.target.value })
                }
                fullWidth
              />
            </Grid>
            <Grid xs={12} md={6}>
              <SelectRecherche
                label="Avec qui vit l'enfant ?"
                value={formEnfant.vitAvec || ''}
                onChange={(event) => setFormEnfant({ ...formEnfant, vitAvec: event.target.value })}
                fullWidth
              >
                <MenuItem value="">Non précisé</MenuItem>
                {Object.entries(PERSONNES_REFERENTES).map(([valeur, libelle]) => (
                  <MenuItem key={valeur} value={valeur}>
                    {libelle}
                  </MenuItem>
                ))}
              </SelectRecherche>
            </Grid>
            <Grid xs={12} md={6}>
              {/* Celui qui accompagne l'enfant au culte n'est pas toujours celui
                  chez qui il vit : c'est la personne que les moniteurs croisent. */}
              <TextField
                label="Avec qui vient-il à l'église ?"
                value={formEnfant.avecQuiVientEglise}
                onChange={(event) =>
                  setFormEnfant({ ...formEnfant, avecQuiVientEglise: event.target.value })
                }
                fullWidth
              />
            </Grid>
            <Grid xs={12} md={6}>
              <TextField
                label="Responsabilité du tuteur à l'église"
                value={formEnfant.responsabiliteTuteurEglise}
                onChange={(event) =>
                  setFormEnfant({ ...formEnfant, responsabiliteTuteurEglise: event.target.value })
                }
                fullWidth
              />
            </Grid>
            <Grid xs={12} md={6}>
              <TextField
                label="Profession du tuteur"
                value={formEnfant.professionTuteur}
                onChange={(event) =>
                  setFormEnfant({ ...formEnfant, professionTuteur: event.target.value })
                }
                fullWidth
              />
            </Grid>

            <Grid xs={12}>
              <Divider textAlign="left">
                <Typography variant="caption" color="text.secondary">
                  Le père
                </Typography>
              </Divider>
            </Grid>
            <Grid xs={12}>
              <SelecteurMembre
                membres={membres}
                libelle="Le père est-il membre de l'église ?"
                onChoisir={(membre) =>
                  setFormEnfant((precedent: any) => ({
                    ...precedent,
                    nomPere: membre.nom,
                    prenomPere: membre.prenom,
                    contactPere: membre.contact,
                    lieuHabitationPere: membre.lieuHabitation,
                    professionPere: membre.profession,
                    // Membre de l'église : la question de la conversion est tranchée.
                    pereConverti: 'Oui',
                  }))
                }
              />
            </Grid>
            <Grid xs={12} md={6}>
              <TextField
                label="Nom du père"
                value={formEnfant.nomPere}
                onChange={(event) => setFormEnfant({ ...formEnfant, nomPere: event.target.value })}
                fullWidth
              />
            </Grid>
            <Grid xs={12} md={6}>
              <TextField
                label="Prénoms du père"
                value={formEnfant.prenomPere}
                onChange={(event) =>
                  setFormEnfant({ ...formEnfant, prenomPere: event.target.value })
                }
                fullWidth
              />
            </Grid>
            <Grid xs={12} md={6}>
              <TextField
                label="Lieu d'habitation du père"
                value={formEnfant.lieuHabitationPere}
                onChange={(event) =>
                  setFormEnfant({ ...formEnfant, lieuHabitationPere: event.target.value })
                }
                fullWidth
              />
            </Grid>
            <Grid xs={12} md={6}>
              <TextField
                label="Profession du père"
                value={formEnfant.professionPere}
                onChange={(event) =>
                  setFormEnfant({ ...formEnfant, professionPere: event.target.value })
                }
                fullWidth
              />
            </Grid>
            <Grid xs={12} md={6}>
              <TextField
                label="Contact du père"
                value={formEnfant.contactPere}
                onChange={(event) =>
                  setFormEnfant({ ...formEnfant, contactPere: event.target.value })
                }
                fullWidth
              />
            </Grid>
            <Grid xs={12} md={6}>
              <TextField
                label="Religion du père"
                value={formEnfant.religionPere}
                onChange={(event) =>
                  setFormEnfant({ ...formEnfant, religionPere: event.target.value })
                }
                fullWidth
              />
            </Grid>
            <Grid xs={12} md={6}>
              <SelectRecherche
                label="Le père est-il converti ?"
                value={formEnfant.pereConverti || ''}
                onChange={(event) =>
                  setFormEnfant({ ...formEnfant, pereConverti: event.target.value })
                }
                fullWidth
              >
                <MenuItem value="">Non précisé</MenuItem>
                {Object.entries(REPONSES_CONVERSION).map(([valeur, libelle]) => (
                  <MenuItem key={valeur} value={valeur}>
                    {libelle}
                  </MenuItem>
                ))}
              </SelectRecherche>
            </Grid>

            <Grid xs={12}>
              <Divider textAlign="left">
                <Typography variant="caption" color="text.secondary">
                  La mère
                </Typography>
              </Divider>
            </Grid>
            <Grid xs={12}>
              <SelecteurMembre
                membres={membres}
                libelle="La mère est-elle membre de l'église ?"
                onChoisir={(membre) =>
                  setFormEnfant((precedent: any) => ({
                    ...precedent,
                    nomMere: membre.nom,
                    prenomMere: membre.prenom,
                    contactMere: membre.contact,
                    lieuHabitationMere: membre.lieuHabitation,
                    professionMere: membre.profession,
                    mereConverti: 'Oui',
                  }))
                }
              />
            </Grid>
            <Grid xs={12} md={6}>
              <TextField
                label="Nom de la mère"
                value={formEnfant.nomMere}
                onChange={(event) => setFormEnfant({ ...formEnfant, nomMere: event.target.value })}
                fullWidth
              />
            </Grid>
            <Grid xs={12} md={6}>
              <TextField
                label="Prénoms de la mère"
                value={formEnfant.prenomMere}
                onChange={(event) =>
                  setFormEnfant({ ...formEnfant, prenomMere: event.target.value })
                }
                fullWidth
              />
            </Grid>
            <Grid xs={12} md={6}>
              <TextField
                label="Lieu d'habitation de la mère"
                value={formEnfant.lieuHabitationMere}
                onChange={(event) =>
                  setFormEnfant({ ...formEnfant, lieuHabitationMere: event.target.value })
                }
                fullWidth
              />
            </Grid>
            <Grid xs={12} md={6}>
              <TextField
                label="Profession de la mère"
                value={formEnfant.professionMere}
                onChange={(event) =>
                  setFormEnfant({ ...formEnfant, professionMere: event.target.value })
                }
                fullWidth
              />
            </Grid>
            <Grid xs={12} md={6}>
              <TextField
                label="Contact de la mère"
                value={formEnfant.contactMere}
                onChange={(event) =>
                  setFormEnfant({ ...formEnfant, contactMere: event.target.value })
                }
                fullWidth
              />
            </Grid>
            <Grid xs={12} md={6}>
              <TextField
                label="Religion de la mère"
                value={formEnfant.religionMere}
                onChange={(event) =>
                  setFormEnfant({ ...formEnfant, religionMere: event.target.value })
                }
                fullWidth
              />
            </Grid>
            <Grid xs={12} md={6}>
              <SelectRecherche
                label="La mère est-elle convertie ?"
                value={formEnfant.mereConverti || ''}
                onChange={(event) =>
                  setFormEnfant({ ...formEnfant, mereConverti: event.target.value })
                }
                fullWidth
              >
                <MenuItem value="">Non précisé</MenuItem>
                {Object.entries(REPONSES_CONVERSION).map(([valeur, libelle]) => (
                  <MenuItem key={valeur} value={valeur}>
                    {libelle}
                  </MenuItem>
                ))}
              </SelectRecherche>
            </Grid>

            <Grid xs={12}>
              <Divider textAlign="left">
                <Typography variant="caption" color="text.secondary">
                  Situation à l&apos;Ecodim
                </Typography>
              </Divider>
            </Grid>
            <Grid xs={12} md={6}>
              <TextField
                label="Date d'entrée"
                type="date"
                value={formEnfant.dateEntreeEcodim || ''}
                onChange={(event) =>
                  setFormEnfant({ ...formEnfant, dateEntreeEcodim: event.target.value })
                }
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Grid>
            <Grid xs={12} md={6}>
              <TextField
                label="Niveau à l'entrée"
                value={formEnfant.niveauEntreeEcodim}
                onChange={(event) =>
                  setFormEnfant({ ...formEnfant, niveauEntreeEcodim: event.target.value })
                }
                fullWidth
              />
            </Grid>
            <Grid xs={12} md={6}>
              <TextField
                label="Niveau actuel"
                value={formEnfant.niveauActuelEcodim}
                onChange={(event) =>
                  setFormEnfant({ ...formEnfant, niveauActuelEcodim: event.target.value })
                }
                fullWidth
              />
            </Grid>
            <Grid xs={12} md={6}>
              <TextField
                label="Date du baptême dans le Saint-Esprit"
                type="date"
                value={formEnfant.dateBaptemeEsprit || ''}
                onChange={(event) =>
                  setFormEnfant({ ...formEnfant, dateBaptemeEsprit: event.target.value })
                }
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Grid>
            <Grid xs={12} md={6}>
              <TextField
                label="Lieu du baptême dans le Saint-Esprit"
                value={formEnfant.lieuBaptemeEsprit}
                onChange={(event) =>
                  setFormEnfant({ ...formEnfant, lieuBaptemeEsprit: event.target.value })
                }
                fullWidth
              />
            </Grid>
            <Grid xs={12} md={6}>
              <TextField
                label="Date de sortie"
                type="date"
                value={formEnfant.dateSortieEcodim || ''}
                onChange={(event) =>
                  setFormEnfant({ ...formEnfant, dateSortieEcodim: event.target.value })
                }
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Grid>
            <Grid xs={12} md={6}>
              <SelectRecherche
                label="Motif de sortie"
                value={formEnfant.categorieSortieEcodim || ''}
                onChange={(event) =>
                  setFormEnfant({ ...formEnfant, categorieSortieEcodim: event.target.value })
                }
                fullWidth
              >
                <MenuItem value="">Non précisé</MenuItem>
                {Object.entries(CATEGORIES_SORTIE).map(([valeur, libelle]) => (
                  <MenuItem key={valeur} value={valeur}>
                    {libelle}
                  </MenuItem>
                ))}
              </SelectRecherche>
            </Grid>
            <Grid xs={12} md={6}>
              <TextField
                label="Précision du motif"
                value={formEnfant.motifSortieEcodim}
                onChange={(event) =>
                  setFormEnfant({ ...formEnfant, motifSortieEcodim: event.target.value })
                }
                fullWidth
              />
            </Grid>

            <Grid xs={12}>
              <Divider textAlign="left">
                <Typography variant="caption" color="text.secondary">
                  Situation sociale et départ
                </Typography>
              </Divider>
            </Grid>
            <Grid xs={12} md={6}>
              <SelectRecherche
                label="Situation sociale"
                value={formEnfant.situationSociale || ''}
                onChange={(event) =>
                  setFormEnfant({ ...formEnfant, situationSociale: event.target.value })
                }
                fullWidth
              >
                <MenuItem value="">Non précisé</MenuItem>
                {Object.entries(SITUATIONS_SOCIALES).map(([valeur, libelle]) => (
                  <MenuItem key={valeur} value={valeur}>
                    {libelle}
                  </MenuItem>
                ))}
              </SelectRecherche>
            </Grid>
            <Grid xs={12} md={6}>
              <TextField
                label="Précision"
                placeholder="À remplir si « Autres »"
                value={formEnfant.precisionSituationSociale}
                onChange={(event) =>
                  setFormEnfant({ ...formEnfant, precisionSituationSociale: event.target.value })
                }
                fullWidth
              />
            </Grid>
            <Grid xs={12} md={6}>
              <TextField
                label="Date de départ"
                type="date"
                value={formEnfant.dateDepart || ''}
                onChange={(event) =>
                  setFormEnfant({ ...formEnfant, dateDepart: event.target.value })
                }
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Grid>
            <Grid xs={12} md={6}>
              <TextField
                label="Motifs du départ"
                value={formEnfant.motifDepart}
                onChange={(event) =>
                  setFormEnfant({ ...formEnfant, motifDepart: event.target.value })
                }
                fullWidth
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogue(null)}>Annuler</Button>
          <Button variant="contained" onClick={enregistrerEnfant} disabled={enregistrement}>
            {enregistrement ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={dialogue === 'activite'} onClose={() => setDialogue(null)} fullWidth maxWidth="md">
        <DialogTitle>
          {formActivite.idActiviteEcodim ? "Modifier l'activité" : 'Nouvelle activité'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid xs={12} md={8}>
              <TextField
                label="Intitulé *"
                placeholder="Ex : Culte des enfants, sortie, répétition"
                value={formActivite.titreActivite}
                onChange={(event) =>
                  setFormActivite({ ...formActivite, titreActivite: event.target.value })
                }
                size="small"
                fullWidth
              />
            </Grid>
            <Grid xs={12} md={4}>
              <TextField
                label="Type"
                value={formActivite.typeActivite}
                onChange={(event) =>
                  setFormActivite({ ...formActivite, typeActivite: event.target.value })
                }
                size="small"
                fullWidth
              />
            </Grid>

            <Grid xs={12} md={4}>
              <TextField
                label="Date"
                type="date"
                value={formActivite.dateDebutActivite || ''}
                onChange={(event) =>
                  setFormActivite({ ...formActivite, dateDebutActivite: event.target.value })
                }
                InputLabelProps={{ shrink: true }}
                size="small"
                fullWidth
              />
            </Grid>
            <Grid xs={6} md={2}>
              <TextField
                label="Début"
                type="time"
                value={formActivite.heureDebutActivite || ''}
                onChange={(event) =>
                  setFormActivite({ ...formActivite, heureDebutActivite: event.target.value })
                }
                InputLabelProps={{ shrink: true }}
                size="small"
                fullWidth
              />
            </Grid>
            <Grid xs={6} md={2}>
              <TextField
                label="Fin"
                type="time"
                value={formActivite.heureFinActivite || ''}
                onChange={(event) =>
                  setFormActivite({ ...formActivite, heureFinActivite: event.target.value })
                }
                InputLabelProps={{ shrink: true }}
                size="small"
                fullWidth
              />
            </Grid>
            <Grid xs={12} md={4}>
              <TextField
                label="Lieu"
                value={formActivite.lieuActivite}
                onChange={(event) =>
                  setFormActivite({ ...formActivite, lieuActivite: event.target.value })
                }
                size="small"
                fullWidth
              />
            </Grid>

            <Grid xs={12} md={6}>
              <SelectRecherche
                label="Classe concernée"
                value={formActivite.idClasseEcodim}
                onChange={(event) =>
                  setFormActivite({ ...formActivite, idClasseEcodim: event.target.value })
                }
                size="small"
                fullWidth
              >
                <MenuItem value="">Toutes les classes</MenuItem>
                {classes.map((classe) => (
                  <MenuItem key={classe.idClasseEcodim} value={String(classe.idClasseEcodim)}>
                    {classe.libelleClasse}
                  </MenuItem>
                ))}
              </SelectRecherche>
            </Grid>
            <Grid xs={12} md={6}>
              <SelectRecherche
                label="Statut"
                value={formActivite.statutActivite}
                onChange={(event) =>
                  setFormActivite({ ...formActivite, statutActivite: event.target.value })
                }
                size="small"
                fullWidth
              >
                {Object.entries(LIBELLES_STATUT).map(([valeur, libelle]) => (
                  <MenuItem key={valeur} value={valeur}>
                    {libelle}
                  </MenuItem>
                ))}
              </SelectRecherche>
            </Grid>

            <Grid xs={12}>
              <Divider textAlign="left">
                <Typography variant="caption" color="text.secondary">
                  Déroulement
                </Typography>
              </Divider>
            </Grid>

            <Grid xs={12} md={6}>
              <SelectRecherche
                label="Moniteur dirigeant"
                value={formActivite.idMoniteurDirigeant || ''}
                onChange={(event) =>
                  setFormActivite({ ...formActivite, idMoniteurDirigeant: event.target.value })
                }
                size="small"
                fullWidth
              >
                <MenuItem value="">Non précisé</MenuItem>
                {moniteurs.map((moniteur) => (
                  <MenuItem key={moniteur.idMoniteur} value={String(moniteur.idMoniteur)}>
                    {nomComplet(moniteur)}
                  </MenuItem>
                ))}
              </SelectRecherche>
            </Grid>
            <Grid xs={12} md={6}>
              <SelectRecherche
                label="Moniteur enseignant"
                value={formActivite.idMoniteurEnseignant || ''}
                onChange={(event) =>
                  setFormActivite({ ...formActivite, idMoniteurEnseignant: event.target.value })
                }
                size="small"
                fullWidth
              >
                <MenuItem value="">Non précisé</MenuItem>
                {moniteurs.map((moniteur) => (
                  <MenuItem key={moniteur.idMoniteur} value={String(moniteur.idMoniteur)}>
                    {nomComplet(moniteur)}
                  </MenuItem>
                ))}
              </SelectRecherche>
            </Grid>

            <Grid xs={12}>
              <TextField
                label="Textes bibliques"
                placeholder="Ex : Psaume 23 ; Matthieu 19.14"
                value={formActivite.textesBibliques || ''}
                onChange={(event) =>
                  setFormActivite({ ...formActivite, textesBibliques: event.target.value })
                }
                size="small"
                multiline
                minRows={2}
                fullWidth
              />
            </Grid>

            <Grid xs={6} md={3}>
              <TextField
                label="Filles"
                type="number"
                value={formActivite.nombreFilles || ''}
                onChange={(event) =>
                  setFormActivite({ ...formActivite, nombreFilles: event.target.value })
                }
                size="small"
                fullWidth
              />
            </Grid>
            <Grid xs={6} md={3}>
              <TextField
                label="Garçons"
                type="number"
                value={formActivite.nombreGarcons || ''}
                onChange={(event) =>
                  setFormActivite({ ...formActivite, nombreGarcons: event.target.value })
                }
                size="small"
                fullWidth
              />
            </Grid>
            <Grid xs={6} md={3}>
              {/* Les moniteurs encadrent l'activité : ils ne sont pas comptés
                  parmi les enfants, et le total ne les inclut donc pas. */}
              <TextField
                label="Moniteurs présents"
                type="number"
                value={formActivite.nombreMoniteurs || ''}
                onChange={(event) =>
                  setFormActivite({ ...formActivite, nombreMoniteurs: event.target.value })
                }
                size="small"
                fullWidth
              />
            </Grid>
            <Grid xs={6} md={3}>
              <TextField
                label="Total enfants"
                value={
                  (Number(formActivite.nombreFilles) || 0) +
                  (Number(formActivite.nombreGarcons) || 0)
                }
                InputProps={{ readOnly: true }}
                size="small"
                fullWidth
              />
            </Grid>

            <Grid xs={12}>
              <Divider textAlign="left">
                <Typography variant="caption" color="text.secondary">
                  Galerie
                </Typography>
              </Divider>
            </Grid>

            <Grid xs={12}>
              {formActivite.idActiviteEcodim ? (
                <GalerieActivite
                  activite={formActivite}
                  idUtilisateur={idUtilisateur}
                  modifiable={!isDesktopApp}
                  showNotification={showNotification}
                />
              ) : (
                <Alert severity="info">
                  Les photos s&apos;ajoutent une fois l&apos;activité enregistrée : chaque
                  image est rattachée à l&apos;activité, qui doit donc exister d&apos;abord.
                </Alert>
              )}
            </Grid>
            <Grid xs={12}>
              <TextField
                label="Description"
                value={formActivite.descriptionActivite}
                onChange={(event) =>
                  setFormActivite({ ...formActivite, descriptionActivite: event.target.value })
                }
                size="small"
                multiline
                rows={2}
                fullWidth
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogue(null)}>Annuler</Button>
          <Button variant="contained" onClick={enregistrerActivite} disabled={enregistrement}>
            {enregistrement ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </DialogActions>
      </Dialog>

      <CulteEditorDialog
        ouvert={editeurCulteOuvert}
        culte={culteEnEdition}
        classes={classes}
        moniteurs={moniteurs}
        enfants={enfants}
        presences={presences}
        idUtilisateur={idUtilisateur}
        onClose={() => {
          setEditeurCulteOuvert(false);
          setCulteEnEdition(null);
        }}
        onEnregistre={charger}
        showNotification={showNotification}
      />

      {/* Fiche de suivi pré-remplie, imprimée depuis la ligne d'un enfant. */}
      <Box sx={{ display: 'none' }}>
        <div ref={referenceFiche}>
          {ficheEnfant && (
            <FicheSuiviEnfant
              enfant={ficheEnfant}
              presences={presences.filter(
                (presence) =>
                  String(presence.idEnfantEcodim) === String(ficheEnfant.idEnfantEcodim)
              )}
            />
          )}
        </div>
        <div ref={referenceInscription}>
          {inscriptionEnfant && <FicheInscriptionEnfant enfant={inscriptionEnfant} />}
        </div>
        <div ref={referenceIdentification}>
          {identificationEnfant && (
            <FormulaireIdentificationEnfant enfant={identificationEnfant} />
          )}
        </div>
      </Box>

      <ActiviteImagesDialog
        activite={activiteImages}
        idUtilisateur={idUtilisateur}
        modifiable={!isDesktopApp}
        onClose={() => setActiviteImages(null)}
        showNotification={showNotification}
      />

      <ConfirmDialog
        open={Boolean(suppression)}
        title="Confirmer la suppression"
        message={`Voulez-vous vraiment supprimer « ${suppression?.libelle || ''} » ?`}
        onClose={() => setSuppression(null)}
        onConfirm={confirmerSuppression}
      />

      <NotificationComponent />
    </DashboardContent>
  );
}
