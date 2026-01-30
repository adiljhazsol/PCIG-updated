# Laravel Backend Setup Guide for PCIG Project

## Prerequisites Installation

### Option A: Install XAMPP (Recommended for Beginners) ⭐

**XAMPP includes PHP, MySQL, and Apache in one package!**

Download from [apachefriends.org](https://www.apachefriends.org/download.html)

**Steps:**
1. Download XAMPP for Windows (PHP 8.2 or higher version)
2. Run the installer (install to `C:\xampp`)
3. During installation, select:
   - ✅ Apache
   - ✅ MySQL
   - ✅ PHP
   - ✅ phpMyAdmin
4. Start XAMPP Control Panel
5. Click "Start" for Apache and MySQL modules

**Configure PHP for Laravel:**
1. Open `C:\xampp\php\php.ini` in a text editor
2. Find and uncomment (remove `;`) these extensions:
```ini
extension=curl
extension=fileinfo
extension=gd
extension=mbstring
extension=openssl
extension=pdo_mysql
extension=zip
extension=intl
extension=bcmath
```
3. Save the file and restart Apache in XAMPP Control Panel

**Add PHP to System PATH:**
1. Open System Environment Variables
2. Edit "Path" variable
3. Add `C:\xampp\php`
4. Open new terminal and verify: `php -v`

**MySQL Access:**
- Default username: `root`
- Default password: (empty/blank)
- phpMyAdmin: `http://localhost/phpmyadmin`

---

### Option B: Install PHP and MySQL Separately

<details>
<summary>Click to expand standalone installation instructions</summary>

#### 1. Install PHP (Version 8.2 or higher)
Download and install PHP from [windows.php.net](https://windows.php.net/download/)

**Steps:**
1. Download PHP 8.2+ (Thread Safe version)
2. Extract to `C:\php`
3. Add `C:\php` to your system PATH
4. Verify installation: `php -v`

**Required PHP Extensions** (enable in `php.ini`):
```ini
extension=curl
extension=fileinfo
extension=gd
extension=mbstring
extension=openssl
extension=pdo_mysql
extension=zip
extension=intl
extension=bcmath
```

#### 2. Install MySQL/MariaDB
Download MySQL from [dev.mysql.com](https://dev.mysql.com/downloads/installer/)

**Steps:**
1. Download MySQL Installer
2. Choose "Developer Default" setup
3. Set root password (remember this!)
4. Complete installation
5. Verify: `mysql --version`

</details>

---

### 2. Install Composer (Required for Both Options)
Download from [getcomposer.org](https://getcomposer.org/download/)

**Steps:**
1. Download and run `Composer-Setup.exe`
2. The installer will detect your PHP installation (from XAMPP or standalone)
3. Follow installation wizard
4. Verify installation: `composer --version`

### 3. Install Node.js (for asset compilation)
Download from [nodejs.org](https://nodejs.org/)

**Steps:**
1. Download LTS version
2. Run installer
3. Verify: `node -v` and `npm -v`

### 4. Install Git (if not already installed)
Download from [git-scm.com](https://git-scm.com/)

---

## Laravel Project Setup

### Step 1: Create New Laravel Project

Navigate to your project directory:
```bash
cd "D:\PCIG Dev"
```

Create Laravel project:
```bash
composer create-project laravel/laravel PCIG-Backend
```

### Step 2: Configure Environment

Navigate to project:
```bash
cd PCIG-Backend
```

Copy `.env.example` to `.env`:
```bash
copy .env.example .env
```

Edit `.env` file with your database credentials:
```env
APP_NAME="PCIG Backend"
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=pcig_db
DB_USERNAME=root
DB_PASSWORD=           # Leave blank if using XAMPP default (no password)
                       # Or enter your MySQL password if you set one

FILESYSTEM_DISK=local
QUEUE_CONNECTION=database
```

> **Note for XAMPP users:** The default MySQL password is blank (empty). If you haven't set a password, leave `DB_PASSWORD=` empty.

Generate application key:
```bash
php artisan key:generate
```

### Step 3: Create Database

**Option A: Using phpMyAdmin (XAMPP Users)**
1. Make sure MySQL is running in XAMPP Control Panel
2. Open browser and go to `http://localhost/phpmyadmin`
3. Click "New" in the left sidebar
4. Database name: `pcig_db`
5. Collation: `utf8mb4_unicode_ci`
6. Click "Create"

**Option B: Using MySQL Command Line**
```bash
# Open Command Prompt and run:
mysql -u root -p
```

Then execute:
```sql
CREATE DATABASE pcig_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### Step 4: Install Required Packages

#### Laravel Sanctum (API Authentication)
```bash
composer require laravel/sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
```

#### Laravel Passport (OAuth2 - if needed for complex auth)
```bash
composer require laravel/passport
```

#### Spatie Permissions (Role & Permission Management)
```bash
composer require spatie/laravel-permission
php artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider"
```

#### Laravel Excel (Import/Export)
```bash
composer require maatwebsite/excel
```

#### Laravel PDF (Document Generation)
```bash
composer require barryvdh/laravel-dompdf
```

#### Laravel Queue (Background Jobs)
```bash
composer require laravel/horizon
php artisan horizon:install
```

#### Laravel Notifications
Already included in Laravel

#### File Storage (AWS S3 or similar)
```bash
composer require league/flysystem-aws-s3-v3 "^3.0"
```

#### Activity Log
```bash
composer require spatie/laravel-activitylog
php artisan vendor:publish --provider="Spatie\Activitylog\ActivitylogServiceProvider"
```

#### Laravel Telescope (Debugging - Development Only)
```bash
composer require laravel/telescope --dev
php artisan telescope:install
```

### Step 5: Run Migrations

```bash
php artisan migrate
```

### Step 6: Create Storage Link

```bash
php artisan storage:link
```

### Step 7: Install Passport (if using)

```bash
php artisan passport:install
```

---

## Project Structure Setup

### Create Base Directory Structure

```bash
# Create API Controllers
mkdir app\Http\Controllers\Api
mkdir app\Http\Controllers\Api\Admin
mkdir app\Http\Controllers\Api\Investor
mkdir app\Http\Controllers\Api\Auth

# Create Models
mkdir app\Models\Property
mkdir app\Models\Fund
mkdir app\Models\Transaction
mkdir app\Models\User

# Create Services
mkdir app\Services

# Create Repositories
mkdir app\Repositories

# Create Requests (Form Validation)
mkdir app\Http\Requests\Admin
mkdir app\Http\Requests\Investor

# Create Resources (API Responses)
mkdir app\Http\Resources

# Create Jobs
mkdir app\Jobs

# Create Events
mkdir app\Events

# Create Listeners
mkdir app\Listeners

# Create Notifications
mkdir app\Notifications
```

---

## CORS Configuration

Edit `config/cors.php`:
```php
return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['http://localhost:5173', 'http://localhost:3000'],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
```

---

## API Routes Setup

Edit `routes/api.php`:
```php
<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public routes
Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
});

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    
    // Investor routes
    Route::prefix('investor')->group(function () {
        // Dashboard, properties, funds, etc.
    });
    
    // Admin routes
    Route::prefix('admin')->middleware('role:admin')->group(function () {
        // All admin endpoints
    });
});
```

---

## Running the Application

### Start Laravel Development Server

```bash
php artisan serve
```

Server will run at: `http://localhost:8000`

### Start Queue Worker (for background jobs)

```bash
php artisan queue:work
```

### Start Horizon (if installed)

```bash
php artisan horizon
```

Access Horizon dashboard at: `http://localhost:8000/horizon`

### Start Telescope (Development)

Access at: `http://localhost:8000/telescope`

---

## Testing API Endpoints

### Using Postman
1. Download Postman from [postman.com](https://www.postman.com/)
2. Create new collection "PCIG API"
3. Set base URL: `http://localhost:8000/api`
4. Add authentication token to headers

### Using Thunder Client (VS Code Extension)
1. Install Thunder Client extension
2. Create new request
3. Test endpoints

---

## Database Seeding (Optional)

Create seeders for testing:
```bash
php artisan make:seeder UserSeeder
php artisan make:seeder PropertySeeder
php artisan make:seeder FundSeeder
```

Run seeders:
```bash
php artisan db:seed
```

---

## Production Deployment Checklist

- [ ] Set `APP_ENV=production` in `.env`
- [ ] Set `APP_DEBUG=false` in `.env`
- [ ] Configure proper database credentials
- [ ] Set up SSL certificate
- [ ] Configure file storage (S3, etc.)
- [ ] Set up email service (SMTP, SendGrid, etc.)
- [ ] Configure queue workers
- [ ] Set up scheduled tasks (cron jobs)
- [ ] Enable caching
- [ ] Optimize autoloader: `composer install --optimize-autoloader --no-dev`
- [ ] Cache configuration: `php artisan config:cache`
- [ ] Cache routes: `php artisan route:cache`
- [ ] Cache views: `php artisan view:cache`

---

## Useful Commands

```bash
# Clear all caches
php artisan optimize:clear

# Create new controller
php artisan make:controller Api/Admin/PropertyController --api

# Create new model with migration
php artisan make:model Property -m

# Create new request validation
php artisan make:request StorePropertyRequest

# Create new resource
php artisan make:resource PropertyResource

# Create new job
php artisan make:job ProcessPropertyImport

# Create new notification
php artisan make:notification PropertyStatusChanged

# Create new event
php artisan make:event PropertyCreated

# Create new listener
php artisan make:listener SendPropertyNotification

# Run migrations
php artisan migrate

# Rollback migrations
php artisan migrate:rollback

# Fresh migration (drop all tables and re-migrate)
php artisan migrate:fresh

# Seed database
php artisan db:seed
```

---

## Next Steps

1. Review `backend_plan.txt` for complete screen-by-screen requirements
2. Start implementing authentication system
3. Create base models and migrations
4. Implement API endpoints screen by screen
5. Test each endpoint thoroughly
6. Document API using Swagger/OpenAPI (optional but recommended)

---

## Recommended VS Code Extensions

- PHP Intelephense
- Laravel Extension Pack
- Laravel Blade Snippets
- Laravel Snippets
- Thunder Client (API testing)
- GitLens

---

## Support Resources

- Laravel Documentation: https://laravel.com/docs
- Laravel API Resources: https://laravel.com/docs/eloquent-resources
- Laravel Sanctum: https://laravel.com/docs/sanctum
- Spatie Permissions: https://spatie.be/docs/laravel-permission
- Laravel Excel: https://docs.laravel-excel.com
