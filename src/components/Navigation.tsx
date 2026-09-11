import { useEffect, useRef, useState } from 'react';

// TODO: replace with your real nav links
const LINKS = [
  { label: 'Product', href: '/product' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact-us' },
];

// 'dark' (default) is for pages whose nav sits over a dark/hero background.
// 'light' is for pages where the nav sits directly on the plain page
// background instead of a hero.
type NavigationProps = {
  variant?: 'dark' | 'light';
};

export default function Navigation({ variant = 'dark' }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [navHeight, setNavHeight] = useState(0);
  // Tracks whether the page has been scrolled past its hero section (marked
  // with data-hero on the hero's root element) — only relevant for
  // variant="dark", since "light" pages have no hero to leave.
  const [scrolledPastHero, setScrolledPastHero] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const isLight = variant === 'light' || scrolledPastHero;

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  // Nav is fixed (out of flow), so measure its own height to reserve the
  // equivalent space where it sits in the document via the spacer below.
  useEffect(() => {
    const measure = () => setNavHeight(navRef.current?.offsetHeight ?? 0);
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  useEffect(() => {
    if (variant !== 'dark') return;
    const heroEl = navRef.current?.closest('[data-hero]');
    if (!heroEl) return;
    // rootMargin pulls the observation line down by the nav's own height, so
    // the switch fires exactly when the hero has fully scrolled out from
    // under the nav.
    const observer = new IntersectionObserver(
      ([entry]) => setScrolledPastHero(!entry.isIntersecting),
      { rootMargin: `-${navHeight}px 0px 0px 0px`, threshold: 0 }
    );
    observer.observe(heroEl);
    return () => observer.disconnect();
  }, [variant, navHeight]);

  return (
    <>
      {/* Reserves the nav's space in normal flow now that the nav itself is fixed. */}
      <div style={navHeight ? { height: navHeight } : undefined} aria-hidden="true" />
      <nav
        ref={navRef}
        className={`fixed top-0 inset-x-0 z-50 transition-colors duration-300 ${isLight ? 'bg-background/70' : 'bg-transparent'} backdrop-blur-[18px] w-full ${isOpen ? 'max-lg:invisible' : ''}`}
      >
        <div className="flex items-center justify-between px-4 lg:px-[100px] py-4 max-w-[1440px] mx-auto">
          <a href="/" className={`font-heading font-bold text-body-lg ${isLight ? 'text-ink' : 'text-background'}`}>
            {/* TODO: swap for a logo image via asset() from src/lib/cdn.ts */}
            My Project
          </a>

          <div className="flex gap-6 items-center">
            <div className="hidden lg:flex gap-6 items-center">
              {LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className={`group relative font-body font-medium ${isLight ? 'text-ink' : 'text-background'} text-body-sm whitespace-nowrap py-1`}
                >
                  {link.label}
                  <span
                    aria-hidden="true"
                    className={`absolute left-0 -bottom-0.5 h-px w-full origin-left scale-x-0 transition-transform duration-300 ease-out group-hover:scale-x-100 ${isLight ? 'bg-ink' : 'bg-background'}`}
                  />
                </a>
              ))}
            </div>
            <a
              href="/contact-us"
              className={`hidden md:flex items-center justify-center rounded-lg px-4 py-2 font-body font-medium text-body-sm whitespace-nowrap transition-colors duration-300 ${isLight ? 'bg-ink text-background' : 'bg-background text-ink'}`}
            >
              Contact us
            </a>
            <button
              type="button"
              className="lg:hidden flex flex-col gap-1.5 shrink-0 p-2"
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
              aria-label="Open menu"
              onClick={() => setIsOpen(true)}
            >
              <span className={`block h-0.5 w-5 ${isLight ? 'bg-ink' : 'bg-background'}`} />
              <span className={`block h-0.5 w-5 ${isLight ? 'bg-ink' : 'bg-background'}`} />
            </button>
          </div>
        </div>
      </nav>

      <div
        id="mobile-menu"
        className={`lg:hidden fixed inset-0 z-50 bg-background transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full pointer-events-none'
        }`}
      >
        <div className="flex items-center justify-between p-4 w-full">
          <a href="/" className="font-heading font-bold text-body-lg text-ink">My Project</a>
          <button
            type="button"
            className="p-2"
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
            aria-label="Close menu"
            onClick={() => setIsOpen(false)}
          >
            <span className="font-body text-ink">Close</span>
          </button>
        </div>

        <div className="flex flex-col gap-5 items-start w-full px-4 pt-10">
          {LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="font-heading text-h3 text-ink w-full"
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </>
  );
}
