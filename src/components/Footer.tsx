import { DIVISIONS } from '../data/divisions';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-jbs-dark text-white">
      {/* Blue accent line */}
      <div className="h-1 bg-jbs-blue"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-4 gap-12">
          {/* Company Info */}
          <div className="col-span-2 md:col-span-1">
            <img 
              src="/images/logos/jbs_new_logo.jpg.png" 
              alt="JBS Construction" 
              className="h-10 w-auto mb-6 logo-dark-bg"
            />
            <p className="text-white/50 text-sm leading-relaxed mb-6">
              Nationwide commercial construction. Built Different — by leaders like you.
            </p>
            <div className="flex items-center gap-4">
              <a href="https://www.linkedin.com/company/jbs-management-group-llc/" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-jbs-blue transition-colors" aria-label="LinkedIn">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              <a href="https://www.facebook.com/profile.php?id=61588878360878" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-jbs-blue transition-colors" aria-label="Facebook">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
                </svg>
              </a>
              <a href="https://www.instagram.com/buildwithjbs/" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-jbs-blue transition-colors" aria-label="Instagram">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-heading text-xs uppercase tracking-widest text-white/30 mb-6">Navigation</h3>
            <ul className="space-y-3">
              {[
                { name: 'Home', href: '/' },
                { name: 'About Us', href: '/about' },
                { name: 'Divisions', href: '/divisions' },
                { name: 'Portfolio', href: '/portfolio' },
                { name: 'Subcontractors', href: '/client-portal' },
                { name: 'Contact', href: '/contact' },
              ].map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-white/50 hover:text-jbs-blue transition-colors text-sm">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Divisions */}
          <div>
            <h3 className="font-heading text-xs uppercase tracking-widest text-white/30 mb-6">Divisions</h3>
            <ul className="space-y-3 text-sm">
              {DIVISIONS.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-white/50 hover:text-jbs-blue transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-heading text-xs uppercase tracking-widest text-white/30 mb-6">Get in Touch</h3>
            <ul className="space-y-3 text-sm text-white/50">
              <li>
                <a href="mailto:info@jbsconstructiongroup.com" className="hover:text-jbs-blue transition-colors">
                  info@jbsconstructiongroup.com
                </a>
              </li>
              <li>
                <a href="tel:+14803925523" className="hover:text-jbs-blue transition-colors">
                  480-392-5523
                </a>
              </li>
              <li>1230 West Morehead Street, Suite 406, Charlotte, NC 28208</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-white/30">
          <p>&copy; {currentYear} JBS Construction Group. All rights reserved.</p>
          <p className="mt-2 md:mt-0">Built Different.</p>
        </div>
      </div>
    </footer>
  );
}
