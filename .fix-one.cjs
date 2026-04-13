const fs = require('fs');
const path = 'src/sections/departement/view/departement-view.tsx';
let content = fs.readFileSync(path, 'utf8');
const replacements = [
  ['DÃƒÂ©partement', 'Département'],
  ['dÃƒÂ©partement', 'département'],
  ['succÃ¨s', 'succès'],
  ['crÃ©Ã©', 'créé'],
  ['crÃ©ation', 'création'],
  ['DonnÃ©es', 'Données'],
  ['Ã ', 'à'],
  ['Ã©diter', 'éditer'],
  ['gÃ©rer', 'gérer'],
  ['donnÃ©es', 'données'],
  ['RÃ©initialiser', 'Réinitialiser'],
  ['dÃ©partements', 'départements'],
  ['LibellÃ©', 'Libellé'],
  ['supprimÃ©', 'supprimé'],
  ['modifiÃ©', 'modifié'],
  ['crÃ©er', 'créer']
];
for (const [bad, good] of replacements) content = content.split(bad).join(good);
fs.writeFileSync(path, content, 'utf8');
