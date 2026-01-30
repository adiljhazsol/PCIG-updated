<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\NoticeTemplate;

class NoticeTemplateSeeder extends Seeder
{
    public function run(): void
    {
        $templates = [
            [
                'name' => 'Notice of Intent to Foreclose',
                'content' => "Dear {{recipient_name}},\n\nThis letter serves as a formal notice regarding the property at {{property_address}}.\n\nFailure to resolve the outstanding balance will result in foreclosure proceedings.\n\nSincerely,\nPCIG Management"
            ],
            [
                'name' => 'Notice of Redemption Rights',
                'content' => "Dear {{recipient_name}},\n\nYou have the right to redeem your property at {{property_address}} within the statutory period.\n\nPlease contact us immediately to discuss the redemption amount.\n\nSincerely,\nPCIG Management"
            ],
            [
                'name' => 'Final Eviction Notice',
                'content' => "TO: {{recipient_name}}\nADDRESS: {{property_address}}\n\nYou are hereby notified to vacate the premises immediately.\n\nLegal action has been initiated.\n\nSincerely,\nPCIG Management"
            ]
        ];

        foreach ($templates as $template) {
            NoticeTemplate::firstOrCreate(
                ['name' => $template['name']],
                ['content' => $template['content']]
            );
        }
    }
}
