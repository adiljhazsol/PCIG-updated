# PCIG Project - Setup Guide

This guide provides step-by-step instructions to set up and run the PCIG project (Laravel Backend + React Frontend) on a new device.

## Prerequisites

Ensure you have the following installed on your machine:
1.  **XAMPP** (or any MySQL/PHP environment) - [Download XAMPP](https://www.apachefriends.org/index.html)
2.  **Composer** (PHP Dependency Manager) - [Download Composer](https://getcomposer.org/)
3.  **Node.js & npm** (Frontend Runtime) - [Download Node.js](https://nodejs.org/)
4.  **Git** (Version Control) - [Download Git](https://git-scm.com/)

---

## Project Structure

```
PCIG/
├── PCIG_Backend/      # Laravel Backend API
│   ├── database/      # Contains database.sql for import
│   └── ...
├── PCIG_Frontend/     # React + Vite Frontend
└── README.md          # This file
```

---

## 1. Backend Setup (Laravel)

1.  **Navigate to the backend directory:**
    ```bash
    cd PCIG_Backend
    ```

2.  **Install PHP dependencies:**
    ```bash
    composer install
    ```

3.  **Configure Environment Variables:**
    -   Copy the example environment file:
        ```bash
        cp .env.example .env
        ```
    -   Open `.env` and configure your database settings:
        ```ini
        DB_CONNECTION=mysql
        DB_HOST=127.0.0.1
        DB_PORT=3306
        DB_DATABASE=pcig_db
        DB_USERNAME=root
        DB_PASSWORD=
        ```

4.  **Generate Application Key:**
    ```bash
    php artisan key:generate
    ```

5.  **Database Setup:**
    -   Start **Apache** and **MySQL** in XAMPP.
    -   Create a new database named `pcig_db` (or whatever you named it in `.env`) using phpMyAdmin or CLI.
    -   **Option A: Import existing data (Recommended for transfer)**
        -   Import the `database/database.sql` file into your database.
        -   CLI Command:
            ```bash
            mysql -u root -p pcig_db < database/database.sql
            ```
    -   **Option B: Fresh Migration & Seed (Reset data)**
        ```bash
        php artisan migrate:fresh --seed
        ```

6.  **Start the Backend Server:**
    ```bash
    php artisan serve --host=127.0.0.1 --port=8000
    ```
    -   The API will be available at `http://127.0.0.1:8000`.

---

## 2. Frontend Setup (React + Vite)

1.  **Open a new terminal** and navigate to the frontend directory:
    ```bash
    cd PCIG_Frontend
    ```

2.  **Install JavaScript dependencies:**
    ```bash
    npm install
    ```

3.  **Verify API Configuration:**
    -   Ensure `src/services/api.ts` points to your backend URL:
        ```typescript
        baseURL: 'http://127.0.0.1:8000/api',
        ```

4.  **Start the Frontend Development Server:**
    ```bash
    npm run dev
    ```
    -   Access the application at `http://localhost:3000` (or the port shown in terminal).

---

## 3. Login Credentials

Default credentials (if using `php artisan db:seed` or the provided dump):

**Admin:**
-   **Email:** `admin@example.com`
-   **Password:** `password`

**Investor:**
-   **Email:** `investor@example.com`
-   **Password:** `password`

---

## Troubleshooting

### Network / CORS Errors
-   Ensure the backend is running on `http://127.0.0.1:8000`.
-   If you see `ERR_CONNECTION_REFUSED`, check if the Laravel server is running.
-   If you see CORS errors, ensure `PCIG_Backend/config/cors.php` allows your frontend origin (e.g., `http://localhost:3000`).

### Database Connection Issues
-   Ensure MySQL is running in XAMPP.
-   Verify credentials in `PCIG_Backend/.env` match your local MySQL setup.

### "Permission Denied" (Storage/Cache)
-   If you encounter permission errors in Laravel:
    ```bash
    # Windows (PowerShell) - usually not needed, but if issues arise:
    icacls storage /grant Everyone:F /t
    icacls bootstrap/cache /grant Everyone:F /t
    ```
