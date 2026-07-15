<?php

namespace App\Http\Controllers;

use App\Actions\Stock\StockInAction;
use App\Actions\Stock\StockOutAction;
use App\Http\Requests\StockInRequest;
use App\Http\Requests\StockOutRequest;
use App\Models\Sparepart;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StockController extends Controller
{
    public function __construct(
        protected StockInAction $stockInAction,
        protected StockOutAction $stockOutAction,
    ) {}

    /**
     * Show the form for stock in.
     */
    public function inForm(Request $request, Sparepart $sparepart)
    {
        return Inertia::render('stock/in', [
            'sparepart' => $sparepart->load(['brand', 'category', 'bin.rack', 'activityLogs.user']),
            'returnTo' => $request->query('return_to'),
        ]);
    }

    /**
     * Show the form for stock out.
     */
    public function outFormView(Request $request, Sparepart $sparepart)
    {
        return Inertia::render('stock/out', [
            'sparepart' => $sparepart->load(['brand', 'category', 'bin.rack', 'activityLogs.user']),
            'returnTo' => $request->query('return_to'),
        ]);
    }

    /**
     * Process stock in transaction.
     */
    public function in(StockInRequest $request, Sparepart $sparepart)
    {
        $this->stockInAction->execute(
            $sparepart,
            $request->validated(),
            $request->user()?->id,
        );

        return redirect()->route('spareparts.show', $sparepart)
            ->with('success', "Successfully added {$request->quantity} units to stock.");
    }

    /**
     * Process stock out transaction.
     */
    public function out(StockOutRequest $request, Sparepart $sparepart)
    {
        $this->stockOutAction->execute(
            $sparepart,
            $request->validated(),
            $request->user()->id,
        );

        return redirect()->route('spareparts.show', $sparepart)
            ->with('success', "Successfully removed {$request->quantity} units from stock.");
    }
}
