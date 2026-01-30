<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

echo "Fixing transaction amounts...\n";

$transactions = DB::table('transactions')->get();
echo "Found " . $transactions->count() . " transactions.\n";

foreach ($transactions as $t) {
    $raw = $t->amount;
    // Remove '$', ',', '+' 
    // Keep digits, '.', '-'
    $clean = preg_replace('/[^\d.-]/', '', $raw);
    
    echo "Processing ID {$t->id}: '{$raw}' -> '{$clean}'\n";
    
    if ($raw !== $clean) {
        echo "Updating ID {$t->id}...\n";
        DB::table('transactions')->where('id', $t->id)->update(['amount' => $clean]);
    }
}

echo "Transaction amounts fixed.\n";
