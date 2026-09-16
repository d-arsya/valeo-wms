<?php

namespace Tests\Feature;

use App\Models\ActivityLog;
use App\Models\Sparepart;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CleanActivityLogsTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_deletes_only_logs_older_than_specified_days(): void
    {
        $user = User::factory()->create();
        $sparepart = Sparepart::factory()->create();

        // Log lama (100 hari lalu)
        ActivityLog::factory()->create([
            'user_id' => $user->id,
            'sparepart_id' => $sparepart->id,
            'performed_at' => now()->subDays(100),
        ]);

        // Log baru (10 hari lalu)
        ActivityLog::factory()->create([
            'user_id' => $user->id,
            'sparepart_id' => $sparepart->id,
            'performed_at' => now()->subDays(10),
        ]);

        $this->assertEquals(2, ActivityLog::count());

        // Bersihkan log > 30 hari dengan --force
        $this->artisan('activity-log:clean --days=30 --force')
            ->assertSuccessful();

        $this->assertEquals(1, ActivityLog::count());
        $this->assertDatabaseMissing('activity_logs', [
            'performed_at' => now()->subDays(100)->toDateTimeString(),
        ]);
    }

    public function test_dry_run_does_not_delete_any_records(): void
    {
        $user = User::factory()->create();
        $sparepart = Sparepart::factory()->create();

        ActivityLog::factory()->create([
            'user_id' => $user->id,
            'sparepart_id' => $sparepart->id,
            'performed_at' => now()->subDays(120),
        ]);

        $this->artisan('activity-log:clean --days=90 --dry-run')
            ->expectsOutputToContain('[DRY-RUN]')
            ->assertSuccessful();

        $this->assertEquals(1, ActivityLog::count());
    }

    public function test_it_deletes_all_records_with_all_flag(): void
    {
        $user = User::factory()->create();
        $sparepart = Sparepart::factory()->create();

        ActivityLog::factory()->count(3)->create([
            'user_id' => $user->id,
            'sparepart_id' => $sparepart->id,
            'performed_at' => now(),
        ]);

        $this->artisan('activity-log:clean --all --force')
            ->assertSuccessful();

        $this->assertEquals(0, ActivityLog::count());
    }

    public function test_it_deletes_records_in_chunks(): void
    {
        $user = User::factory()->create();
        $sparepart = Sparepart::factory()->create();

        ActivityLog::factory()->count(25)->create([
            'user_id' => $user->id,
            'sparepart_id' => $sparepart->id,
            'performed_at' => now()->subDays(60),
        ]);

        $this->assertEquals(25, ActivityLog::count());

        // Hapus dengan batch chunk 10
        $this->artisan('activity-log:clean --days=30 --chunk=10 --force')
            ->assertSuccessful();

        $this->assertEquals(0, ActivityLog::count());
    }
}
