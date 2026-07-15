<?php

namespace App\Http\Controllers;

use App\Models\Brand;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class BrandController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $brands = Brand::query()
            ->searchByName($request->search)
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('brands/index', [
            'brands' => $brands,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('brands/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->merge([
            'name' => trim(strip_tags((string) $request->input('name'))),
        ]);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:brands,name'],
        ]);

        $brand = Brand::create($validated);
        Cache::forget('select.brands');

        if ($request->wantsJson()) {
            return response()->json($brand, 201);
        }

        return redirect()->route('brands.index')
            ->with('success', 'Brand created successfully.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Brand $brand)
    {
        return Inertia::render('brands/edit', [
            'brand' => $brand,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Brand $brand)
    {
        $request->merge([
            'name' => trim(strip_tags((string) $request->input('name'))),
        ]);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('brands')->ignore($brand->id)],
        ]);

        /** @var \Illuminate\Database\Eloquent\Model $brand */
        $brand->update($validated);
        Cache::forget('select.brands');

        if ($request->wantsJson()) {
            return response()->json($brand);
        }

        return redirect()->route('brands.index')
            ->with('success', 'Brand updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Brand $brand)
    {
        if ($brand->spareparts()->exists()) {
            return redirect()->route('brands.index')
                ->with('error', 'Cannot delete Brand. It is currently associated with one or more spareparts.');
        }

        /** @var \Illuminate\Database\Eloquent\Model $brand */
        $brand->delete();
        Cache::forget('select.brands');

        return redirect()->route('brands.index')
            ->with('success', 'Brand deleted successfully.');
    }
}
