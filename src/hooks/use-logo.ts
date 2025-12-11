
"use client";

import { useState, useEffect, useCallback } from 'react';

const LOGO_STORAGE_KEY = 'onequata-logo';

export function useLogo() {
    const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
    const [isLogoLoaded, setIsLogoLoaded] = useState(false);

    useEffect(() => {
        try {
            const storedLogo = window.localStorage.getItem(LOGO_STORAGE_KEY);
            if (storedLogo) {
                setLogoDataUrl(storedLogo);
            }
        } catch (error) {
            console.error("Failed to load logo from localStorage", error);
        }
        setIsLogoLoaded(true);
    }, []);

    const saveLogo = useCallback((dataUrl: string | null) => {
        try {
            if (dataUrl) {
                window.localStorage.setItem(LOGO_STORAGE_KEY, dataUrl);
            } else {
                window.localStorage.removeItem(LOGO_STORAGE_KEY);
            }
            setLogoDataUrl(dataUrl);
        } catch (error) {
            console.error("Failed to save logo to localStorage", error);
        }
    }, []);

    return { logoDataUrl, isLogoLoaded, saveLogo };
}
