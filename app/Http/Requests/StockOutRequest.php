<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StockOutRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'quantity' => [
                'required', 
                'integer', 
                'min:1',
                function ($attribute, $value, $fail) {
                    $sparepart = $this->route('sparepart');
                    if ($sparepart && $value > $sparepart->actual_stock) {
                        $fail("The quantity exceeds the current actual stock ({$sparepart->actual_stock}).");
                    }
                }
            ],
            'remarks' => ['nullable', 'string'],
        ];
    }
}
