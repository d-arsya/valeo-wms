<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSparepartRequest;
use App\Http\Requests\UpdateSparepartRequest;
use App\Models\Bin;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Sparepart;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SparepartController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $spareparts = Sparepart::query()
            ->with(['brand', 'category', 'bin.rack'])
            ->when($request->search, function ($query, $search) {
                $query->where(function ($query) use ($search) {
                    $query->where('material_number', 'like', "%{$search}%")
                        ->orWhere('part_name', 'like', "%{$search}%");
                });
            })
            ->when($request->brand_id, fn($query, $brandId) => $query->where('brand_id', $brandId))
            ->when($request->category_id, fn($query, $categoryId) => $query->where('category_id', $categoryId))
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('spareparts/index', [
            'spareparts' => $spareparts,
            'filters' => $request->only(['search', 'brand_id', 'category_id']),
            'brands' => Brand::all(['id', 'name']),
            'categories' => Category::all(['id', 'name']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('spareparts/create', [
            'brands' => Brand::all(['id', 'name']),
            'categories' => Category::all(['id', 'name']),
            'bins' => Bin::with('rack')->orderBy('code')->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreSparepartRequest $request)
    {
        Sparepart::create($request->validated());

        return redirect()->route('spareparts.index')
            ->with('success', 'Sparepart created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Sparepart $sparepart)
    {
        return Inertia::render('spareparts/show', [
            'sparepart' => $sparepart->load([
                'brand',
                'category',
                'bin.rack',
                'activityLogs' => fn ($query) => $query->with('user')->latest('performed_at'),
            ]),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Sparepart $sparepart)
    {
        return Inertia::render('spareparts/edit', [
            'sparepart' => $sparepart->load(['brand', 'category', 'bin.rack']),
            'brands' => Brand::all(['id', 'name']),
            'categories' => Category::all(['id', 'name']),
            'bins' => Bin::with('rack')->orderBy('code')->get(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateSparepartRequest $request, Sparepart $sparepart)
    {
        $sparepart->update($request->validated());

        return redirect()->route('spareparts.show', $sparepart)
            ->with('success', 'Sparepart updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Sparepart $sparepart)
    {
        $sparepart->delete();

        return redirect()->route('spareparts.index')
            ->with('success', 'Sparepart deleted successfully.');
    }
}
