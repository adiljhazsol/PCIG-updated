<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Property;
use App\Models\Task;
use Spatie\Permission\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminDashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_dashboard_returns_correct_structure()
    {
        $role = Role::create(['name' => 'admin', 'guard_name' => 'web']);
        $user = User::factory()->create(['role_type' => 'admin']);
        $user->assignRole($role);
        
        Property::factory()->count(5)->create();
        Task::factory()->count(3)->create(['assigned_to' => $user->id]);

        $response = $this->actingAs($user)
            ->getJson('/api/admin/dashboard');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'header',
                    'alerts',
                    'keyMetrics',
                    'workflowPipeline',
                    'upcomingDeadlines',
                    'actionItems',
                    'workflowAlerts',
                    'recentActivity',
                    'quickStats'
                ]
            ]);
    }
}
