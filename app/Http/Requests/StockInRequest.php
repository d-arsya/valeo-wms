<?php

namespace App\Http\Requests;

use App\Http\Requests\Concerns\SanitizesInput;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StockInRequest extends FormRequest
{
    use SanitizesInput;

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->canManageStock() ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'quantity' => ['required', 'integer', 'min:1'],
            'po_number' => ['required', 'string', 'max:255'],
            'supplier' => ['required', 'string', 'max:255'],
            'gr_date' => ['required', 'date'],
            'price_per_unit' => ['required', 'numeric', 'min:0'],
            'remarks' => ['nullable', 'string'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'po_number' => $this->sanitizeString($this->input('po_number')),
            'supplier' => $this->sanitizeString($this->input('supplier')),
            'remarks' => $this->sanitizeString($this->input('remarks')),
        ]);
    }
}
