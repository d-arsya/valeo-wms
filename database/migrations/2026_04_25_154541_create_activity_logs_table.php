<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sparepart_id')->constrained('spareparts')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users');
            $table->string('control_id')->unique();
            $table->enum('type', ['IN', 'OUT']);
            $table->integer('quantity');
            $table->text('remarks')->nullable();
            $table->string('po_number')->nullable();
            $table->date('gr_date')->nullable();
            $table->decimal('price_per_unit', 15, 2)->nullable();
            $table->timestamp('performed_at')->useCurrent();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};
