# VPS Deployment

This app can run on the same VPS as `schoolhub.co.ke` under the subdomain `field.schoolhub.co.ke`.

## Target Layout

- Frontend: static Vite build served by Nginx
- Backend: NestJS running as a systemd service on `127.0.0.1:3001`
- Public API path: `https://field.schoolhub.co.ke/api`
- Database: PostgreSQL reachable from the VPS

## DNS

Create an `A` record:

```text
field.schoolhub.co.ke -> YOUR_VPS_PUBLIC_IP
```

For the current VPS from the review report:

```text
field.schoolhub.co.ke -> 102.212.246.201
```

## Server Files

Place the app at:

```bash
/var/www/field-crm
```

Install dependencies:

```bash
cd /var/www/field-crm/api
npm ci

cd /var/www/field-crm/client
npm ci
```

## API Env

Create `/var/www/field-crm/api/.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/field_crm?schema=public"
JWT_SECRET="replace-this-with-a-long-random-secret"
PORT="3001"
CORS_ORIGIN="https://field.schoolhub.co.ke"
```

Then prepare the database and build the API:

```bash
cd /var/www/field-crm/api
npx prisma generate
npx prisma db push
npm run build
```

If the API build runs out of memory on the VPS, use:

```bash
NODE_OPTIONS=--max-old-space-size=4096 npm run build
```

## Frontend Env

Create `/var/www/field-crm/client/.env.production`:

```env
VITE_API_URL="/api"
```

Then build:

```bash
cd /var/www/field-crm/client
npm run build
```

## Systemd

Copy the service file:

```bash
sudo cp /var/www/field-crm/deploy/systemd/field-crm-api.service /etc/systemd/system/field-crm-api.service
sudo systemctl daemon-reload
sudo systemctl enable field-crm-api
sudo systemctl start field-crm-api
sudo systemctl status field-crm-api
```

The included systemd service already sets:

```env
NODE_ENV=production
NODE_OPTIONS=--max-old-space-size=4096
```

## Nginx

Copy the Nginx config:

```bash
sudo cp /var/www/field-crm/deploy/nginx/field-crm.conf /etc/nginx/sites-available/field-crm.conf
sudo ln -s /etc/nginx/sites-available/field-crm.conf /etc/nginx/sites-enabled/field-crm.conf
sudo nginx -t
sudo systemctl reload nginx
```

## Scripted Deploy

After DNS is pointed to the VPS and the repo is available at `/var/www/field-crm`, you can run:

```bash
cd /var/www/field-crm
bash deploy/scripts/deploy-vps.sh
```

The script does not overwrite an existing API `.env`. If `.env` is missing, it creates one from the production example and stops so you can fill in the database URL and JWT secret.

## HTTPS

Use Certbot after DNS points to the VPS:

```bash
sudo certbot --nginx -d field.schoolhub.co.ke
```

## Verify

```bash
curl https://field.schoolhub.co.ke/
curl https://field.schoolhub.co.ke/api/
```

Then open:

```text
https://field.schoolhub.co.ke/register
```
