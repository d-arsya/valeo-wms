<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('spareparts', function (Blueprint $table) {
            $table->id();
            $table->string('material_number')->unique()->index();
            $table->string('part_name');
            $table->text('specification');
            $table->foreignId('brand_id')->constrained('brands');
            $table->foreignId('category_id')->constrained('categories');
            $table->foreignId('bin_id')->constrained('bins');
            $table->integer('safety_stock');
            $table->integer('actual_stock')->default(0);
            $table->string('last_po_number')->nullable();
            $table->string('last_supplier')->nullable();
            $table->date('last_gr_date')->nullable();
            $table->decimal('price_per_unit', 15, 2)->nullable();
            $table->enum('status', ['OK', 'ATTENTION', 'NG'])->default('OK');
            $table->char('rank',1);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('spareparts');
    }
};
