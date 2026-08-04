/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,svelte,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
        secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
        destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
        muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
        accent: { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' },
        card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        /* neobrutalism tokens */
        main: { DEFAULT: 'hsl(var(--main))', foreground: 'hsl(var(--main-foreground))' },
        'secondary-background': 'hsl(var(--secondary-background))',
        overlay: 'hsl(var(--overlay))',
      },
      borderRadius: { DEFAULT: 'var(--radius)', base: 'var(--border-radius)' },
      boxShadow: {
        shadow: 'var(--box-shadow-x) var(--box-shadow-y) 0px 0px #000',
        reverseShadow: 'calc(-1 * var(--box-shadow-x)) calc(-1 * var(--box-shadow-y)) 0px 0px #000',
      },
      spacing: {
        boxShadowX: 'var(--box-shadow-x)',
        boxShadowY: 'var(--box-shadow-y)',
        reverseBoxShadowX: 'calc(-1 * var(--box-shadow-x))',
        reverseBoxShadowY: 'calc(-1 * var(--box-shadow-y))',
      },
      fontFamily: {
        base: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontWeight: {
        base: '500',
        heading: '700',
      },
    },
  },
  plugins: [],
};
