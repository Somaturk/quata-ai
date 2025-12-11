'use server';

/**
 * @fileOverview Server actions for the application.
 * - getUsdToTryRate: Fetches the current USD to TRY exchange rate.
 */

// A simple, no-key API for exchange rates.
const EXCHANGE_RATE_API_URL = 'https://api.frankfurter.app/latest?from=USD&to=TRY';
const FALLBACK_RATE = 33.0; // A sensible fallback rate in case the API fails.

/**
 * Fetches the latest USD to TRY exchange rate.
 * Caches the result for 1 hour to avoid excessive API calls.
 * @returns {Promise<number>} The current exchange rate.
 */
export async function getUsdToTryRate(): Promise<number> {
    try {
        const response = await fetch(EXCHANGE_RATE_API_URL, {
            next: { revalidate: 3600 } // Revalidate every hour
        });

        if (!response.ok) {
            console.error(`API Error: ${response.status} ${response.statusText}`);
            return FALLBACK_RATE;
        }

        const data = await response.json();
        
        if (data && data.rates && data.rates.TRY) {
            return data.rates.TRY;
        } else {
            console.error("Invalid data format from exchange rate API");
            return FALLBACK_RATE;
        }

    } catch (error) {
        console.error("Failed to fetch exchange rate:", error);
        return FALLBACK_RATE;
    }
}
