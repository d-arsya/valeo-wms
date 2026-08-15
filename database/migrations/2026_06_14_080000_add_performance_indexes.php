<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('spareparts', function (Blueprint $table) {
            $table->index(['status', 'actual_stock'], 'spareparts_status_actual_stock_idx');
            $table->index('created_at', 'spareparts_created_at_idx');
        });

        Schema::table('activity_logs', function (Blueprint $table) {
            $table->index('performed_at', 'activity_logs_performed_at_idx');
            $table->index(['type', 'performed_at'], 'activity_logs_type_performed_at_idx');
        });
    }

    public function down(): void
    {
        Schema::table('spareparts', function (Blueprint $table) {
            $table->dropIndex('spareparts_status_actual_stock_idx');
            $table->dropIndex('spareparts_created_at_idx');
        });

        Schema::table('activity_logs', function (Blueprint $table) {
            $table->dropIndex('activity_logs_performed_at_idx');
            $table->dropIndex('activity_logs_type_performed_at_idx');
        });
    }
};
