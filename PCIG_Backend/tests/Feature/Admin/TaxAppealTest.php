<?php

namespace Tests\Feature\Admin;

use App\Models\Property;
use App\Models\TaxAppeal;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaxAppealTest extends TestCase
{
    use RefreshDatabase;

    protected $admin;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create role
        $role = Role::create(['name' => 'admin', 'guard_name' => 'web']);

        // Create an admin user
        $this->admin = User::factory()->create([
            'role_type' => 'admin',
        ]);
        
        $this->admin->assignRole($role);
    }

    /** @test */
    public function admin_can_create_tax_appeal()
    {
        $property = Property::factory()->create();

        $response = $this->actingAs($this->admin)->postJson('/api/admin/tax-appeals', [
            'property_id' => $property->id,
            'filed_date' => '2025-01-01',
            'current_assessment' => 100000,
            'proposed_assessment' => 80000,
            'notes' => 'Test Appeal',
        ]);

        $response->assertStatus(201)
            ->assertJson(['success' => true]);

        $this->assertDatabaseHas('tax_appeals', [
            'property_id' => $property->id,
            'current_assessment' => 100000,
            'status' => 'filed',
        ]);
    }

    /** @test */
    public function admin_can_view_tax_appeal_dashboard()
    {
        $property = Property::factory()->create();
        TaxAppeal::create([
            'property_id' => $property->id,
            'filed_date' => '2025-01-01',
            'current_assessment' => 100000,
            'proposed_assessment' => 80000,
            'status' => 'filed',
        ]);

        $response = $this->actingAs($this->admin)->getJson('/api/admin/tax-appeals/dashboard-data');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'propertyTaxAppeal' => [
                    'propertiesTable' => [
                        'rows'
                    ]
                ]
            ]);
    }

    /** @test */
    public function admin_can_update_tax_appeal()
    {
        $property = Property::factory()->create();
        $appeal = TaxAppeal::create([
            'property_id' => $property->id,
            'filed_date' => '2025-01-01',
            'current_assessment' => 100000,
            'proposed_assessment' => 80000,
            'status' => 'filed',
        ]);

        $response = $this->actingAs($this->admin)->putJson("/api/admin/tax-appeals/{$appeal->id}", [
            'status' => 'hearing_scheduled',
            'hearing_date' => '2025-02-01',
            'notes' => 'Hearing set',
        ]);

        $response->assertStatus(200)
            ->assertJson(['success' => true]);

        $this->assertDatabaseHas('tax_appeals', [
            'id' => $appeal->id,
            'status' => 'hearing_scheduled',
            'notes' => 'Hearing set',
        ]);
    }

    /** @test */
    public function admin_can_view_single_tax_appeal()
    {
        $property = Property::factory()->create();
        $appeal = TaxAppeal::create([
            'property_id' => $property->id,
            'filed_date' => '2025-01-01',
            'current_assessment' => 100000,
            'proposed_assessment' => 80000,
            'status' => 'filed',
        ]);

        $response = $this->actingAs($this->admin)->getJson("/api/admin/tax-appeals/{$appeal->id}");

        $response->assertStatus(200)
            ->assertJson(['success' => true])
            ->assertJsonPath('data.current_assessment', '100000.00'); // Casts might return string
    }
}
