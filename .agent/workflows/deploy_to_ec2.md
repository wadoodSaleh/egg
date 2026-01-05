---
description: How to deploy the Egg application to Amazon EC2
---

# Deploying to Amazon EC2

This guide outlines the steps to host your Node.js application on an Amazon EC2 instance.

## Prerequisites
- An AWS Account
- A domain name (optional, but recommended)

## 1. Launch an EC2 Instance
1.  Log in to the AWS Console and go to **EC2**.
2.  Click **Launch Instance**.
3.  **Name**: `Egg-App-Server`.
4.  **AMI**: Choose **Ubuntu Server 22.04 LTS** (Free tier eligible).
5.  **Instance Type**: `t2.micro` or `t3.micro` (Free tier eligible).
6.  **Key Pair**: Create a new key pair (e.g., `egg-key`), download the `.pem` file, and keep it safe.
7.  **Network Settings**:
    - Allow SSH traffic from **My IP** (for security).
    - Allow HTTP/HTTPS traffic from the internet.
8.  **Launch Instance**.

## 2. Configure Security Group
1.  Go to your instance's **Security** tab and click the **Security Group**.
2.  Click **Edit inbound rules**.
3.  Add a Custom TCP rule:
    - **Port range**: `9000` (or your app's port).
    - **Source**: `0.0.0.0/0` (Anywhere).
4.  Save rules.

## 3. Connect to the Instance
Open your terminal (or Git Bash on Windows) and run:
```bash
# Set permissions for your key (Linux/Mac only, skip on Windows)
chmod 400 egg-key.pem

# SSH into the server
ssh -i "path/to/egg-key.pem" ubuntu@<YOUR-EC2-PUBLIC-IP>
```

## 4. Install Dependencies
Run these commands on the EC2 instance to install Node.js and MySQL:

```bash
# Update packages
sudo apt update

# Install Node.js (v18+)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MySQL Server
sudo apt install -y mysql-server

# Secure MySQL installation
sudo mysql_secure_installation
# (Follow prompts: Set root password, remove anonymous users, disallow root login remotely, remove test db, reload privileges)
```

## 5. Setup Database User
Login to MySQL and create the application user:
```bash
sudo mysql -u root -p
```
```sql
-- Create the database (optional, init_db.js can do this, but good for ensuring permissions)
CREATE DATABASE IF NOT EXISTS egg_db;

-- Create a user for the app (Update 'your_password'!)
CREATE USER IF NOT EXISTS 'egg_user'@'localhost' IDENTIFIED BY 'your_password';

-- Grant full control of egg_db to this user
GRANT ALL PRIVILEGES ON egg_db.* TO 'egg_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

## 6. Deploy Code
```bash
# Clone your repository
git clone https://github.com/wadoodSaleh/egg.git
cd egg

# Install dependencies
npm install

# Setup Environment Variables
nano .env
```
Paste your `.env` content (update `DB_USER` and `DB_PASSWORD`):
```env
PORT=9000
SESSION_SECRET=your_secret
DB_HOST=localhost
DB_USER=egg_user
DB_PASSWORD=your_password
DB_NAME=egg_db
```
Press `Ctrl+X`, `Y`, `Enter` to save.

## 7. Initialize Database
Instead of pasting SQL manually, you can run the initialization script (WARNING: This resets the database):
```bash
node backend/controls/init_db.js
```

## 8. Start Application
Use `pm2` to keep the app running:
```bash
# Install PM2 globally
sudo npm install -g pm2

# Start the app
pm2 start backend/index.js --name "egg-app"

# Setup PM2 to restart on reboot
pm2 startup
# (Copy and paste the command output by the previous step)
pm2 save
```

## 9. Setup Custom Domain (Reverse Proxy)
To access your app via `eggtimer1.duckdns.org` (port 80) instead of specifying port 9000, use Nginx:

```bash
# Install Nginx
sudo apt install -y nginx

# Create configuraton
sudo nano /etc/nginx/sites-available/default
```

Replace the content `location / { ... }` block with:
```nginx
location / {
    proxy_pass http://localhost:9000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```
Press `Ctrl+X`, `Y`, `Enter` to save.

Restart Nginx:
```bash
sudo systemctl restart nginx
```

## 10. Setup HTTPS with Certbot
Secure your site with a free SSL certificate:

```bash
# Install Certbot and Nginx plugin
sudo apt install -y certbot python3-certbot-nginx

# Obtain and install certificate
# Select "Yes" to redirect HTTP traffic to HTTPS if asked
sudo certbot --nginx -d eggtimer1.duckdns.org
```

## 11. Verification
Visit `https://eggtimer1.duckdns.org` in your browser. You should see the lock icon indicating a secure connection.
