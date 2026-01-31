# Intégration Discord - Notifications Webhook

## Configuration

### 1. Créer un Webhook Discord

1. Ouvrez Discord et allez sur votre serveur
2. Cliquez sur **Paramètres du serveur** (icône engrenage)
3. Allez dans **Intégrations** → **Webhooks**
4. Cliquez sur **Nouveau Webhook**
5. Configurez le webhook :
   - **Nom** : `Rustikop Notifications` (ou ce que vous voulez)
   - **Canal** : Choisissez le canal où recevoir les notifications
   - **Avatar** : (optionnel) Ajoutez une image
6. Cliquez sur **Copier l'URL du Webhook**

### 2. Ajouter la variable d'environnement

Ajoutez cette variable dans vos fichiers d'environnement :

**Local (.env.local)** :
```env
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/VOTRE_ID/VOTRE_TOKEN
```

**Vercel** :
1. Allez dans les paramètres de votre projet Vercel
2. Settings → Environment Variables
3. Ajoutez :
   - **Name** : `DISCORD_WEBHOOK_URL`
   - **Value** : L'URL du webhook Discord

## Notifications disponibles

### 🛒 Nouvelle Commande
- **Déclencheur** : Quand un client passe une commande
- **Informations** :
  - Nom du client
  - Email
  - Total de la commande
  - Articles commandés
  - Adresse de livraison
  - Statut
  - Code promo utilisé

### 👤 Nouveau Compte Créé
- **Déclencheur** : Quand un utilisateur s'inscrit
- **Informations** :
  - Nom
  - Email
  - Rôle
  - Titre du rôle

### ⭐ Nouvel Avis Client
- **Déclencheur** : Quand un client laisse un avis
- **Informations** :
  - Produit concerné
  - Auteur de l'avis
  - Note (étoiles)
  - Commentaire
  - Statut vérifié

### 📬 Nouveau Message de Contact
- **Déclencheur** : Quand quelqu'un envoie un message via le formulaire de contact
- **Informations** :
  - Nom de l'expéditeur
  - Email
  - Contenu du message

## Architecture technique

### Fichiers créés/modifiés

```
lib/
  discord.js           # Utilitaire backend pour envoyer les webhooks
api/
  discord-notify.js    # Endpoint API pour les notifications frontend
  orders.js            # Modifié - notification nouvelle commande
  users.js             # Modifié - notification nouveau compte
src/
  utils/
    discordService.js  # Service frontend pour appeler l'API
  context/
    DataContext.jsx    # Modifié - notification nouvel avis
  pages/
    Contact.jsx        # Modifié - notification nouveau message
```

### Utilisation dans le code

**Backend (API endpoints)** :
```javascript
import { sendDiscordNotification, DiscordNotifications } from '../lib/discord.js';

// Envoyer une notification
await sendDiscordNotification(DiscordNotifications.newOrder(orderData));
```

**Frontend** :
```javascript
import { notifyNewContactMessage, notifyNewReview } from '../utils/discordService';

// Nouveau message de contact
notifyNewContactMessage(name, email, message);

// Nouvel avis
notifyNewReview(review, productName);
```

## Personnalisation

### Modifier les couleurs des embeds

Dans `lib/discord.js`, modifiez les valeurs `color` (format hexadécimal) :
- 🟢 Commandes : `0x4CAF50` (vert)
- 🔵 Utilisateurs : `0x2196F3` (bleu)
- 🟡 Avis : `0xFFC107` (or)
- 🟣 Contact : `0x9C27B0` (violet)

### Ajouter de nouveaux types de notifications

1. Ajoutez un nouveau template dans `DiscordNotifications` (lib/discord.js)
2. Ajoutez le cas dans le switch de `api/discord-notify.js`
3. Créez une fonction helper dans `src/utils/discordService.js`

## Dépannage

### La notification ne s'envoie pas

1. Vérifiez que `DISCORD_WEBHOOK_URL` est bien configuré
2. Vérifiez les logs Vercel pour les erreurs
3. Testez le webhook manuellement avec curl :
   ```bash
   curl -X POST -H "Content-Type: application/json" \
     -d '{"content": "Test notification"}' \
     VOTRE_WEBHOOK_URL
   ```

### Erreur 400 Bad Request

- Vérifiez le format de l'URL du webhook
- Assurez-vous que le webhook n'a pas été supprimé dans Discord

### Rate limiting

Discord limite les webhooks à environ 30 messages/minute. Si vous avez beaucoup de trafic, considérez :
- Regrouper les notifications
- Utiliser une queue de messages
