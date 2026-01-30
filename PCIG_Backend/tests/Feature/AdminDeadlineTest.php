<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Deadline;
use App\Models\Property;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

use Spatie\Permission\Models\Role;

class AdminDeadlineTest extends TestCase
{
    use RefreshDatabase;

    protected $user;

    protected function setUp(): void
    {
        parent::setUp();
        // Create admin role if it doesn't exist (it should be created by seeders usually, but we refresh db)
        $role = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        
        $this->user = User::factory()->create(['role_type' => 'admin']);
        $this->user->assignRole($role);
    }

    public function test_can_get_dashboard_data()
    {
        // Create some deadlines
        Deadline::create([
            'type' => 'filing',
            'deadline_date' => now()->addDays(2),
            'status' => 'pending',
            'description' => 'Test Task 1'
        ]);

        Deadline::create([
            'type' => 'payment',
            'deadline_date' => now()->subDays(2),
            'status' => 'pending',
            'description' => 'Overdue Task'
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/admin/deadlines/dashboard-data');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'summaryCards',
                'upcomingDeadlines',
                'calendarEvents',
                'viewDate'
            ]);
            
        // Check stats
        $stats = $response->json('summaryCards');
        $this->assertEquals(2, collect($stats)->firstWhere('label', 'Total Deadlines')['value']);
        $this->assertEquals(1, collect($stats)->firstWhere('label', 'Overdue')['value']);
    }

    public function test_can_create_deadline()
    {
        $property = Property::factory()->create();

        $data = [
            'property_id' => $property->id,
            'type' => 'filing',
            'deadline_date' => '2025-12-31',
            'status' => 'pending',
            'description' => 'Test description'
        ];
        
        $response = $this->actingAs($this->user)
            ->postJson('/api/admin/deadlines', $data);

        $response->assertStatus(201)
            ->assertJson(['success' => true]);

        $this->assertDatabaseHas('deadlines', [
            'type' => 'filing',
            'description' => 'Test description'
        ]);
    }
}
