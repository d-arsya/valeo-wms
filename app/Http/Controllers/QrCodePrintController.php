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
    /**
     * Display the QR Code print selection page.
     * Admin Only (handled via route middleware).
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

        $spareparts = $query->paginate(15)->withQueryString();

        return Inertia::render('qr-codes/print', [
            'spareparts' => $spareparts,
            'search' => $search,
        ]);
    }

    /**
     * Generate and download PDF with QR codes for the selected spareparts.
     * Layout: 3 rows x 2 columns (6 QRs per A4 Portrait page).
     */
    public function generate(Request $request)
    {
        $mode = $request->input('mode', 'selected'); // 'selected' or 'all'

        if (! in_array($mode, ['selected', 'all'], true)) {
            throw ValidationException::withMessages([
                'mode' => ['Invalid print mode. Choose "selected" or "all".'],
            ]);
        }

        /** @var \Illuminate\Database\Eloquent\Builder $query */
        $query = Sparepart::query()
            ->with(['brand', 'category', 'bin.rack'])
            ->orderBy('material_number', 'asc');

        if ($mode === 'selected') {
            $ids = $request->input('ids', []);
            if (! is_array($ids) || count($ids) === 0) {
                throw ValidationException::withMessages([
                    'ids' => ['Please select at least 1 sparepart to print.'],
                ]);
            }

            if (count($ids) > 200) {
                throw ValidationException::withMessages([
                    'ids' => ['Maximum 200 spareparts per print (34 pages).'],
                ]);
            }

            $idList = array_map('intval', $ids);
            $query->whereIn('id', $idList);
        } else {
            // Mode 'all'
            $totalCount = (clone $query)->count();
            if ($totalCount === 0) {
                throw ValidationException::withMessages([
                    'mode' => ['No spareparts found in database to print.'],
                ]);
            }
            if ($totalCount > 500) {
                // Safety limit for performance
                throw ValidationException::withMessages([
                    'mode' => ["Too many spareparts ({$totalCount}). Please use 'Selected' mode or apply filters first. Max 500 allowed."],
                ]);
            }
        }

        /** @var \Illuminate\Database\Eloquent\Collection<int, Sparepart> $spareparts */
        $spareparts = $query->get();

        $renderer = new ImageRenderer(
            new RendererStyle(260, 2),
            new SvgImageBackEnd()
        );
        $writer = new Writer($renderer);

        $chunkSize = 6; // 3 rows x 2 cols
        $pages = $spareparts->chunk($chunkSize)->map(function ($chunk) use ($writer) {
            return array_values($chunk->map(function (Sparepart $sparepart) use ($writer) {
                $stockOutUrl = URL::route('stock.out.form', ['sparepart' => $sparepart->id]);
                $svg = $writer->writeString($stockOutUrl);
                $qrDataUri = 'data:image/svg+xml;base64,' . base64_encode($svg);

                $rack = $sparepart->bin?->rack?->code ?? '-';
                $bin = $sparepart->bin?->code ?? '-';
                $location = ($rack !== '-' && $bin !== '-') ? "{$rack} / {$bin}" : '-';

                return [
                    'material_number' => $sparepart->material_number ?? '-',
                    'part_name' => $sparepart->part_name ?? '-',
                    'rank' => $sparepart->rank ?? '-',
                    'brand' => $sparepart->brand?->name ?? '-',
                    'category' => $sparepart->category?->name ?? '-',
                    'location' => $location,
                    'qr_img' => $qrDataUri,
                ];
            })->all());
        })->all();

        $totalCount = $spareparts->count();
        $totalPages = (int) ceil($totalCount / $chunkSize);

        $viewData = [
            'pages' => $pages,
            'printed_at' => now()->format('d/m/Y H:i'),
            'total_spareparts' => $totalCount,
            'total_pages' => $totalPages,
        ];

        $pdf = Pdf::loadView('qr-codes.print-3x2', $viewData)
            ->setPaper('a4', 'portrait')
            ->setOption('margin-top', 8)
            ->setOption('margin-bottom', 8)
            ->setOption('margin-left', 8)
            ->setOption('margin-right', 8)
            ->setOption('isRemoteEnabled', false);

        return $pdf->download('QR_CODE_BATCH_'.now()->format('Ymd_His').'.pdf');
    }

    /**
     * HTML PREVIEW (bukan PDF) - untuk review di browser sebelum cetak.
     * Logic 100% sama dengan generate(), bedanya return view HTML ke browser.
     */
    public function preview(Request $request)
    {
        $mode = $request->input('mode', 'selected');

        if (! in_array($mode, ['selected', 'all'], true)) {
            throw ValidationException::withMessages([
                'mode' => ['Invalid print mode. Choose "selected" or "all".'],
            ]);
        }

        /** @var \Illuminate\Database\Eloquent\Builder $query */
        $query = Sparepart::query()
            ->with(['brand', 'category', 'bin.rack'])
            ->orderBy('material_number', 'asc');

        if ($mode === 'selected') {
            $ids = $request->input('ids', []);
            if (! is_array($ids) || count($ids) === 0) {
                throw ValidationException::withMessages([
                    'ids' => ['Please select at least 1 sparepart to preview.'],
                ]);
            }
            if (count($ids) > 200) {
                throw ValidationException::withMessages([
                    'ids' => ['Maximum 200 spareparts per preview.'],
                ]);
            }
            $idList = array_map('intval', $ids);
            $query->whereIn('id', $idList);
        } else {
            $totalCount = (clone $query)->count();
            if ($totalCount === 0) {
                throw ValidationException::withMessages([
                    'mode' => ['No spareparts found for preview.'],
                ]);
            }
            if ($totalCount > 500) {
                throw ValidationException::withMessages([
                    'mode' => ["Too many spareparts ({$totalCount}). Max 500 for preview."],
                ]);
            }
        }

        /** @var \Illuminate\Database\Eloquent\Collection<int, Sparepart> $spareparts */
        $spareparts = $query->get();

        $renderer = new ImageRenderer(
            new RendererStyle(260, 2),
            new SvgImageBackEnd()
        );
        $writer = new Writer($renderer);

        $chunkSize = 6;
        $pages = $spareparts->chunk($chunkSize)->map(function ($chunk) use ($writer) {
            return array_values($chunk->map(function (Sparepart $sparepart) use ($writer) {
                $stockOutUrl = URL::route('stock.out.form', ['sparepart' => $sparepart->id]);
                $svg = $writer->writeString($stockOutUrl);
                $qrDataUri = 'data:image/svg+xml;base64,' . base64_encode($svg);

                $rack = $sparepart->bin?->rack?->code ?? '-';
                $bin = $sparepart->bin?->code ?? '-';
                $location = ($rack !== '-' && $bin !== '-') ? "{$rack} / {$bin}" : '-';

                return [
                    'material_number' => $sparepart->material_number ?? '-',
                    'part_name' => $sparepart->part_name ?? '-',
                    'rank' => $sparepart->rank ?? '-',
                    'brand' => $sparepart->brand?->name ?? '-',
                    'category' => $sparepart->category?->name ?? '-',
                    'location' => $location,
                    'qr_img' => $qrDataUri,
                ];
            })->all());
        })->all();

        $totalCount = $spareparts->count();
        $totalPages = (int) ceil($totalCount / $chunkSize);

        return response()->view('qr-codes.print-3x2', [
            'pages' => $pages,
            'printed_at' => now()->format('d/m/Y H:i'),
            'total_spareparts' => $totalCount,
            'total_pages' => $totalPages,
        ]);
    }
}
