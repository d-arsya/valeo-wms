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
     * Handle the incoming request to show a printable label.
     */
    public function __invoke(Sparepart $sparepart)
    {
        $renderer = new ImageRenderer(
            new RendererStyle(200),
            new SvgImageBackEnd()
        );
        $writer = new Writer($renderer);
        
        // Encode the Material Number in the QR code
        $qrCodeSvg = $writer->writeString($sparepart->material_number);

        return Inertia::render('spareparts/label', [
            'sparepart' => $sparepart->load(['brand', 'category', 'bin.rack']),
            'qrCodeSvg' => $qrCodeSvg,
        ]);
    }
}
