# Deployment Guide: From Your Computer to a Live Server

This guide provides all the steps needed to get your application code from your computer into a GitHub repository and then deploy it to a production VPS (Virtual Private Server), like the one you have with Don Web.

This guide is structured in two parts:
1.  **Part 1: Getting Your Code on GitHub.** This is how you'll manage your code and its versions securely.
2.  **Part 2: Deploying to Your Don Web VPS.** This covers setting up your server, connecting your database, and launching your live store.

---

## Part 1: Getting Your Code on GitHub

Before you can deploy your site, you need a central, secure place to store your code. GitHub is the industry standard for this. You will only need **one repository** for this entire project.

### Step 1: Create a Private GitHub Repository

First, you need an empty repository on GitHub.com to hold your code. We'll make it **private** because it's good practice for commercial applications.

1.  Go to [GitHub.com](https://github.com) and log in.
2.  Click the **+** icon in the top-right corner and select **"New repository"**.
3.  **Repository name:** Choose a name, like `joya-store`.
4.  **Description:** (Optional) Add a short description.
5.  Select **"Private"**. This is important.
6.  **Do not** initialize the repository with a README, .gitignore, or license. We will use the ones already in this project.
7.  Click **"Create repository"**.

You will be taken to a page with a URL. Keep this page open; you'll need the URL in the next step. It will look something like `https://github.com/your-username/joya-store.git`.

### Step 2: Connect Your Project and Upload Your Code

Now, we'll connect your local project folder to the empty repository you just created on GitHub and upload your files.

Open a terminal or command prompt, navigate to your project's root folder, and run the following commands in order.

1.  **Initialize Git:** This turns your project folder into a Git repository.
    ```bash
    git init
    ```

2.  **Add All Files for Tracking:** This stages all your project files to be committed.
    ```bash
    git add .
    ```

3.  **Commit Your Files:** This saves a snapshot of your project.
    ```bash
    git commit -m "Initial commit"
    ```

4.  **Set the Default Branch Name:** The standard is `main`.
    ```bash
    git branch -M main
    ```

5.  **Connect to Your GitHub Repository:** This is where you'll use the URL from Step 1.
    ```bash
    # Replace the URL with your repository's URL
    git remote add origin https://github.com/your-username/joya-store.git
    ```

6.  **Push Your Code to GitHub:** This uploads your files.
    ```bash
    git push -u origin main
    ```

Refresh your GitHub repository page. You should see all your project files there!

### Step 3: What About the Secret Keys?

This is the most critical part of security. **Your secret keys should never be in your GitHub repository.**

-   The file `.gitignore` in your project explicitly tells Git to **ignore** the `.env.local` file.
-   This means your `.env.local` file, which holds your database and Mercado Pago keys, will **never** be uploaded to GitHub. It only ever exists on your local computer and on your secure production server.

---

## Part 2: Deploying to Your Don Web VPS

This guide assumes your Don Web VPS is running a common Linux distribution like Ubuntu.

### Step 1: Connect to Your Server

Log in to your VPS using SSH (Secure Shell).

1.  Open your terminal (Terminal on Mac/Linux, or PowerShell/WSL on Windows).
2.  Use the following command, replacing `username` and `your_server_ip` with the credentials provided by Don Web:
    ```bash
    ssh username@your_server_ip
    ```
3.  Enter the password for your VPS when prompted. You are now controlling your server.

### Step 2: Install Server Software

We need to install the necessary software to run your Next.js application.

1.  **Update Server Packages:**
    ```bash
    sudo apt update && sudo apt upgrade -y
    ```
2.  **Install Git:**
    ```bash
    sudo apt install git -y
    ```
3.  **Install Node.js using NVM (Node Version Manager):**
    ```bash
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
    source ~/.bashrc
    nvm install 20
    nvm use 20
    ```
4.  **Install PM2 (Process Manager):** This keeps your app running 24/7.
    ```bash
    npm install pm2 -g
    ```

### Step 3: Clone and Configure Your Project

Now, let's get your code from GitHub onto the server.

1.  **Clone Your GitHub Repository:**
    ```bash
    git clone https://github.com/your-username/joya-store.git
    ```
2.  **Navigate into Your Project Folder:**
    ```bash
    cd joya-store
    ```
3.  **Create Your Environment File:**
    ```bash
    nano .env.local
    ```
4.  **Add Your Secrets:** Copy the following into the editor, replacing the placeholders with your **actual** credentials from Don Web and Mercado Pago.
    ```env
    DB_HOST="your_mysql_host"
    DB_USER="your_mysql_username"
    DB_PASSWORD="your_mysql_password"
    DB_DATABASE="your_mysql_database_name"
    MERCADOPAGO_ACCESS_TOKEN="your_mercadopago_access_token"
    ```
5.  Save and exit nano by pressing `Ctrl+X`, then `Y`, then `Enter`.

### Step 4: Set Up the Database and Live Data

Your project currently uses hardcoded sample data. Now, we'll set up your real database and switch the app to use it.

1.  **Create the `products` table:** Run the `database.sql` script included in the project. It will ask for your database password.
    ```bash
    mysql -h your_mysql_host -u your_mysql_username -p your_mysql_database_name < database.sql
    ```
    This creates the table structure.

2.  **Switch to Live Data Mode:** You need to edit one file to tell the app to use the database instead of the hardcoded data.
    -   Open `src/lib/products.ts` with nano:
        ```bash
        nano src/lib/products.ts
        ```
    -   You will see commented-out sections of code labeled `--- Database Logic ---`.
    -   **DELETE** or **COMMENT OUT** the hardcoded logic.
    -   **UNCOMMENT** all the database logic sections.
    -   The file should now be using `pool.query` to talk to your database.
    -   Save and exit nano (`Ctrl+X`, `Y`, `Enter`).

3.  **Delete Hardcoded Items and Create Real Ones:**
    -   After switching to live data, your products table will be empty.
    -   You can now launch the application (see Step 5) and go to the `/admin` page.
    -   From the admin dashboard, you can now add, edit, and delete your real products. Every change will be saved directly to your MySQL database.


### Step 5: Build and Launch Your Application

1.  **Install Dependencies:**
    ```bash
    npm install
    ```
2.  **Build the App:**
    ```bash
    npm run build
    ```
3.  **Start the App with PM2:**
    ```bash
    pm2 start npm --name "joya-store" -- start
    ```
4.  **Save the PM2 Process:** This makes your app restart automatically if the server reboots.
    ```bash
    pm2 save
    ```

Your app is running, but it's only accessible via `http://your_server_ip:3000`. The final steps make it professional and secure.

### Step 6: Set Up Nginx as a Reverse Proxy

Nginx will direct traffic from your domain to your app.

1.  **Install Nginx:**
    ```bash
    sudo apt install nginx -y
    ```
2.  **Create a Configuration File:**
    ```bash
    sudo nano /etc/nginx/sites-available/your_domain.com
    ```
3.  **Paste this configuration**, replacing `your_domain.com` with your actual domain:
    ```nginx
    server {
        listen 80;
        server_name your_domain.com www.your_domain.com;

        location / {
            proxy_pass http://localhost:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
    ```
4.  **Enable Your New Configuration and Restart Nginx:**
    ```bash
    sudo ln -s /etc/nginx/sites-available/your_domain.com /etc/nginx/sites-enabled/
    sudo systemctl restart nginx
    ```

### Step 7: Add SSL with Let's Encrypt (HTTPS)

This is crucial for security and user trust.

1.  **Install Certbot:**
    ```bash
    sudo apt install certbot python3-certbot-nginx -y
    ```
2.  **Run Certbot:** It will ask a few questions and then configure everything automatically.
    ```bash
    sudo certbot --nginx -d your_domain.com -d www.your_domain.com
    ```

---

## You're Live!

Your store is now fully deployed and accessible securely at `https://your_domain.com`.

### How to Update Your Site in the Future

1.  Make changes on your local computer.
2.  Push your new code to GitHub: `git add . && git commit -m "Update message" && git push`
3.  SSH into your server: `ssh username@your_server_ip`
4.  Navigate to your project folder: `cd joya-store`
5.  Pull the latest changes: `git pull`
6.  Re-install dependencies and re-build: `npm install && npm run build`
7.  Restart the app with PM2: `pm2 restart joya-store`
