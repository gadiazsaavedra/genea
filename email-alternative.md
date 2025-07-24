# Gmail Configuration Alternatives

## Option 1: Use a different email service

Instead of Gmail, use a service that's easier to configure:

### Using Outlook/Hotmail:
```bash
EMAIL_SERVICE=outlook
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-regular-password
```

### Using Yahoo:
```bash
EMAIL_SERVICE=yahoo
EMAIL_USER=your-email@yahoo.com
EMAIL_PASSWORD=your-app-password
```

## Option 2: Create a new Gmail account

1. Create a new Gmail account specifically for the app
2. Enable 2FA on the new account
3. Generate App Password for the new account

## Option 3: Use SMTP directly

```bash
EMAIL_SERVICE=smtp
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=gadiazsaavedra@gmail.com
EMAIL_PASSWORD=your-regular-password
EMAIL_SECURE=false
```

## Option 4: Skip email for now

For initial deployment, we can disable email features:

```bash
EMAIL_SERVICE=disabled
EMAIL_USER=
EMAIL_PASSWORD=
```