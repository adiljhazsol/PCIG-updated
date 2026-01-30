<?php

namespace Tests\Feature\Admin;

use App\Models\Deadline;
use App\Models\Property;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class TaxAppealDeadlineTest extends TestCase
{
    use RefreshDatabase;

    protected $admin;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create role
        $role = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);

        // Create an admin user
        $this->admin = User::factory()->create([
            'role_type' => 'admin',
        ]);
        
        $this->admin->assignRole($role);
    }

    /** @test */
    public function it_creates_deadline_when_property_created_in_tax_appeal_stage()
    {
        $response = $this->actingAs($this->admin)->postJson('/api/admin/properties', [
            'parcel_id' => 'TAX-TEST-001',
            'address' => '123 Tax Ave',
            'city' => 'Tax City',
            'state' => 'FL',
            'zip_code' => '12345',
            'workflow_stage' => 'tax_appeal',
            'status' => 'active',
        ]);

        $response->assertStatus(201);
        $propertyId = $response->json('data.id');

        $this->assertDatabaseHas('deadlines', [
            'property_id' => $propertyId,
            'type' => 'tax_appeal',
            'description' => 'File Tax Appeal',
            'status' => 'pending',
        ]);
        
        // Verify deadline date is roughly 30 days out
        $deadline = Deadline::where('property_id', $propertyId)->where('type', 'tax_appeal')->first();
        $this->assertEquals(now()->addDays(30)->toDateString(), $deadline->deadline_date->toDateString());
    }

    /** @test */
    public function it_creates_deadline_when_property_updated_to_tax_appeal_stage()
    {
        $property = Property::factory()->create([
            'workflow_stage' => 'research',
        ]);

        $response = $this->actingAs($this->admin)->putJson("/api/admin/properties/{$property->id}", [
            'workflow_stage' => 'tax_appeal',
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('deadlines', [
            'property_id' => $property->id,
            'type' => 'tax_appeal',
            'description' => 'File Tax Appeal',
            'status' => 'pending',
        ]);
    }

    /** @test */
    public function it_does_not_duplicate_deadline_if_already_exists()
    {
        $property = Property::factory()->create([
            'workflow_stage' => 'research',
        ]);

        // Create initial deadline manually
        Deadline::create([
            'property_id' => $property->id,
            'type' => 'tax_appeal',
            'deadline_date' => now()->addDays(10), // Different date
            'description' => 'File Tax Appeal',
            'status' => 'pending',
        ]);

        // Update property to tax_appeal stage
        $response = $this->actingAs($this->admin)->putJson("/api/admin/properties/{$property->id}", [
            'workflow_stage' => 'tax_appeal',
        ]);

        $response->assertStatus(200);

        // Check that we still only have 1 deadline of this type
        $count = Deadline::where('property_id', $property->id)
            ->where('type', 'tax_appeal')
            ->count();
            
        $this->assertEquals(1, $count);
        
        // And it should be the original one (date didn't change to +30 days)
        $deadline = Deadline::where('property_id', $property->id)->where('type', 'tax_appeal')->first();
        $this->assertEquals(now()->addDays(10)->toDateString(), $deadline->deadline_date->toDateString());
    }
}
