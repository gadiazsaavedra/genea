# Update Email Password

## After you get your Gmail App Password:

1. **Copy your 16-character password** (remove spaces)
2. **Tell me the password** and I'll update the .env.production file
3. **Or manually update:**

```bash
# In genea-app/server/.env.production
# Replace:
EMAIL_PASSWORD=AQUI_TU_APP_PASSWORD

# With:
EMAIL_PASSWORD=your16characterpassword
```

## Example:
If your password is: `abcd efgh ijkl mnop`
Update to: `EMAIL_PASSWORD=abcdefghijklmnop`

## Test the configuration:
```bash
cd genea-app/server
node ../../test-email-config.js
```