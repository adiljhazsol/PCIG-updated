<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Property;
use App\Models\Deadline;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Spatie\Permission\Models\Role;

class PropertyWorkflowTest extends TestCase
{
    use RefreshDatabase;

    protected $user;

    protected function setUp(): void
    {
        parent::setUp();
        $role = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $this->user = User::factory()->create(['role_type' => 'admin']);
        $this->user->assignRole($role);
    }

    public function test_deadline_created_when_stage_changes_to_tax_appeal()
    {
        $property = Property::factory()->create(['workflow_stage' => 'research']);

        $response = $this->actingAs($this->user)
            ->putJson("/api/admin/properties/{$property->id}", [
                'workflow_stage' => 'tax_appeal'
            ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('deadlines', [
            'property_id' => $property->id,
            'type' => 'tax_appeal',
            'description' => 'File Tax Appeal',
            'status' => 'pending'
        ]);
    }

    public function test_deadline_created_when_using_update_stage_endpoint()
    {
        $property = Property::factory()->create(['workflow_stage' => 'research']);

        $response = $this->actingAs($this->user)
            ->putJson("/api/admin/properties/{$property->id}/stage", [
                'workflow_stage' => 'fifa_processing'
            ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('deadlines', [
            'property_id' => $property->id,
            'type' => 'filing',
            'description' => 'Process FIFA Documents',
            'status' => 'pending'
        ]);
    }

    public function test_deadline_not_duplicated_if_exists()
    {
        $property = Property::factory()->create(['workflow_stage' => 'research']);
        
        // Create pre-existing deadline
        Deadline::create([
            'property_id' => $property->id,
            'type' => 'tax_appeal',
            'description' => 'File Tax Appeal',
            'deadline_date' => now()->addDays(30),
            'status' => 'pending'
        ]);

        $response = $this->actingAs($this->user)
            ->putJson("/api/admin/properties/{$property->id}", [
                'workflow_stage' => 'tax_appeal'
            ]);

        $response->assertStatus(200);

        // Should still be 1
        $this->assertEquals(1, Deadline::where('property_id', $property->id)->where('type', 'tax_appeal')->count());
    }
}
