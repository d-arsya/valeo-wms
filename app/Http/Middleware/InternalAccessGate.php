<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cookie;
use Symfony\Component\HttpFoundation\Response;

class InternalAccessGate
{
    /**
     * Handle an incoming request.
     *
     * Protects the application by requiring a secret access token via URL (?token=... or ?access_token=... or ?key=...).
     * Once verified, an encrypted session and long-lived cookie (30 days) are set, and the user is redirected
     * to the clean URL.
     * If accessed raw without authorization, it returns a 404 Not Found error (pretending the site does not exist).
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $secretToken = config('app.internal_access_token');

        // If no secret token is configured, allow normal access
        if (empty($secretToken)) {
            return $next($request);
        }

        // Whitelisted public system / asset paths
        if ($request->is('up', 'favicon.ico', 'robots.txt', 'logo.png', 'build/*', 'storage/*')) {
            return $next($request);
        }

        $expectedHash = hash('sha256', $secretToken.config('app.key'));
        $cookieName = 'valeo_access_pass';
        $cookieLifetimeMinutes = 60 * 24 * 30; // 30 days

        // Allow and auto-renew if user is already authenticated
        if ($request->user()) {
            Cookie::queue($cookieName, $expectedHash, $cookieLifetimeMinutes, null, null, false, true);
            return $next($request);
        }

        // 1. Check if token is passed via query parameter (?token=..., ?access_token=..., or ?key=...)
        $providedToken = $request->query('token') 
            ?? $request->query('access_token') 
            ?? $request->query('key');

        if (!empty($providedToken) && is_string($providedToken)) {
            if (hash_equals((string) $secretToken, $providedToken)) {
                // Grant access in session
                $request->session()->put('valeo_internal_access_pass', true);

                // Queue long-lived cookie (30 days)
                $cookie = cookie($cookieName, $expectedHash, $cookieLifetimeMinutes, null, null, false, true);

                // Redirect to the same URL without the token parameter for a clean URL bar
                $query = $request->query();
                unset($query['token'], $query['access_token'], $query['key']);

                $cleanUrl = $request->url();
                if (!empty($query)) {
                    $cleanUrl .= '?'.http_build_query($query);
                }

                return redirect($cleanUrl)->withCookie($cookie);
            }
        }

        // 2. Check if active session or valid cookie exists
        $hasSessionPass = $request->session()->get('valeo_internal_access_pass') === true;
        $cookiePass = $request->cookie($cookieName);
        $hasValidCookie = !empty($cookiePass) && hash_equals($expectedHash, (string) $cookiePass);

        if ($hasSessionPass || $hasValidCookie) {
            // Auto-Renew: Perpanjang masa berlaku cookie 30 hari lagi setiap kali web diakses
            Cookie::queue($cookieName, $expectedHash, $cookieLifetimeMinutes, null, null, false, true);
            $request->session()->put('valeo_internal_access_pass', true);

            return $next($request);
        }

        // 3. Unauthorized access: Return 404 Not Found (hiding the website completely)
        abort(404);
    }
}
