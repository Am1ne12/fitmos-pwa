# 🏋️ Fitmos - Application Fitness PWA# Fitness App# 💪 My Fitness App



Application de fitness complète avec suivi nutrition, entraînements et progressive overload.



## 📱 Installation sur iPhone (PWA)Application de fitness Angular avec suivi de nutrition, workouts et eau.Application de suivi de fitness et nutrition avec calcul automatique des calories et progressive overload tracking.



### Étape 1 : Héberger l'application

L'application doit être hébergée sur un serveur HTTPS. Options recommandées :

## Installation## ✨ Fonctionnalités

1. **Vercel** (Gratuit - Recommandé)

   ```bash

   npm install -g vercel

   npm run build```bash### 📊 Tableau de Bord

   vercel --prod

   ```npm install- Vue d'ensemble de vos statistiques



2. **Netlify** (Gratuit)```- Affichage de vos calories quotidiennes recommandées

   - Glissez le dossier `dist/my-fitness-app/browser` sur netlify.com

   - Ou utilisez la CLI : `netlify deploy --prod`- Suivi de vos progrès



3. **Firebase Hosting** (Gratuit)## Configuration

   ```bash

   npm install -g firebase-tools### 🏋️ Entraînement (Workouts)

   firebase login

   firebase init hostingCréer un fichier `src/environments/environment.ts` :**Fonctionnement :**

   firebase deploy

   ```1. Cliquez sur **"Commencer un entraînement"**



### Étape 2 : Installer sur iPhone```typescript2. Donnez un **titre** à votre séance (ex: "Push Day")



Une fois l'application hébergée :export const environment = {3. Ajoutez des **exercices** :



1. **Ouvrir Safari** sur votre iPhone  production: false,   - Nom de l'exercice (ex: "Bench Press")

2. Aller sur l'URL de votre application (ex: https://fitmos.vercel.app)

3. Appuyer sur le bouton **Partager** (icône carré avec flèche vers le haut)  supabase: {   - Ajoutez des **séries** avec :

4. Faire défiler et appuyer sur **"Sur l'écran d'accueil"**

5. Confirmer le nom "Fitmos" et appuyer sur **Ajouter**    url: 'VOTRE_SUPABASE_URL',     - Répétitions (reps)



✅ **L'icône Fitmos apparaît maintenant sur votre écran d'accueil !**    key: 'VOTRE_SUPABASE_KEY'     - Poids en kg



Quand vous appuyez dessus :  }4. Cliquez sur **"Terminer l'entraînement"** pour sauvegarder

- ✅ L'app s'ouvre en plein écran (sans barre Safari)

- ✅ Logo Fitmos affiché};

- ✅ Fonctionne même hors ligne (grâce au Service Worker)

- ✅ Se comporte comme une vraie app native```**Progressive Overload :**



## 🎨 Caractéristiques PWA- Tous vos entraînements sont sauvegardés dans l'historique



- ✅ **Installable** : Icône sur l'écran d'accueil## Développement- Consultez vos anciennes séances pour augmenter progressivement les charges

- ✅ **Plein écran** : Pas de barre de navigation Safari

- ✅ **Hors ligne** : Fonctionne sans connexion Internet

- ✅ **Rapide** : Cache intelligent pour chargement instantané

- ✅ **Logo personnalisé** : Icône Fitmos orange```bash### 🍎 Nutrition



## 🚀 Développement Localnpm start- Recherche d'aliments via l'**API USDA FoodData Central**



```bash```- Base de données de plus de 300,000 aliments

# Installation des dépendances

npm install- Ajout de repas à votre journal quotidien



# Lancer en développement## Production- Suivi des calories et macronutriments

npm start



# Build de production

npm run build```bash### ⚙️ Paramètres



# Générer les icônes PWAnpm run build- Modification de votre profil

./generate-icons.sh

``````- Mise à jour de vos informations physiques



## 📦 Structure PWA- Recalcul automatique des calories



```Les fichiers de build seront dans `dist/`.

src/

├── manifest.json          # Configuration PWA## 🧮 Calcul des Calories

├── service-worker.js      # Cache et mode hors ligne

├── assets/L'application utilise l'**équation de Mifflin-St Jeor** pour calculer vos besoins caloriques.

│   ├── Fitmos.png        # Logo source

│   └── icons/            # Icônes générées (16x16 à 512x512)### Formule :

│       ├── icon-*.png

│       ├── apple-touch-icon.png (180x180)**1. Métabolisme de Base (BMR) :**

│       └── apple-splash.png (1125x2436)- Hommes : `BMR = (10 × poids) + (6.25 × taille) - (5 × âge) + 5`

└── index.html            # Meta tags PWA et iOS- Femmes : `BMR = (10 × poids) + (6.25 × taille) - (5 × âge) - 161`

```

**2. Dépense Énergétique Totale (TDEE) :**

## 🌐 Variables d'Environnement```

TDEE = BMR × Facteur d'activité

L'application utilise Supabase pour l'authentification et la base de données.```

Les clés sont configurées dans `src/environments/environment.prod.ts`.

Facteurs d'activité :

## 📱 Support- Sédentaire : 1.2

- Légère : 1.375

- ✅ iPhone (iOS 11.3+)- Modérée : 1.55

- ✅ Android- Active : 1.725

- ✅ Desktop (Chrome, Edge, Firefox)- Très Active : 1.9



## 🎯 Fonctionnalités**3. Ajustement selon l'objectif :**

- Perte de poids : TDEE - 500 cal

- Suivi nutrition quotidien- Maintien : TDEE

- Calcul automatique des calories- Prise de masse : TDEE + 300 cal

- Progressive overload pour les entraînements

- Suivi de l'hydratation (2L/jour)📖 **Plus de détails :** Voir [CALORIE_CALCULATION.md](./CALORIE_CALCULATION.md)

- Statistiques hebdomadaires

- Mode hors ligne## 🚀 Installation & Lancement



---### Prérequis

- Node.js 18+

**Créé avec Angular 17 + Supabase**- npm ou yarn

- Compte Supabase

### Installation
```bash
npm install
```

### Configuration
1. Créer un compte sur [Supabase](https://supabase.com)
2. Exécuter les migrations SQL :
   - `supabase/migrations/001_create_user_profiles.sql`
   - `supabase/migrations/002_create_workouts.sql`
   - `supabase/migrations/003_create_nutrition.sql`
3. Configurer vos clés dans `src/environments/environment.ts`

### Lancement
```bash
npm start
```

L'application sera accessible sur `http://localhost:4200`

## 🗄️ Base de Données

### Tables

#### `user_profiles`
- Informations personnelles (âge, poids, taille, sexe)
- Niveau d'activité
- Objectif (perte/maintien/prise de masse)
- **Calories quotidiennes calculées automatiquement**

#### `workouts`
- Séances d'entraînement
- Date et notes

#### `workout_exercises`
- Exercices de chaque séance
- Nom de l'exercice

#### `exercise_sets`
- Séries de chaque exercice
- Répétitions et poids (kg)

#### `meals` & `food_items`
- Repas quotidiens
- Aliments et macronutriments

## 🎨 Design

Design moderne et épuré :
- ✅ Fond blanc / gris clair
- ✅ Accent bleu (#0066FF)
- ✅ Bordures fines
- ✅ Ombres subtiles
- ✅ Typographie Apple System Font
- ✅ Responsive (mobile-first)

## 🔐 Sécurité

- Authentification via Supabase Auth
- Row Level Security (RLS) sur toutes les tables
- Chaque utilisateur accède uniquement à ses propres données

## 📱 Responsive

L'application est entièrement responsive :
- Desktop : Navigation en haut
- Mobile : Navigation en bas (bottom bar)

## 🛠️ Technologies

- **Frontend :** Angular 17+ (Standalone Components, Signals)
- **Backend :** Supabase (PostgreSQL, Auth)
- **API Nutrition :** USDA FoodData Central
- **Style :** CSS personnalisé (design system)

## 📝 Licence

MIT

---

**Développé avec ❤️ pour votre progression fitness**
