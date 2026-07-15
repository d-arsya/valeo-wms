<?php

namespace Tests\Feature\Labels;

use App\Models\Sparepart;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class QrLabelTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_open_label_page_with_svg_qr_code(): void
    {
        $user = User::factory()->technician()->create();
        $sparepart = Sparepart::factory()->create();

        $response = $this
            ->actingAs($user)
            ->get(route('spareparts.label', $sparepart));

        $response
            ->assertOk()
            ->assertSeeText($sparepart->material_number)
            ->assertSee('<svg', false);
    }
}
