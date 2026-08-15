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
        $request->merge([
            'code' => trim(strip_tags((string) $request->input('code'))),
            'bins' => collect($request->input('bins', []))
                ->map(function ($bin) {
                    if (isset($bin['code'])) {
                        $bin['code'] = trim(strip_tags((string) $bin['code']));
                    }

                    return $bin;
                })
                ->all(),
        ]);

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
                        $fail('The bin code must be unique across the system and within this request.');
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
     * Display the specified resource.
     */
    public function show(Rack $rack)
    {
        return Inertia::render('racks/show', [
            'rack' => $rack->load(['bins' => function ($query) {
                $query->withCount('spareparts')->with('spareparts.brand', 'spareparts.category');
            }]),
        ]);
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
        $request->merge([
            'code' => trim(strip_tags((string) $request->input('code'))),
            'bins' => collect($request->input('bins', []))
                ->map(function ($bin) {
                    if (isset($bin['code'])) {
                        $bin['code'] = trim(strip_tags((string) $bin['code']));
                    }

                    return $bin;
                })
                ->all(),
        ]);

        $validated = $request->validate([
            'code' => ['required', 'string', 'max:255', Rule::unique('racks')->ignore($rack->id)],
            'bins' => ['nullable', 'array'],
            'bins.*.id' => ['nullable', 'integer'],
            'bins.*.code' => [
                'required',
                'string',
                'max:255',
                function ($attribute, $value, $fail) use ($request) {
                    $codes = collect($request->input('bins'))->pluck('code');
                    if ($codes->countBy()->get($value) > 1) {
                        $fail('The bin code must be unique across the system and within this request.');
                    }

                    preg_match('/bins\.(\d+)\.code/', $attribute, $matches);
                    $index = $matches[1] ?? null;
                    $binId = $request->input("bins.{$index}.id");

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

                $binsToDelete = $rack->bins()->whereNotIn('id', $incomingBinIds)->get();
                foreach ($binsToDelete as $bin) {
                    if ($bin->spareparts()->exists()) {
                        throw new \Exception("Cannot delete Bin '{$bin->code}' as it is currently associated with spareparts.");
                    }
                }

                $rack->bins()->whereNotIn('id', $incomingBinIds)->delete();

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
