# 📱 BriefTube Worker Monitoring

Système de monitoring en temps réel via Telegram pour surveiller le worker Python.

## 🎯 Fonctionnalités

### Commandes Admin

Envoyez ces commandes à votre bot Telegram (@brief_tube_bot) :

- **`/monitor_status`** - État du worker en temps réel
  - Uptime, statistiques, performance
  - Utilisation CPU/RAM/Disque
  - Dernières vidéos traitées

- **`/monitor_stats`** - Statistiques détaillées
  - Taux de succès
  - Répartition des erreurs
  - Dernières erreurs enregistrées

- **`/monitor_logs [N]`** - Afficher les derniers logs
  - Par défaut : 30 dernières lignes
  - Maximum : 100 lignes
  - Exemple : `/monitor_logs 50`

### Alertes Automatiques

Le système envoie automatiquement des alertes pour :

| Événement               | Niveau  | Description                        |
| ----------------------- | ------- | ---------------------------------- |
| 🚀 Worker démarré       | INFO    | Au démarrage du worker             |
| ✅ Vidéo traitée        | SUCCESS | Chaque vidéo terminée avec succès  |
| 📹 Nouvelles vidéos     | SUCCESS | Nouvelles vidéos détectées par RSS |
| 🔴 Erreur de traitement | ERROR   | Échec de traitement d'une vidéo    |
| ⏱️ Timeout              | WARNING | Timeout pendant le traitement      |
| 🛑 Worker arrêté        | WARNING | Arrêt du worker                    |

### Statistiques Trackées

Le système enregistre :

- **Vidéos** : Traitées, échouées, taux de succès
- **Performance** : Temps moyen, dernière vidéo
- **RSS** : Nombre de scans, nouvelles vidéos trouvées
- **Deliveries** : Envoyées, échouées
- **Erreurs** : Par type, historique des 20 dernières
- **Système** : CPU, RAM, Disque

## 🚀 Installation

### 1. Obtenir votre Chat ID

**Méthode simple** :

1. Ouvrez Telegram
2. Cherchez `@userinfobot`
3. Envoyez `/start`
4. Copiez votre chat ID (ex: `123456789`)

### 2. Configurer le monitoring

Éditez `worker/.env` et ajoutez :

```bash
ADMIN_TELEGRAM_CHAT_ID=123456789  # Votre chat ID
```

### 3. Installer les dépendances

```bash
cd worker
pip install -r requirements.txt
```

### 4. Redémarrer le worker

```bash
# Arrêter l'ancien worker
kill $(pgrep -f "python.*main.py")

# Démarrer le nouveau worker
nohup venv/bin/python3 main.py > worker.log 2>&1 &
```

## 📊 Utilisation

### Commandes de base

```bash
# Vérifier l'état
/monitor_status

# Voir les statistiques
/monitor_stats

# Consulter les logs
/monitor_logs
/monitor_logs 50
```

### Exemple de sortie `/monitor_status`

```
🔍 Worker Status

⏱️ Uptime: 2h 15m
📅 Started: 2026-02-18 01:17

📊 Statistics:
• Videos processed: 12
• Videos failed: 2
• Success rate: 85%

📡 RSS Scanner:
• Scans completed: 27
• New videos found: 15

📤 Deliveries:
• Sent: 35
• Failed: 1

⚡ Performance:
• Avg processing: 45.2s
• Last video: 2026-02-18 03:12

💻 System:
• CPU: 12.5%
• Memory: 8.3% (512 MB)
• Disk: 45.2 GB free
```

## 🔧 Troubleshooting

### Les commandes ne fonctionnent pas

**Vérifiez** :

1. `ADMIN_TELEGRAM_CHAT_ID` est configuré dans `.env`
2. Le chat ID est correct (sans guillemets)
3. Le worker a été redémarré après configuration

### Pas d'alertes

**Vérifiez** :

1. Le worker tourne (`ps aux | grep main.py`)
2. Le chat ID est bien configuré
3. Les logs pour voir les erreurs : `tail -50 worker.log`

### Alertes trop nombreuses

Les alertes de succès sont envoyées pour **chaque** vidéo traitée. Si c'est trop, vous pouvez :

- Commenter les alertes SUCCESS dans `main.py`
- Garder seulement les alertes ERROR et WARNING

## 📝 Architecture

```
worker/
├── monitoring.py        # Système de statistiques et alertes
├── bot_handler.py       # Commandes Telegram (modifié)
├── main.py              # Intégration monitoring (modifié)
├── config.py            # ADMIN_TELEGRAM_CHAT_ID (ajouté)
└── requirements.txt     # psutil (ajouté)
```

## 🎯 Prochaines améliorations

- [ ] Commande `/monitor_restart` pour redémarrer le worker
- [ ] Graphiques de performance
- [ ] Alertes configurables (seuils personnalisables)
- [ ] Dashboard web intégré
