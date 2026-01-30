<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

echo "Checking raw transaction data for bad amounts...\n";

$transactions = DB::table('transactions')->get();
foreach ($transactions as $t) {
    echo "ID: {$t->id}, Amount: '{$t->amount}' (Type: " . gettype($t->amount) . ")\n";
    if ($t->amount === '' || $t->amount === null) {
        echo ">>> FOUND BAD RECORD: ID {$t->id}\n";
    }
}
