<?php

namespace App\Http\Controllers;

use App\Models\Sparepart;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;
use Inertia\Inertia;

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
}
