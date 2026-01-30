<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\InvestorDocument;
use App\Models\User;
use Carbon\Carbon;

class InvestorDocumentSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::role('investor')->first();

        if (!$user) {
            $user = User::first();
        }

        if (!$user) {
            echo "No user found to assign documents.\n";
            return;
        }

        InvestorDocument::create([
            'user_id' => $user->id,
            'type' => 'K-1',
            'title' => '2025 K-1 Form',
            'file_path' => 'documents/k1_2025.pdf', // Dummy path
            'year' => 2025,
            'generated_at' => Carbon::now()->subDays(5),
        ]);

        InvestorDocument::create([
            'user_id' => $user->id,
            'type' => 'Statement',
            'title' => 'Q4 2025 Statement',
            'file_path' => 'documents/q4_2025.pdf', // Dummy path
            'year' => 2025,
            'generated_at' => Carbon::now()->subDays(10),
        ]);

        InvestorDocument::create([
            'user_id' => $user->id,
            'type' => 'Contract',
            'title' => 'Subscription Agreement',
            'file_path' => 'documents/sub_agreement.pdf', // Dummy path
            'year' => 2025,
            'generated_at' => Carbon::now()->subMonth(),
        ]);
        
        echo "Seeded 3 documents for user ID: " . $user->id . "\n";
    }
}
