import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
    const { setTheme, resolvedTheme } = useTheme();
    // Initialize mounted state - will be true only on client side after hydration
    const [mounted, setMounted] = useState(false);

    // Use useLayoutEffect to set mounted before paint, avoiding hydration issues
    // This pattern is acceptable as it runs synchronously after DOM mutations
    useEffect(() => {
        // Schedule state update to avoid synchronous setState warning
        const timeoutId = setTimeout(() => setMounted(true), 0);
        return () => clearTimeout(timeoutId);
    }, []);

    // Don't render anything until mounted to avoid hydration mismatch
    if (!mounted) {
        return (
            <Button variant="outline" size="icon" className="relative">
                <div className="h-5 w-5" />
            </Button>
        );
    }

    const isDark = resolvedTheme === 'dark';

    return (
        <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="relative overflow-hidden transition-all hover:scale-105"
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            {/* Sun Icon - visible in dark mode */}
            <Sun
                className={`h-5 w-5 transition-all duration-300 ${isDark
                    ? 'rotate-0 scale-100 opacity-100'
                    : 'rotate-90 scale-0 opacity-0'
                    }`}
                style={{ position: isDark ? 'relative' : 'absolute' }}
            />
            {/* Moon Icon - visible in light mode */}
            <Moon
                className={`h-5 w-5 transition-all duration-300 ${!isDark
                    ? 'rotate-0 scale-100 opacity-100'
                    : '-rotate-90 scale-0 opacity-0'
                    }`}
                style={{ position: !isDark ? 'relative' : 'absolute' }}
            />
            <span className="sr-only">Toggle theme</span>
        </Button>
    );
}
