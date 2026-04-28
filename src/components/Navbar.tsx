import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DIVISIONS = [
  { name: 'Auto-Retail', href: '/divisions/auto-retail' },
  { name: 'QSR', href: '/divisions/qsr' },
  { name: 'Healthcare', href: '/divisions/healthcare' },
  { name: 'Site & Civil', href: '/divisions/site-civil' },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDivisionsOpen, setIsDivisionsOpen] = useState(false);
  const [isMobileDivisionsOpen, setIsMobileDivisionsOpen] = useState(false);
  const divisionsTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  const openDivisions = () => {
    if (divisionsTimeout.current) clearTimeout(divisionsTimeout.current);
    setIsDivisionsOpen(true);
  };
  const closeDivisions = () => {
    divisionsTimeout.current = setTimeout(() => setIsDivisionsOpen(false), 120);
  };

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Portfolio', href: '/portfolio' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed w-full top-0 z-50 transition-all duration-300 ${
          isScrolled || isMobileMenuOpen
            ? 'bg-jbs-dark shadow-lg'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <a href="/" className="flex items-center group relative z-50">
              <img
                src="/images/logos/jbs_new_logo.jpg.png"
                alt="JBS Construction - Built Different"
                className="h-12 w-auto group-hover:scale-105 transition-transform logo-dark-bg"
              />
            </a>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              <a
                href="/"
                className="px-4 py-2 text-white/80 hover:text-jbs-blue transition-colors font-heading text-sm uppercase tracking-wider"
              >
                Home
              </a>

              {/* Divisions dropdown */}
              <div
                className="relative"
                onMouseEnter={openDivisions}
                onMouseLeave={closeDivisions}
              >
                <button
                  className="flex items-center gap-1.5 px-4 py-2 text-white/80 hover:text-jbs-blue transition-colors font-heading text-sm uppercase tracking-wider"
                  aria-haspopup="true"
                  aria-expanded={isDivisionsOpen}
                >
                  Divisions
                  <svg
                    className={`w-3 h-3 transition-transform duration-200 ${isDivisionsOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <AnimatePresence>
                  {isDivisionsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50"
                      onMouseEnter={openDivisions}
                      onMouseLeave={closeDivisions}
                    >
                      <div className="bg-jbs-dark border border-white/10 shadow-2xl min-w-[180px]">
                        {/* Blue top accent */}
                        <div className="h-0.5 bg-jbs-blue" />
                        {DIVISIONS.map((div) => (
                          <a
                            key={div.href}
                            href={div.href}
                            className="block px-5 py-3 font-heading text-sm uppercase tracking-wider text-white/70 hover:text-jbs-blue hover:bg-white/[0.04] transition-all border-b border-white/5 last:border-0"
                          >
                            {div.name}
                          </a>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {navLinks.slice(1).map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="px-4 py-2 text-white/80 hover:text-jbs-blue transition-colors font-heading text-sm uppercase tracking-wider"
                >
                  {link.name}
                </a>
              ))}

              <a
                href="/contact"
                className="ml-6 px-6 py-2.5 bg-jbs-blue text-white font-heading text-sm uppercase tracking-wider hover:bg-jbs-blue/90 hover:shadow-lg hover:shadow-jbs-blue/25 transition-all"
              >
                Contact Us &rarr;
              </a>
            </div>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden relative z-50 w-10 h-10 flex flex-col justify-center items-center gap-1.5"
              aria-label="Toggle menu"
            >
              <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`} />
              <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed inset-0 z-40 bg-jbs-dark flex flex-col"
          >
            <div className="h-20 shrink-0" />

            <nav className="flex-1 flex flex-col justify-center px-8 overflow-y-auto">
              <motion.a
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0 }}
                className="block py-5 border-b border-white/10 font-heading text-4xl text-white uppercase tracking-wider hover:text-jbs-blue transition-colors"
              >
                Home
              </motion.a>

              {/* Mobile Divisions accordion */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.07 }}
                className="border-b border-white/10"
              >
                <button
                  onClick={() => setIsMobileDivisionsOpen(!isMobileDivisionsOpen)}
                  className="w-full flex justify-between items-center py-5 font-heading text-4xl text-white uppercase tracking-wider hover:text-jbs-blue transition-colors"
                >
                  Divisions
                  <svg
                    className={`w-5 h-5 transition-transform duration-200 ${isMobileDivisionsOpen ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <AnimatePresence>
                  {isMobileDivisionsOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden pl-4 pb-4"
                    >
                      {DIVISIONS.map((div) => (
                        <a
                          key={div.href}
                          href={div.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="block py-3 font-heading text-xl text-white/60 uppercase tracking-wider hover:text-jbs-blue transition-colors border-b border-white/5 last:border-0"
                        >
                          {div.name}
                        </a>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {[{ name: 'Portfolio', href: '/portfolio' }, { name: 'About', href: '/about' }, { name: 'Contact', href: '/contact' }].map((link, i) => (
                <motion.a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (i + 2) * 0.07 }}
                  className="block py-5 border-b border-white/10 font-heading text-4xl text-white uppercase tracking-wider hover:text-jbs-blue transition-colors"
                >
                  {link.name}
                </motion.a>
              ))}

              <motion.a
                href="/contact"
                onClick={() => setIsMobileMenuOpen(false)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.42 }}
                className="mt-10 px-8 py-4 bg-jbs-blue text-white font-heading text-lg uppercase tracking-wider text-center hover:bg-jbs-blue/90 transition-all"
              >
                Contact Us &rarr;
              </motion.a>
            </nav>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="px-8 py-8 border-t border-white/10"
            >
              <p className="text-white/30 font-heading text-xs uppercase tracking-widest">Built Different</p>
              <a href="mailto:info@jbsconstructiongroup.com" className="text-white/50 text-sm hover:text-jbs-blue transition-colors mt-1 block">
                info@jbsconstructiongroup.com
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
