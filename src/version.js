export const WEBSITE_VERSION = "Version 7.5";
export const VERSION_DETAILS = `Corrections et améliorations:
• Pie Chart Statuts: cercle agrandi (innerRadius 55, outerRadius 85)
• Ventes par Catégorie: marge top réduite, catégories inconnues ignorées
• Courbe Sans Promo: calcul originalValue corrigé (items total vs discount)
• Système Coupons: audit complet - validation max_uses côté serveur
• API Promo: vérifications is_active, expiration, max_uses à l'incrémentation
• DataContext: refetchPromoCodes pour synchroniser après utilisation
• Checkout: appel refetch après incrémentation code promo
• Validation code promo: case-insensitive, comparaison maxUses robuste`;
