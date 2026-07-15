<?php

namespace App\Http\Requests\Concerns;

trait SanitizesInput
{
    protected function sanitizeString(?string $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $sanitized = preg_replace('/<(script|style)\b[^>]*>.*?<\/\1>/is', '', $value);
        $sanitized = strip_tags((string) $sanitized);
        $sanitized = preg_replace('/\s+/u', ' ', $sanitized);

        return filled($sanitized) ? trim((string) $sanitized) : null;
    }
}
