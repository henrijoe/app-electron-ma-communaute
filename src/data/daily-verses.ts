// Les 4 façons dont le tableau de bord peut afficher un verset :
// - disabled  : rien n'est affiché
// - daily     : un verset choisi automatiquement (rotation locale, voir dailyVerses ci-dessous)
// - custom    : un seul verset fixe, saisi une fois pour toutes par l'admin
// - scheduled : un calendrier de versets, un par date, géré dans Paramètres
export type DashboardVerseMode = 'disabled' | 'daily' | 'custom' | 'scheduled';

export type DashboardVerse = {
  reference: string;
  text: string;
};

// Un verset programme par l'administrateur pour une date precise
// (ex: "verset du jour" different pendant 1, 2 ou 6 mois).
export type ScheduledVerse = {
  idVersetProgramme: number;
  idUtilisateur: number;
  dateAffichage: string;
  reference: string;
  texte: string;
};

export const dailyVerses: DashboardVerse[] = [
  {
    reference: 'Psaumes 23:1',
    text: "L'Éternel est mon berger: je ne manquerai de rien.",
  },
  {
    reference: 'Jean 14:6',
    text: 'Je suis le chemin, la vérité, et la vie. Nul ne vient au Père que par moi.',
  },
  {
    reference: 'Psaumes 119:105',
    text: 'Ta parole est une lampe à mes pieds, et une lumière sur mon sentier.',
  },
  {
    reference: 'Philippiens 4:13',
    text: 'Je puis tout par celui qui me fortifie.',
  },
  {
    reference: 'Romains 8:31',
    text: 'Si Dieu est pour nous, qui sera contre nous?',
  },
  {
    reference: 'Proverbes 3:5',
    text: "Confie-toi en l'Éternel de tout ton cœur, et ne t'appuie pas sur ta sagesse.",
  },
  {
    reference: 'Matthieu 6:33',
    text: 'Cherchez premièrement le royaume et la justice de Dieu; et toutes ces choses vous seront données par-dessus.',
  },
  {
    reference: 'Josué 1:9',
    text: "Fortifie-toi et prends courage; ne t'effraie point et ne t'épouvante point.",
  },
  {
    reference: 'Ésaïe 41:10',
    text: 'Ne crains rien, car je suis avec toi; ne promène pas des regards inquiets, car je suis ton Dieu.',
  },
  {
    reference: 'Psaumes 46:2',
    text: 'Dieu est pour nous un refuge et un appui, un secours qui ne manque jamais dans la détresse.',
  },
  {
    reference: 'Jérémie 29:11',
    text: "Je connais les projets que j'ai formés sur vous, dit l'Éternel, projets de paix et non de malheur.",
  },
  {
    reference: 'Matthieu 11:28',
    text: 'Venez à moi, vous tous qui êtes fatigués et chargés, et je vous donnerai du repos.',
  },
  {
    reference: 'Jean 3:16',
    text: "Car Dieu a tant aimé le monde qu'il a donné son Fils unique.",
  },
  {
    reference: 'Romains 12:12',
    text: "Réjouissez-vous en espérance. Soyez patients dans l'affliction. Persévérez dans la prière.",
  },
  {
    reference: 'Psaumes 27:1',
    text: "L'Éternel est ma lumière et mon salut: de qui aurais-je crainte?",
  },
  {
    reference: 'Psaumes 37:5',
    text: "Recommande ton sort à l'Éternel, mets en lui ta confiance, et il agira.",
  },
  {
    reference: 'Proverbes 16:3',
    text: "Recommande à l'Éternel tes œuvres, et tes projets réussiront.",
  },
  {
    reference: 'Ésaïe 40:31',
    text: "Ceux qui se confient en l'Éternel renouvellent leur force.",
  },
  {
    reference: 'Jean 8:12',
    text: 'Je suis la lumière du monde; celui qui me suit ne marchera pas dans les ténèbres.',
  },
  {
    reference: 'Jean 15:5',
    text: 'Je suis le cep, vous êtes les sarments. Celui qui demeure en moi porte beaucoup de fruit.',
  },
  {
    reference: 'Galates 5:22',
    text: "Le fruit de l'Esprit, c'est l'amour, la joie, la paix, la patience, la bonté.",
  },
  {
    reference: 'Éphésiens 2:8',
    text: "C'est par la grâce que vous êtes sauvés, par le moyen de la foi.",
  },
  {
    reference: 'Colossiens 3:23',
    text: 'Tout ce que vous faites, faites-le de bon cœur, comme pour le Seigneur.',
  },
  {
    reference: 'Hébreux 11:1',
    text: "La foi est une ferme assurance des choses qu'on espère.",
  },
  {
    reference: 'Hébreux 13:8',
    text: "Jésus-Christ est le même hier, aujourd'hui, et éternellement.",
  },
  {
    reference: 'Jacques 1:5',
    text: "Si quelqu'un d'entre vous manque de sagesse, qu'il la demande à Dieu.",
  },
  {
    reference: '1 Pierre 5:7',
    text: 'Déchargez-vous sur lui de tous vos soucis, car lui-même prend soin de vous.',
  },
  {
    reference: '1 Jean 4:8',
    text: "Celui qui n'aime pas n'a pas connu Dieu, car Dieu est amour.",
  },
  {
    reference: 'Apocalypse 3:20',
    text: 'Voici, je me tiens à la porte, et je frappe.',
  },
  {
    reference: 'Nombres 6:24',
    text: "Que l'Éternel te bénisse, et qu'il te garde!",
  },
];

export const normalizeDashboardVerseMode = (value: unknown): DashboardVerseMode => {
  if (value === 'disabled' || value === 'custom' || value === 'scheduled') {
    return value;
  }

  return 'daily';
};

// Formate une date en 'YYYY-MM-DD' (fuseau local) pour la comparer aux
// dates programmees, qui sont stockees sous ce meme format simple.
export const formatIsoDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getDailyVerse = (date = new Date()): DashboardVerse => {
  const startOfYear = new Date(date.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((date.getTime() - startOfYear.getTime()) / 86400000);
  const index = Math.max(dayOfYear - 1, 0) % dailyVerses.length;

  return dailyVerses[index];
};
