<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateSparepartRequest extends FormRequest
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
            'material_number' => [
                'required',
                'string',
                'unique:spareparts,material_number,'.$this->route('sparepart')->id,
            ],
            'part_name' => ['required', 'string', 'max:255'],
            'rank' => ['required', 'string', 'max:255'],
            'specification' => ['required', 'string'],
            'brand_id' => ['required', 'exists:brands,id'],
            'category_id' => ['required', 'exists:categories,id'],
            'bin_id' => ['required', 'exists:bins,id'],
            'safety_stock' => ['required', 'integer', 'min:0'],
            'actual_stock' => ['required', 'integer', 'min:0'],
        ];
    }
}
