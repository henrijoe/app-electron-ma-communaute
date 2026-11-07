// ----------------------------------------------------------------------
// Le style de page de chaque état doit avoir le dernier mot.
//
// react-to-print pose le `pageStyle` d'un état (A4 paysage, marges de 5 mm...)
// dans l'iframe d'impression AVANT d'y recopier toutes les feuilles de style de
// l'application. Or celles-ci contiennent d'autres règles `@page` — les fiches
// montées en permanence (cachées) déclarent du portrait, global.css des marges
// de 10 mm — et, à importance égale, la dernière règle l'emporte. Résultat : un
// état paysage sortait en portrait, réduit, avec de grandes marges.
//
// On surveille donc l'arrivée de l'iframe d'impression (id « printWindow ») et,
// dès que react-to-print y a recopié les styles, on replace en fin d'en-tête les
// balises <style> qui ne sont pas des copies — les copies portent un id
// « react-to-print-… », le `pageStyle` n'en a pas. L'impression elle-même, et le
// titre du document (nom du fichier PDF), restent ceux de react-to-print.

const mettreLeStyleDePageEnDernier = (iframe: HTMLIFrameElement) => {
  const document = iframe.contentDocument;
  if (!document?.head) return;

  Array.from(document.head.querySelectorAll('style'))
    .filter((style) => !String(style.id || '').startsWith('react-to-print-'))
    .forEach((style) => document.head.appendChild(style));

  // Le numéro de page (« Page 1 / 3 », voir global.css) s'écrit dans la marge du
  // bas. Avec 5 mm, il collait au bord de la feuille, là où beaucoup
  // d'imprimantes n'impriment pas : la marge du bas passe à 10 mm pour tous les
  // états, et le numéro se cale en haut de cette marge, juste sous le contenu.
  const numeroDePage = document.createElement('style');
  numeroDePage.id = 'numero-de-page';
  numeroDePage.textContent =
    '@page { margin-bottom: 10mm; @bottom-right { vertical-align: top; padding-top: 2mm; } }';
  document.head.appendChild(numeroDePage);
};

let installe = false;

export const installerOrdreDesStylesDImpression = () => {
  if (installe || typeof window === 'undefined' || typeof MutationObserver === 'undefined') return;
  installe = true;

  const observateur = new MutationObserver((changements) => {
    changements.forEach((changement) => {
      changement.addedNodes.forEach((noeud) => {
        if (noeud instanceof HTMLIFrameElement && noeud.id === 'printWindow') {
          // Écouteur posé après le `onload` de react-to-print : il passe juste
          // après la copie des styles, et avant l'impression, qui attend un tour.
          noeud.addEventListener('load', () => mettreLeStyleDePageEnDernier(noeud));
        }
      });
    });
  });

  const demarrer = () => observateur.observe(document.body, { childList: true });
  if (document.body) {
    demarrer();
  } else {
    window.addEventListener('DOMContentLoaded', demarrer, { once: true });
  }
};
