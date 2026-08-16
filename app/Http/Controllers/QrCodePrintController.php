<?php

namespace App\Http\Controllers;

use App\Models\Sparepart;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class QrCodePrintController extends Controller
{
    /** Batas maksimum item per cetak — aman di shared hosting cPanel */
    private const MAX_SELECTED = 60;

    /** 7 baris × 2 kolom = 14 label per halaman A4 */
    private const CHUNK_SIZE = 14;

    /** Ukuran QR SVG — 150px cukup jelas untuk label, hemat memori */
    private const QR_SIZE = 150;

    /**
     * Halaman pilih sparepart untuk dicetak.
     * Pagination 14 per halaman — sesuai jumlah label per halaman PDF.
     */
    public function index(Request $request)
    {
        $search = trim((string) $request->input('search', ''));

        $query = Sparepart::query()
            ->with(['brand', 'category', 'bin.rack'])
            ->latest();

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('material_number', 'like', "%{$search}%")
                    ->orWhere('part_name', 'like', "%{$search}%");
            });
        }

        $spareparts = $query->paginate(self::CHUNK_SIZE)->withQueryString();

        return Inertia::render('qr-codes/print', [
            'spareparts' => $spareparts,
            'search'     => $search,
        ]);
    }

    /**
     * Generate dan stream PDF ke browser sebagai download.
     * Mode: hanya 'selected' — user pilih manual.
     */
    public function generate(Request $request)
    {
        @ini_set('memory_limit', '256M');
        @set_time_limit(120);

        [$pages, $totalCount, $filename] = $this->buildPdfData($request);

        $viewData = [
            'pages'            => $pages,
            'printed_at'       => now()->format('d/m/Y H:i'),
            'total_spareparts' => $totalCount,
            'total_pages'      => (int) ceil($totalCount / self::CHUNK_SIZE),
        ];

        return response()->streamDownload(function () use ($viewData) {
            $pdf = Pdf::loadView('qr-codes.print-3x2', $viewData)
                ->setPaper('a4', 'portrait')
                ->setOptions([
                    'isRemoteEnabled' => false,
                    'dpi'             => 72,
                ]);

            echo $pdf->output();
            unset($pdf);
        }, $filename, ['Content-Type' => 'application/pdf']);
    }

    /**
     * Preview HTML di browser (bukan PDF) — untuk review sebelum download.
     */
    public function preview(Request $request)
    {
        @ini_set('memory_limit', '128M');
        @set_time_limit(60);

        [$pages, $totalCount] = $this->buildPdfData($request);

        return response()->view('qr-codes.print-3x2', [
            'pages'            => $pages,
            'printed_at'       => now()->format('d/m/Y H:i'),
            'total_spareparts' => $totalCount,
            'total_pages'      => (int) ceil($totalCount / self::CHUNK_SIZE),
        ]);
    }

    // -------------------------------------------------------------------------

    /**
     * Validasi request, query DB, build data pages + QR SVG.
     * Hanya mendukung mode 'selected'.
     *
     * @return array{0: array, 1: int, 2: string}  [$pages, $totalCount, $filename]
     */
    private function buildPdfData(Request $request): array
    {
        $ids = $request->input('ids', []);

        if (! is_array($ids) || count($ids) === 0) {
            throw ValidationException::withMessages([
                'ids' => ['Pilih minimal 1 sparepart.'],
            ]);
        }

        if (count($ids) > self::MAX_SELECTED) {
            throw ValidationException::withMessages([
                'ids' => [
                    'Maksimal ' . self::MAX_SELECTED . ' sparepart per cetak ('
                    . (int) ceil(self::MAX_SELECTED / self::CHUNK_SIZE)
                    . ' halaman). Pilih lebih sedikit atau cetak bertahap.',
                ],
            ]);
        }

        $spareparts = Sparepart::query()
            ->with(['brand', 'category', 'bin.rack'])
            ->whereIn('id', array_map('intval', $ids))
            ->orderBy('material_number', 'asc')
            ->get();

        $totalCount = $spareparts->count();
        $writer     = $this->makeQrWriter();
        $pages      = [];

        foreach ($spareparts->chunk(self::CHUNK_SIZE) as $chunk) {
            $pageCards = [];

            foreach ($chunk as $sparepart) {
                $stockOutUrl = URL::route('stock.out.form', ['sparepart' => $sparepart->id]);
                $svg         = $writer->writeString($stockOutUrl);
                $qrDataUri   = 'data:image/svg+xml;base64,' . base64_encode($svg);
                unset($svg);

                $rack     = $sparepart->bin?->rack?->code ?? '-';
                $bin      = $sparepart->bin?->code ?? '-';
                $location = ($rack !== '-' && $bin !== '-') ? "{$rack} / {$bin}" : '-';

                $pageCards[] = [
                    'material_number' => $sparepart->material_number ?? '-',
                    'part_name'       => $sparepart->part_name ?? '-',
                    'brand'           => $sparepart->brand?->name ?? '-',
                    'category'        => $sparepart->category?->name ?? '-',
                    'location'        => $location,
                    'qr_img'          => $qrDataUri,
                ];

                unset($qrDataUri);
            }

            $pages[] = $pageCards;
            unset($pageCards, $chunk);
        }

        unset($spareparts, $writer);
        gc_collect_cycles();

        $filename = 'QR_CODE_BATCH_' . now()->format('Ymd_His') . '.pdf';

        return [$pages, $totalCount, $filename];
    }

    private function makeQrWriter(): Writer
    {
        return new Writer(
            new ImageRenderer(
                new RendererStyle(self::QR_SIZE, 1),
                new SvgImageBackEnd()
            )
        );
    }
}
