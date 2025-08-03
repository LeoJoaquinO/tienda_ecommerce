
# Joya - Elegancia Atemporal 💍

![Joya Store Banner](https://placehold.co/1200x400.png?text=Joya+Store)

Joya is a modern, stylish, and full-featured e-commerce storefront built with Next.js and designed for performance and easy deployment. It features a beautiful, clean interface, a fully functional shopping cart, and a secure checkout process with Mercado Pago.

---

### ✨ Features

-   **Modern Tech Stack:** Built with Next.js, React, and TypeScript for a fast and reliable user experience.
-   **Elegant Design:** A clean and professional design using Tailwind CSS and ShadCN UI components.
-   **Fully Responsive:** Looks great on all devices, from desktops to mobile phones.
-   **Product Management:** An admin dashboard to easily create, edit, and delete products.
-   **Shopping Cart:** A persistent client-side shopping cart that remembers items between visits.
-   **Secure Payments:** Ready for production with a secure server-side integration for Mercado Pago using the Checkout API (Payment Bricks).
-   **AI Recommendations:** Includes a Genkit-powered AI agent for intelligent product recommendations.
-   **Easy Deployment:** Comes with multiple deployment guides for different needs.

### 🚀 Getting Started (Local Development)

To get a local copy up and running on your computer, follow these simple steps.

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/joya-store.git
    ```
2.  **Navigate to the project directory:**
    ```sh
    cd joya-store
    ```
3.  **Install NPM packages:**
    ```sh
    npm install
    ```
4.  **Set up Environment Variables:**
    *   Rename the `.env.example` file to `.env.local`.
    *   Open `.env.local` and add your **Mercado Pago Test Credentials**. You can find your Public Key and Access Token in your [Mercado Pago Developer Dashboard](https://www.mercadopago.com/developers/panel/credentials).
    ```env
    MERCADOPAGO_ACCESS_TOKEN="YOUR_TEST_ACCESS_TOKEN"
    NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY="YOUR_TEST_PUBLIC_KEY"
    NEXT_PUBLIC_SITE_URL="http://localhost:9002"
    ```
5.  **Run the development server:**
    ```sh
    npm run dev
    ```
6.  Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.

By default, the application runs with **hardcoded sample data** so you can start developing without needing a database. The admin panel will appear to work, but changes won't be saved permanently until you connect a database during deployment.

---

### 🚀 Deployment Options

This project includes two guides for deploying your application to a live server.

1.  **Vercel (Recommended):** The easiest and fastest way to deploy a Next.js application. The free tier is very generous. See the detailed guide below.
2.  **Manual VPS Setup:** For users who want to manage their own server infrastructure. See the **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** file for instructions.

---

## 🚀 Recommended: Deploying to Vercel (Easiest Method)

This guide will walk you through deploying your application to Vercel, which is the platform built by the creators of Next.js. It's the most seamless way to go live.

### Part 1: Get Your Project on GitHub

First, you need to store your code in a GitHub repository. Vercel will connect directly to it.

1.  **Create a GitHub Repository:**
    *   Go to [GitHub.com](https://github.com) and log in.
    *   Click the **+** icon in the top-right and select **"New repository"**.
    *   Choose a name (e.g., `joya-store`) and select **"Private"**.
    *   **Do not** initialize it with a README or other files.
    *   Click **"Create repository"**. Copy the repository URL it shows you.

2.  **Upload Your Code:**
    *   Open a terminal in your project's folder and run these commands:
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    git branch -M main
    # Replace the URL with your new repository's URL
    git remote add origin https://github.com/your-username/joya-store.git
    git push -u origin main
    ```
    *   Refresh your GitHub page. Your code is now online!

### Part 2: Set Up a Free Database

Vercel works with many database providers. **Vercel Postgres** is a great option that integrates directly and has a generous free tier.

1.  **Create a Vercel Account:**
    *   Go to [Vercel.com](https://vercel.com) and sign up with your GitHub account.

2.  **Create a Database:**
    *   On your Vercel dashboard, go to the **"Storage"** tab.
    *   Click **"Create Database"** and choose **"Postgres"**.
    *   Give it a name (e.g., `joya-db`), choose a region, and accept the terms.
    *   After it's created, click **"Connect"**. You will see a screen with database credentials (host, user, password, etc.). **Keep this page open!** You'll need these credentials in the next step.

### Part 3: Deploy to Vercel & Configure

Now, we'll connect Vercel to your GitHub repository and tell it your secret keys.

1.  **Import Your Project:**
    *   On your Vercel dashboard, go to the **"Projects"** tab and click **"Add New... > Project"**.
    *   Find your `joya-store` repository and click **"Import"**.

2.  **Configure Environment Variables:**
    *   This is the most important step for security. You'll see a section called **"Environment Variables"**. This is where you'll put your secret keys.
    *   **Database Variables:** Add the following keys, one by one, copying the values from your Vercel Postgres database page.
        *   `DB_HOST`: The host of your database.
        *   `DB_USER`: The username for your database.
        *   `DB_PASSWORD`: The password for your database.
        *   `DB_DATABASE`: The name of your database.
    *   **Mercado Pago Variables:** Get these from your [Mercado Pago Developer Dashboard](https://www.mercadopago.com/developers). Use your **Production** credentials.
        *   `MERCADOPAGO_ACCESS_TOKEN`: Your Production "Access Token".
        *   `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY`: Your Production "Public Key".
    *   **Site URL Variable:** Vercel will assign you a domain. You need to add it here so Mercado Pago knows where to send users back to.
        *   `NEXT_PUBLIC_SITE_URL`: The full URL of your site (e.g., `https://joya-store-abcdef.vercel.app`).
    *   Double-check that all keys are copied correctly.

3.  **Deploy!**
    *   Click the **"Deploy"** button. Vercel will now build and launch your application. It might take a few minutes.

### Part 4: Final Setup

Your site is live, but it's still using the hardcoded sample data. Let's switch it to use your new live database and configure your payment webhook.

1.  **Create the Database Tables:**
    *   Your Vercel Postgres database is currently empty. We need to create the `products`, `orders`, and other tables.
    *   On your Vercel dashboard, go to the **Storage** tab, select your database, and then click on the **"Query"** tab.
    *   Copy the SQL commands from the `database.sql` file in your project and paste them into the query editor on Vercel.
    *   Click **"Run"**. This will create the necessary table structure.

2.  **Switch to Live Data Mode:**
    *   We need to tell the application to use the database.
    *   Open `src/lib/products.ts`, `src/lib/coupons.ts` and `src/lib/orders.ts` in your local code editor.
    *   You will see several commented-out sections of code labeled `--- Database Logic ---`.
    *   **DELETE or COMMENT OUT** the lines that contain the hardcoded logic.
    *   **UNCOMMENT** all the database logic sections that use `pool.query`.
    *   Save the files.

3.  **Redeploy the Changes:**
    *   In your terminal, commit and push the changes you just made:
    ```bash
    git add src/lib/products.ts src/lib/coupons.ts src/lib/orders.ts
    git commit -m "Switch to live database mode"
    git push
    ```
    *   Vercel will automatically detect the push and redeploy your application with the new settings.

4.  **Configure Mercado Pago Webhook (CRITICAL):**
    *   After your site is live with HTTPS, you must tell Mercado Pago where to send payment updates.
    *   Go to your **Mercado Pago Developer Dashboard**.
    *   Navigate to **Your Applications > (Your App Name) > Webhooks**.
    *   In the "Production" URL field, enter the full URL to your new webhook endpoint. It will be your Vercel production domain followed by `/api/mercadopago-webhook`. For example:
        ```
        https://joya-store-abcdef.vercel.app/api/mercadopago-webhook
        ```
    *   Under "Events", make sure that **Payments** (`payment`) is selected.
    *   Save your changes. This step is essential for your server to receive payment confirmations.

### You're Live!

Congratulations! Your store is now fully deployed and running on a live database at the URL Vercel provided.

-   **Go to the `/admin` page** on your live site to add your real products.
-   **Future Updates:** Every time you `git push` new changes to your `main` branch, Vercel will automatically redeploy the site for you.

---

This project was built with assistance from **Firebase Studio**.
