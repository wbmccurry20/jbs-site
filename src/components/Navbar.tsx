import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface NavbarProps {
  client?: string;
}

export default function Navbar({ client }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Services', href: '/services' },
    { name: 'Portfolio', href: '/portfolio' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-jbs-dark/95 backdrop-blur-md shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <a href="/" className="flex items-center group">
            <img 
              src="/images/jbs_new_logo.jpg.png" 
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
              Get a Quote &rarr;
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-white hover:text-jbs-blue transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <span className="font-heading text-sm uppercase tracking-wider">Close</span>
            ) : (
              <span className="font-heading text-sm uppercase tracking-wider">Menu</span>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden py-4 border-t border-white/10"
          >
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="block px-4 py-3 text-white/80 hover:text-jbs-blue transition-colors font-heading text-sm uppercase tracking-wider"
              >
                {link.name}
              </a>
            ))}
            <a
              href="/contact"
              className="block mx-4 mt-4 px-6 py-3 bg-jbs-blue text-white font-heading text-sm uppercase tracking-wider text-center hover:bg-jbs-blue/90 transition-all"
            >
              Get a Quote &rarr;
            </a>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
}
