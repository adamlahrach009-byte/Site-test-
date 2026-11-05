# Quick photo — thème Shopify

Thème Shopify Online Store 2.0 sur mesure pour **Quick photo**, photographe pour les crèches en Belgique.
Aucune étape de build : le dépôt se connecte tel quel via l'intégration GitHub de Shopify.

## Connexion à la boutique

1. Dans Shopify : **Boutique en ligne › Thèmes › Ajouter un thème › Se connecter depuis GitHub**.
2. Choisissez ce dépôt et la branche à synchroniser.
3. Le thème apparaît dans la bibliothèque : prévisualisez-le, puis publiez-le.

Les pages existantes `contact` et `galerie` doivent utiliser les modèles **page.contact** et **page.galerie**
(Boutique en ligne › Pages › choisir la page › Modèle de thème).

## Structure

```
assets/      base.css, theme.js (commun), lightbox.js (chargé au premier clic sur une photo), contact-form.js
config/      settings_schema.json (réglages du thème), settings_data.json (couleurs, polices…)
layout/      theme.liquid, password.liquid
locales/     fr.default.json (textes du site), fr.default.schema.json (textes de l'éditeur)
sections/    sections modifiables + header-group.json et footer-group.json
snippets/    composants (polaroïd, icônes, logo, SEO, données structurées…)
templates/   index, page, page.contact, page.galerie, produit, collection, panier, recherche, blog, 404…
```

## Ce qui se règle dans l'éditeur de thème

- **Paramètres du thème** : couleurs, polices (Poppins / Inter via le sélecteur Shopify), arrondis,
  animations, téléphone, e-mail facultatif, bouton flottant mobile, référencement, réseaux sociaux, favicon.
- **Chaque section** : textes, images, fond (crème, crème chaud, menthe, blanc, vert), bord ondulé,
  formes décoratives, espacements. Les sections peuvent être ajoutées, masquées et réordonnées.
- **En-tête** : liens du menu (blocs), bouton « Proposer une date », téléphone, en-tête fixe.
- **Formulaire de contact** : chaque champ est un bloc (libellé, type, obligatoire, largeur).
  Les cases « Type de séance » sont regroupées en une seule ligne dans l'e-mail reçu.
  Les demandes arrivent à l'adresse d'expéditeur définie dans **Paramètres › Notifications**.

## Témoignages

La section **Témoignages** de la page d'accueil est livrée vide et reste invisible pour les visiteurs.
Ajoutez de vrais avis avec le bouton « Ajouter un avis » : elle s'affichera automatiquement.

## Politiques

Les liens du pied de page proviennent de **Paramètres › Politiques**. Rédigez-y au minimum la politique de confidentialité.

## Qualité

- `npx @shopify/cli theme check` : aucune remarque (y compris avec `--config theme-check:all`).
- Mobile-first, images responsives (`image_url` + `image_tag`, lazy-loading hors hero), JS vanilla léger.
- Accessibilité : contrastes AA, focus visible, navigation au clavier, visionneuse accessible (Échap, flèches, swipe),
  animations désactivées si « réduire les animations » est activé.
- SEO : balises title/description, Open Graph, données structurées `ProfessionalService` (sans adresse) et `FAQPage`.
