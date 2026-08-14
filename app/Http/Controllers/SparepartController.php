<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSparepartRequest;
use App\Http\Requests\UpdateSparepartRequest;
use App\Models\Bin;
use App\Models\Sparepart;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SparepartController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Sparepart::query()->with(['brand', 'category', 'bin.rack']);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('material_number', 'like', "%{$search}%")
                    ->orWhere('part_name', 'like', "%{$search}%");
            });
        }

        if ($request->filled('brand_id')) {
            $query->where('brand_id', $request->input('brand_id'));
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->input('category_id'));
        }

        if ($request->filled('rank')) {
            $query->where('rank', $request->input('rank'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $spareparts = $query->latest()->paginate(10)->withQueryString();

        return inertia('spareparts/index', [
            'spareparts' => $spareparts,
            'filters' => $request->only(['search', 'brand_id', 'category_id', 'rank', 'status']),
            'brands' => $this->brandOptions(),
            'categories' => $this->categoryOptions(),
            'ranks' => ['A', 'B', 'C'],
            'statuses' => ['OK', 'ATTENTION', 'NG'],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('spareparts/create', [
            'brands' => $this->brandOptions(),
            'categories' => $this->categoryOptions(),
            'bins' => Bin::with('rack')->orderBy('code')->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreSparepartRequest $request)
    {
        Sparepart::create($request->validated());
        Cache::forget('dashboard.stats');

        return redirect()->route('spareparts.index')
            ->with('success', 'Sparepart created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Sparepart $sparepart)
    {
        // Generate QR Code SVG
        $renderer = new ImageRenderer(
            new RendererStyle(300),
            new SvgImageBackEnd()
        );
        $writer = new Writer($renderer);
        $qrCodeSvg = $writer->writeString($sparepart->material_number);

        return Inertia::render('spareparts/show', [
            'sparepart' => $sparepart->load([
                'brand',
                'category',
                'bin.rack',
                'activityLogs' => fn ($query) => $query->with('user')->latest('performed_at'),
            ]),
            'qrCodeSvg' => $qrCodeSvg,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Sparepart $sparepart)
    {
        return Inertia::render('spareparts/edit', [
            'sparepart' => $sparepart->load(['brand', 'category', 'bin.rack']),
            'brands' => $this->brandOptions(),
            'categories' => $this->categoryOptions(),
            'bins' => Bin::with('rack')->orderBy('code')->get(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateSparepartRequest $request, Sparepart $sparepart)
    {
        /** @var \Illuminate\Database\Eloquent\Model $sparepart */
        $sparepart->update($request->validated());
        Cache::forget('dashboard.stats');

        return redirect()->route('spareparts.show', ['sparepart' => $sparepart->material_number])
            ->with('success', 'Sparepart updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Sparepart $sparepart)
    {
        /** @var \Illuminate\Database\Eloquent\Model $sparepart */
        $sparepart->delete();
        Cache::forget('dashboard.stats');

        return redirect()->route('spareparts.index')
            ->with('success', 'Sparepart deleted successfully.');
    }

    private function brandOptions()
    {
        return Cache::remember('select.brands', now()->addMinutes(10), function () {
            return DB::table('brands')
                ->orderBy('name')
                ->get(['id', 'name'])
                ->map(fn ($brand) => [
                    'id' => (int) $brand->id,
                    'name' => $brand->name,
                ])
                ->all();
        });
    }

    private function categoryOptions()
    {
        return Cache::remember('select.categories', now()->addMinutes(10), function () {
            return DB::table('categories')
                ->orderBy('name')
                ->get(['id', 'name'])
                ->map(fn ($category) => [
                    'id' => (int) $category->id,
                    'name' => $category->name,
                ])
                ->all();
        });
    }
}
