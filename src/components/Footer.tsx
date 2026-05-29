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
            <a href="https://www.linkedin.com/company/jbs-management-group-llc/" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-jbs-blue transition-colors" aria-label="LinkedIn">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
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
                { name: 'Client Portal', href: '/client-portal' },
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
              {[
                { name: 'Auto-Retail', href: '/divisions/auto-retail' },
                { name: 'QSR', href: '/divisions/qsr' },
                { name: 'Healthcare', href: '/divisions/healthcare' },
                { name: 'Site & Civil', href: '/divisions/site-civil' },
              ].map((link) => (
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
