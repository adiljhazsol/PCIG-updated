<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Property;
use Illuminate\Support\Facades\DB;

$total = Property::count();
echo "Total Properties: " . $total . "\n\n";

echo "Breakdown by Stage:\n";
$stages = Property::select('workflow_stage', DB::raw('count(*) as total'))
    ->groupBy('workflow_stage')
    ->get();

foreach ($stages as $stage) {
    echo $stage->workflow_stage . ": " . $stage->total . "\n";
}
