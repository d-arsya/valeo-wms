<?php

namespace App\Http\Controllers;

use App\Models\Bin;
use App\Models\Rack;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class RackController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $racks = Rack::query()
            ->withCount('bins')
            ->when($request->search, function ($query, $search) {
                $query->where('code', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('racks/index', [
            'racks' => $racks,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('racks/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:255', 'unique:racks,code'],
            'bins' => ['nullable', 'array'],
            'bins.*.code' => [
                'required',
                'string',
                'max:255',
                'unique:bins,code',
                function ($attribute, $value, $fail) use ($request) {
                    $codes = collect($request->input('bins'))->pluck('code');
                    if ($codes->countBy()->get($value) > 1) {
                        $fail('The bin code must be unique in this rack.');
                    }
                },
            ],
        ]);

        DB::transaction(function () use ($validated) {
            $rack = Rack::create(['code' => $validated['code']]);
            if (! empty($validated['bins'])) {
                foreach ($validated['bins'] as $binData) {
                    $rack->bins()->create(['code' => $binData['code']]);
                }
            }
        });

        return redirect()->route('racks.index')
            ->with('success', 'Rack and bins created successfully.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Rack $rack)
    {
        return Inertia::render('racks/edit', [
            'rack' => $rack->load('bins'),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Rack $rack)
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:255', Rule::unique('racks')->ignore($rack->id)],
            'bins' => ['nullable', 'array'],
            'bins.*.id' => ['nullable', 'integer'],
            'bins.*.code' => [
                'required',
                'string',
                'max:255',
                function ($attribute, $value, $fail) use ($request) {
                    // Check duplicate in the request payload
                    $codes = collect($request->input('bins'))->pluck('code');
                    if ($codes->countBy()->get($value) > 1) {
                        $fail('The bin code must be unique.');
                    }

                    // Extract index to check if there is an ID
                    preg_match('/bins\.(\d+)\.code/', $attribute, $matches);
                    $index = $matches[1] ?? null;
                    $binId = $request->input("bins.{$index}.id");

                    // Check uniqueness in database
                    $query = Bin::where('code', $value);
                    if ($binId) {
                        $query->where('id', '!=', $binId);
                    }
                    if ($query->exists()) {
                        $fail('The bin code has already been taken.');
                    }
                },
            ],
        ]);

        try {
            DB::transaction(function () use ($validated, $rack) {
                $rack->update(['code' => $validated['code']]);

                $incomingBinIds = collect($validated['bins'] ?? [])->pluck('id')->filter()->toArray();

                // Before deleting bins, check if any of them are associated with spareparts
                $binsToDelete = $rack->bins()->whereNotIn('id', $incomingBinIds)->get();
                foreach ($binsToDelete as $bin) {
                    if ($bin->spareparts()->exists()) {
                        throw new \Exception("Cannot delete Bin '{$bin->code}' as it is currently associated with spareparts.");
                    }
                }

                // Delete bins not present in incoming list
                $rack->bins()->whereNotIn('id', $incomingBinIds)->delete();

                // Update or create bins
                foreach ($validated['bins'] ?? [] as $binData) {
                    if (! empty($binData['id'])) {
                        $rack->bins()->where('id', $binData['id'])->update(['code' => $binData['code']]);
                    } else {
                        $rack->bins()->create(['code' => $binData['code']]);
                    }
                }
            });
        } catch (\Exception $e) {
            return redirect()->back()
                ->withInput()
                ->withErrors(['bins' => $e->getMessage()]);
        }

        return redirect()->route('racks.index')
            ->with('success', 'Rack updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Rack $rack)
    {
        $hasSpareparts = $rack->bins()->whereHas('spareparts')->exists();

        if ($hasSpareparts) {
            return redirect()->route('racks.index')
                ->with('error', 'Cannot delete Rack. One or more of its bins are currently associated with spareparts.');
        }

        DB::transaction(function () use ($rack) {
            $rack->bins()->delete();
            $rack->delete();
        });

        return redirect()->route('racks.index')
            ->with('success', 'Rack and its bins deleted successfully.');
    }
}
