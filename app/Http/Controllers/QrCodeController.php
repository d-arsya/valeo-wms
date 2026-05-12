<?php

namespace App\Http\Controllers;

use App\Models\Sparepart;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;
use Inertia\Inertia;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class QrCodeController extends Controller
{
    /**
     * Display the printable label.
     */
    public function show(Sparepart $sparepart)
    {
        $renderer = new ImageRenderer(
            new RendererStyle(200),
            new SvgImageBackEnd()
        );
        $writer = new Writer($renderer);
        
        // Always generate a fresh SVG for preview
        $qrCodeSvg = $writer->writeString($sparepart->material_number);

        return Inertia::render('labels/Show', [
            'sparepart' => $sparepart->load(['brand', 'category', 'bin.rack']),
            'qrCodeSvg' => $qrCodeSvg,
        ]);
    }

    /**
     * Generate and save the QR code file.
     */
    public function generate(Sparepart $sparepart)
    {
        $renderer = new ImageRenderer(
            new RendererStyle(400),
            new SvgImageBackEnd()
        );
        $writer = new Writer($renderer);
        
        $qrCodeContent = $writer->writeString($sparepart->material_number);
        
        $fileName = 'qr-' . $sparepart->material_number . '-' . Str::random(5) . '.svg';
        $filePath = 'qrcodes/' . $fileName;
        
        // Save to public storage
        Storage::disk('public')->put($filePath, $qrCodeContent);
        
        // Delete old QR if exists
        if ($sparepart->qr_code_path) {
            Storage::disk('public')->delete($sparepart->qr_code_path);
        }
        
        // Update database
        $sparepart->update([
            'qr_code_path' => $filePath
        ]);

        return back()->with('success', 'QR Code berhasil di-generate!');
    }
}
