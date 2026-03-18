// Décrit les données minimales envoyées au process Electron pour l'impression.
type DesktopPrintPayload = {
  // Titre affiché dans la fenêtre d'aperçu ou utilisé pour le PDF.
  title: string;
  // Contenu HTML principal à imprimer.
  bodyHtml: string;
  // Balises de styles à réinjecter pour conserver le rendu visuel.
  headHtml: string;
  // Nom de fichier proposé lors de l'export PDF.
  fileName?: string;
};

// Récupère les balises de styles déjà présentes dans la page courante.
const getHeadHtml = (): string =>
  // Sélectionne toutes les balises <style> et les feuilles CSS chargées via <link>.
  Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
    // Transforme chaque nœud en HTML réutilisable dans la fenêtre d'impression.
    .map((node) => {
      // Si le nœud est une feuille CSS externe, on reconstruit explicitement la balise link.
      if (node.tagName.toLowerCase() === 'link') {
        // Convertit le nœud DOM générique en lien HTML typé.
        const link = node as HTMLLinkElement;
        // Retourne une balise link HTML exploitable dans le document d'aperçu.
        return `<link rel="stylesheet" href="${link.href}" />`;
      }

      // Pour une balise <style>, on réutilise directement son HTML complet.
      return node.outerHTML;
    })
    // Concatène tous les styles en une seule chaîne injectée dans le <head>.
    .join('\n');

// Construit un document imprimable a partir d'un noeud deja rendu a l'ecran.
export const buildPrintablePayload = (
  element: HTMLElement,
  options: { title: string; fileName?: string }
): DesktopPrintPayload => ({
  // Copie le titre demandé par l'appelant.
  title: options.title,
  // Copie le nom de fichier optionnel pour l'export PDF.
  fileName: options.fileName,
  // Sérialise le noeud HTML à imprimer avec tout son contenu.
  bodyHtml: element.outerHTML,
  // Récupère les styles de la page pour garder le même rendu dans l'aperçu.
  headHtml: getHeadHtml(),
});

// Vérifie si l'application tourne dans Electron avec l'API d'impression exposée.
export const canUseDesktopPrint = (): boolean =>
  // Retourne true uniquement si on est en desktop et que l'API preload est disponible.
  Boolean((window as any)?.desktopApp?.isDesktop && (window as any)?.desktopPrint);

// Ouvre la fenêtre Electron d'aperçu avant impression.
export const openDesktopPrintPreview = async (
  element: HTMLElement | null,
  options: { title: string; fileName?: string }
) : Promise<void> => {
  // Si rien n'est à imprimer ou si l'API desktop n'existe pas, on sort sans erreur.
  if (!element || !canUseDesktopPrint()) {
    return;
  }

  // Construit la charge utile HTML à envoyer au process principal Electron.
  const payload = buildPrintablePayload(element, options);
  // Demande à Electron d'ouvrir la fenêtre d'aperçu avec ce contenu.
  await (window as any).desktopPrint.openPreview(payload);
};

// Exporte directement un noeud HTML en PDF via Electron.
export const exportDesktopPdf = async (
  element: HTMLElement | null,
  options: { title: string; fileName?: string }
) : Promise<void> => {
  // Si le noeud est absent ou si on n'est pas en desktop, on ne fait rien.
  if (!element || !canUseDesktopPrint()) {
    return;
  }

  // Prépare le document complet à convertir en PDF.
  const payload = buildPrintablePayload(element, options);
  // Appelle l'API preload pour lancer la génération du PDF.
  await (window as any).desktopPrint.exportPdf(payload);
};
