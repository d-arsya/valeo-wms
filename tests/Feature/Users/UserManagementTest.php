<?php

namespace Tests\Feature\Users;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_access_user_management(): void
    {
        $response = $this->get(route('users.index'));
        $response->assertRedirect(route('login'));
    }

    public function test_technician_cannot_access_user_management(): void
    {
        $technician = User::factory()->create(['role' => UserRole::TECHNICIAN]);

        $response = $this->actingAs($technician)->get(route('users.index'));
        $response->assertForbidden();
    }

    public function test_admin_can_update_own_name_and_email(): void
    {
        $admin = User::factory()->create([
            'role' => UserRole::ADMIN,
            'name' => 'Original Admin',
            'email' => 'admin@original.com',
        ]);

        $response = $this->actingAs($admin)->put(route('users.update', $admin), [
            'name' => 'Updated Admin',
            'email' => 'admin@updated.com',
            'role' => 'admin',
            'password' => '',
            'password_confirmation' => '',
        ]);

        $response->assertRedirect(route('users.index'));
        $response->assertSessionHas('success');

        $admin->refresh();
        $this->assertSame('Updated Admin', $admin->name);
        $this->assertSame('admin@updated.com', $admin->email);
        $this->assertNotNull($admin->email_verified_at);
    }

    public function test_admin_can_update_own_password_with_confirmation(): void
    {
        $admin = User::factory()->create([
            'role' => UserRole::ADMIN,
            'password' => 'old-password',
        ]);

        $response = $this->actingAs($admin)->put(route('users.update', $admin), [
            'name' => $admin->name,
            'email' => $admin->email,
            'role' => 'admin',
            'password' => 'new-secret-password',
            'password_confirmation' => 'new-secret-password',
        ]);

        $response->assertRedirect(route('users.index'));
        $response->assertSessionHas('success');

        $admin->refresh();
        $this->assertTrue(Hash::check('new-secret-password', $admin->password));
    }

    public function test_admin_cannot_demote_own_role(): void
    {
        $admin = User::factory()->create(['role' => UserRole::ADMIN]);

        $response = $this->actingAs($admin)->put(route('users.update', $admin), [
            'name' => 'Admin Name',
            'email' => $admin->email,
            'role' => 'technician',
            'password' => '',
            'password_confirmation' => '',
        ]);

        $response->assertRedirect(route('users.index'));
        $response->assertSessionHas('error');

        $admin->refresh();
        $this->assertSame(UserRole::ADMIN, $admin->role);
    }

    public function test_admin_can_update_other_user(): void
    {
        $admin = User::factory()->create(['role' => UserRole::ADMIN]);
        $targetUser = User::factory()->create([
            'role' => UserRole::TECHNICIAN,
            'name' => 'Old Tech',
            'email' => 'tech@old.com',
            'password' => 'old-tech-password',
        ]);

        $response = $this->actingAs($admin)->put(route('users.update', $targetUser), [
            'name' => 'Promoted Tech',
            'email' => 'tech@promoted.com',
            'role' => 'admin',
            'password' => 'new-tech-password',
            'password_confirmation' => 'new-tech-password',
        ]);

        $response->assertRedirect(route('users.index'));
        $response->assertSessionHas('success');

        $targetUser->refresh();
        $this->assertSame('Promoted Tech', $targetUser->name);
        $this->assertSame('tech@promoted.com', $targetUser->email);
        $this->assertSame(UserRole::ADMIN, $targetUser->role);
        $this->assertTrue(Hash::check('new-tech-password', $targetUser->password));
    }

    public function test_updating_user_without_password_preserves_existing_password(): void
    {
        $admin = User::factory()->create(['role' => UserRole::ADMIN]);
        $targetUser = User::factory()->create([
            'password' => 'keep-this-password',
        ]);

        $response = $this->actingAs($admin)->put(route('users.update', $targetUser), [
            'name' => 'Updated Name Only',
            'email' => $targetUser->email,
            'role' => 'technician',
            'password' => '',
            'password_confirmation' => '',
        ]);

        $response->assertRedirect(route('users.index'));
        $targetUser->refresh();
        $this->assertTrue(Hash::check('keep-this-password', $targetUser->password));
    }

    public function test_admin_can_create_new_user(): void
    {
        $admin = User::factory()->create(['role' => UserRole::ADMIN]);

        $response = $this->actingAs($admin)->post(route('users.store'), [
            'name' => 'New Guy',
            'email' => 'newguy@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'technician',
        ]);

        $response->assertRedirect(route('users.index'));
        $response->assertSessionHas('success');

        $created = User::where('email', 'newguy@example.com')->first();
        $this->assertNotNull($created);
        $this->assertSame('New Guy', $created->name);
        $this->assertSame(UserRole::TECHNICIAN, $created->role);
        $this->assertTrue(Hash::check('password123', $created->password));
        $this->assertNotNull($created->email_verified_at);
    }
}
