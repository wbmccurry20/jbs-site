import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Services', href: '/services' },
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
              {navLinks.map((link) => (
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

            {/* Mobile Hamburger Button */}
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

      {/* Full-screen Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed inset-0 z-40 bg-jbs-dark flex flex-col"
          >
            {/* Top bar spacer */}
            <div className="h-20 shrink-0" />

            {/* Nav Links */}
            <nav className="flex-1 flex flex-col justify-center px-8">
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
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
                transition={{ delay: navLinks.length * 0.07 + 0.1 }}
                className="mt-10 px-8 py-4 bg-jbs-blue text-white font-heading text-lg uppercase tracking-wider text-center hover:bg-jbs-blue/90 transition-all"
              >
                Contact Us &rarr;
              </motion.a>
            </nav>

            {/* Bottom info */}
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
