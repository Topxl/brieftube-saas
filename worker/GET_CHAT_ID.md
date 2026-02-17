# Comment obtenir votre Chat ID Telegram

## Méthode 1 : Utiliser @userinfobot (Recommandé)

1. Ouvrez Telegram
2. Cherchez `@userinfobot`
3. Cliquez sur "Start"
4. Le bot vous enverra votre chat ID

## Méthode 2 : Utiliser @RawDataBot

1. Ouvrez Telegram
2. Cherchez `@RawDataBot`
3. Cliquez sur "Start"
4. Cherchez `"id":` dans la réponse
5. Copiez le nombre (c'est votre chat ID)

## Configuration

Une fois que vous avez votre chat ID, ajoutez-le dans `.env` :

```bash
ADMIN_TELEGRAM_CHAT_ID=123456789  # Remplacez par votre vrai chat ID
```

## Test

Après avoir configuré le chat ID et redémarré le worker :

1. Envoyez `/monitor_status` à votre bot
2. Vous devriez recevoir les statistiques du worker
3. Les alertes automatiques commenceront à arriver
