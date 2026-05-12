<?php

namespace App\Http\Controllers;

use App\Http\Requests\StockInRequest;
use App\Http\Requests\StockOutRequest;
use App\Models\ActivityLog;
use App\Models\Sparepart;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class StockController extends Controller
{
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
    public function outForm(Request $request, Sparepart $sparepart)
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
        DB::transaction(function () use ($request, $sparepart) {
            $data = $request->validated();

            // Update sparepart stock & last transaction info
            $sparepart->update([
                'actual_stock' => $sparepart->actual_stock + $data['quantity'],
                'last_po_number' => $data['po_number'],
                'last_supplier' => $data['supplier'],
                'last_gr_date' => $data['gr_date'],
                'price_per_unit' => $data['price_per_unit'],
            ]);

            // Create activity log
            ActivityLog::create([
                'sparepart_id' => $sparepart->id,
                'user_id' => $request->user()?->id,
                'type' => 'IN',
                'quantity' => $data['quantity'],
                'remarks' => $data['remarks'] ?? null,
                'po_number' => $data['po_number'],
                'gr_date' => $data['gr_date'],
                'price_per_unit' => $data['price_per_unit'],
            ]);
        });

        return redirect()->route('spareparts.show', $sparepart)
            ->with('success', "Successfully added {$request->quantity} units to stock.");
    }

    /**
     * Process stock out transaction.
     */
    public function out(StockOutRequest $request, Sparepart $sparepart)
    {
        DB::transaction(function () use ($request, $sparepart) {
            $data = $request->validated();

            // Update sparepart stock
            $sparepart->update([
                'actual_stock' => $sparepart->actual_stock - $data['quantity'],
            ]);

            // Create activity log
            ActivityLog::create([
                'sparepart_id' => $sparepart->id,
                'user_id' => $request->user()->id,
                'type' => 'OUT',
                'quantity' => $data['quantity'],
                'remarks' => $data['remarks'] ?? null,
            ]);
        });

        return redirect()->route('spareparts.show', $sparepart)
            ->with('success', "Successfully removed {$request->quantity} units from stock.");
    }
}
