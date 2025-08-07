export function ThemeScript() {
  // This script runs before React hydration to prevent FOUC (Flash of Unstyled Content)
  const themeScript = `
    (function() {
      function getTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
          return savedTheme;
        }
        return 'system';
      }
      
      function applyTheme(theme) {
        let resolvedTheme = 'nord';
        
        if (theme === 'system') {
          resolvedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'business' : 'nord';
        } else if (theme === 'light') {
          resolvedTheme = 'nord';
        } else if (theme === 'dark') {
          resolvedTheme = 'business';
        }
        
        document.documentElement.setAttribute('data-theme', resolvedTheme);
      }
      
      const theme = getTheme();
      applyTheme(theme);
      
      // Listen for system theme changes if in system mode
      if (theme === 'system') {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => applyTheme('system');
        mediaQuery.addEventListener('change', handleChange);
      }
    })();
  `;

  return (
    <script
      dangerouslySetInnerHTML={{ __html: themeScript }}
      suppressHydrationWarning
    />
  );
}