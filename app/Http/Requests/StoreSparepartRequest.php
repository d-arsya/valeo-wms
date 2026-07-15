<?php

namespace App\Http\Requests;

use App\Http\Requests\Concerns\SanitizesInput;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreSparepartRequest extends FormRequest
{
    use SanitizesInput;

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->canManageMasterData() ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'material_number' => ['required', 'string', 'unique:spareparts,material_number'],
            'part_name' => ['required', 'string', 'max:255'],
            'specification' => ['required', 'string'],
            'rank' => ['required', 'string', 'max:255'],
            'brand_id' => ['required', 'exists:brands,id'],
            'category_id' => ['required', 'exists:categories,id'],
            'bin_id' => ['required', 'exists:bins,id'],
            'safety_stock' => ['required', 'integer', 'min:0'],
            'actual_stock' => ['required', 'integer', 'min:0'],
            'last_po_number' => ['nullable', 'string', 'max:255'],
            'last_supplier' => ['nullable', 'string', 'max:255'],
            'last_gr_date' => ['nullable', 'date_format:Y-m-d'],
            'price_per_unit' => ['required', 'numeric'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'material_number' => $this->sanitizeString($this->input('material_number')),
            'part_name' => $this->sanitizeString($this->input('part_name')),
            'specification' => $this->sanitizeString($this->input('specification')),
            'rank' => $this->sanitizeString($this->input('rank')),
            'last_po_number' => $this->sanitizeString($this->input('last_po_number')),
            'last_supplier' => $this->sanitizeString($this->input('last_supplier')),
        ]);
    }
}
