<?php

namespace Tests\Feature;

use App\Models\ActivityLog;
use App\Models\Sparepart;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_to_the_login_page(): void
    {
        $response = $this->get(route('dashboard'));

        $response->assertRedirect(route('login'));
    }

    public function test_authenticated_users_can_visit_the_dashboard(): void
    {
        /** @var User $user */
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->get(route('dashboard'));

        $response->assertOk();
    }

    public function test_recent_activities_remain_visible_after_dashboard_cache_is_warmed(): void
    {
        Cache::flush();

        /** @var User $user */
        $user = User::factory()->create();
        $sparepart = Sparepart::factory()->create([
            'material_number' => 'MAT-DASH-001',
        ]);

        ActivityLog::factory()->create([
            'user_id' => $user->id,
            'sparepart_id' => $sparepart->id,
            'type' => 'OUT',
            'quantity' => 3,
            'performed_at' => now(),
        ]);

        $this
            ->actingAs($user)
            ->get(route('dashboard'))
            ->assertOk()
            ->assertSeeText('MAT-DASH-001');

        $this
            ->actingAs($user)
            ->get(route('dashboard'))
            ->assertOk()
            ->assertSeeText('MAT-DASH-001');
    }
}
