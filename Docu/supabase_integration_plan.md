# Plan d'Intégration Supabase

## Problème Identifié

**Erreur 500 lors de la création de produits** : 
```
Add product error: { code: 'PGRST204', message: "Could not find the 'isFeatured' column of 'portfolio_products' in the schema cache" }
```

## Cause Racine

Incompatibilité de nommage entre le frontend et la base de données :
- **Frontend** : Utilise `isFeatured` (camelCase)
- **Supabase** : Colonne nommée `is_featured` (snake_case)

## Solution Proposée

### Option 1 : Adapter le Frontend (Recommandée)

Modifier le code frontend pour convertir automatiquement les noms de champs camelCase en snake_case lors des appels API.

**Fichiers à modifier :**
- `src/context/DataContext.jsx` - Fonctions `addProduct()` et `updateProduct()`
- `src/pages/Dashboard.jsx` - Formulaire de création de produits

**Modifications spécifiques :**
```javascript
// Convert camelCase to snake_case for Supabase compatibility
const productData = {
    ...product,
    promo_price: product.promoPrice,
    is_featured: product.isFeatured,
    tags: product.tags || []
};
delete productData.promoPrice;
delete productData.isFeatured;
```

### Option 2 : Renommer la Colonne dans Supabase

Exécuter dans Supabase SQL Editor :
```sql
ALTER TABLE portfolio_products RENAME COLUMN is_featured TO isFeatured;
```

**Inconvénients :**
- Doit être fait manuellement
- Risque de casser d'autres intégrations
- Moins flexible pour l'évolution future

## Configuration Supabase Requise

### 1. Permissions RLS (Row Level Security)

Activer le RLS sur `portfolio_products` et créer les policies suivantes :

```sql
-- Activer RLS
ALTER TABLE portfolio_products ENABLE ROW LEVEL SECURITY;

-- Policy pour autoriser les utilisateurs authentifiés à insérer
CREATE POLICY "Allow insert for authenticated users"
ON portfolio_products
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Policy pour autoriser les utilisateurs authentifiés à mettre à jour
CREATE POLICY "Allow update for authenticated users"
ON portfolio_products
FOR UPDATE
USING (auth.uid() IS NOT NULL);

-- Policy pour autoriser les utilisateurs authentifiés à supprimer
CREATE POLICY "Allow delete for authenticated users"
ON portfolio_products
FOR DELETE
USING (auth.uid() IS NOT NULL);

-- Policy pour autoriser la lecture publique
CREATE POLICY "Allow read for everyone"
ON portfolio_products
FOR SELECT
USING (true);
```

### 2. Variables d'Environnement

Vérifier que ces variables sont bien configurées dans Vercel :
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

### 3. Service Role Key

Utiliser le Service Role Key uniquement pour les opérations serveur qui doivent contourner le RLS.

## Tests à Effectuer

1. **Création de produit** : Vérifier que l'erreur 500 est résolue
2. **Mise à jour de produit** : Tester la modification d'un produit existant
3. **Permissions** : Vérifier que seuls les utilisateurs authentifiés peuvent modifier/supprimer
4. **Lecture publique** : Confirmer que les produits sont visibles sans authentification

## Prochaines Étapes

1. **Choisir l'option** : Adapter le frontend (recommandé) ou renommer la colonne
2. **Appliquer les modifications** : Mettre à jour le code selon l'option choisie
3. **Configurer les permissions** : Mettre en place les policies RLS appropriées
4. **Tester** : Vérifier que toutes les opérations fonctionnent correctement
5. **Déployer** : Mettre à jour le déploiement Vercel

## Avantages de la Solution Proposée

- **Flexibilité** : Le frontend peut évoluer indépendamment de la base de données
- **Maintenabilité** : Conversion automatique des noms de champs
- **Sécurité** : Mise en place de RLS appropriées
- **Performance** : Pas de changements structurels lourds dans Supabase