<?php

namespace App\Console\Commands;

use App\Models\ActivityLog;
use Illuminate\Console\Command;
use Illuminate\Console\ConfirmableTrait;

class CleanActivityLogs extends Command
{
    use ConfirmableTrait;

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'activity-log:clean
                            {--days=90 : Hapus log yang lebih lama dari sekian hari}
                            {--all : Hapus SELURUH riwayat log tanpa batasan tanggal}
                            {--dry-run : Tampilkan jumlah data yang akan dihapus tanpa benar-benar menghapusnya}
                            {--chunk=1000 : Ukuran batch pembersihan untuk mencegah table lock}
                            {--force : Abaikan konfirmasi interaktif (wajib untuk production/cronjob)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Hapus riwayat activity logs di database dengan pengaman production';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $isAll = (bool) $this->option('all');
        $days = (int) $this->option('days');
        $isDryRun = (bool) $this->option('dry-run');
        $chunkSize = max(100, (int) $this->option('chunk'));

        // Siapkan query target
        $query = ActivityLog::query();

        if (! $isAll) {
            if ($days <= 0) {
                $this->error('Nilai --days harus lebih besar dari 0.');

                return Command::INVALID;
            }
            $cutoffDate = now()->subDays($days);
            $query->where('performed_at', '<', $cutoffDate);
            $scopeDescription = "lebih lama dari {$days} hari (sebelum {$cutoffDate->toDateTimeString()})";
        } else {
            $scopeDescription = 'SEMUA data activity logs';
        }

        $totalCount = (clone $query)->count();

        if ($totalCount === 0) {
            $this->info("Tidak ada data activity log yang cocok ({$scopeDescription}).");

            return Command::SUCCESS;
        }

        // Mode Dry-Run: Hanya simulasi
        if ($isDryRun) {
            $this->warn("[DRY-RUN] Ditemukan {$totalCount} data activity log ({$scopeDescription}) yang siap dihapus.");
            $this->line('Tidak ada data yang dihapus karena opsi --dry-run aktif.');

            return Command::SUCCESS;
        }

        // Pengaman Konfirmasi untuk Production & Mode Berbahaya
        $warningMessage = $isAll
            ? "PERINGATAN: Anda akan menghapus {$totalCount} baris ({$scopeDescription})!"
            : "Anda akan menghapus {$totalCount} baris activity log ({$scopeDescription}).";

        if (! $this->confirmToProceed($warningMessage, fn () => ! $this->option('force'))) {
            return Command::FAILURE;
        }

        // Tambahan konfirmasi teks ganda khusus untuk flag --all jika dijalankan interaktif
        if ($isAll && ! $this->option('force')) {
            $typed = $this->ask('Ketik "DELETE ALL" untuk konfirmasi penghapusan seluruh data:');
            if ($typed !== 'DELETE ALL') {
                $this->error('Konfirmasi tidak sesuai. Operasi dibatalkan demi keamanan.');

                return Command::FAILURE;
            }
        }

        $this->info("Memulai proses penghapusan {$totalCount} data secara bertahap (chunk: {$chunkSize})...");

        $bar = $this->output->createProgressBar($totalCount);
        $bar->start();

        $deletedTotal = 0;

        do {
            // Ambil ID secara bertahap agar database-agnostic dan tidak mengunci tabel
            $ids = (clone $query)->select('id')->limit($chunkSize)->pluck('id');

            if ($ids->isEmpty()) {
                break;
            }

            $count = ActivityLog::whereIn('id', $ids)->delete();
            $deletedTotal += $count;
            $bar->advance($count);
        } while ($ids->count() === $chunkSize);

        $bar->finish();
        $this->newLine(2);

        $this->info("Selesai! Berhasil menghapus {$deletedTotal} baris activity log.");

        return Command::SUCCESS;
    }
}
