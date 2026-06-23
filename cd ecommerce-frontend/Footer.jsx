import { Link } from 'react-router-dom'
import { Github, Linkedin } from 'lucide-react'

export default function Footer() {
  return (
    <footer style={{ background: '#f4f4f0', borderTop: '4px solid #000' }} className="mt-20">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="font-display text-3xl uppercase tracking-tight">NEXUS<span style={{ color: 'var(--accent-3)' }}>.</span></span>
            </div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              Everything you need, all in one place. Discover millions of products.
            </p>
            <div className="mt-4 surface p-4">
              <p className="text-xs font-black mb-2 uppercase" style={{ color: '#000' }}>Get style drops weekly</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-3 py-2 rounded-lg text-xs outline-none"
                  style={{ background: '#fff', border: '3px solid #000', color: 'var(--text-primary)' }}
                />
                <button className="btn-primary text-xs py-2 px-3">Join</button>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              {[
                {
                  Icon: Github,
                  href: 'https://github.com/DineshKarpothula',
                  label: 'GitHub',
                  bg: '#111111',
                  color: '#ffffff',
                },
                {
                  Icon: Linkedin,
                  href: 'https://www.linkedin.com/in/dinesh-karupothula-2a3494357/',
                  label: 'LinkedIn',
                  bg: '#0A66C2',
                  color: '#ffffff',
                },
              ].map(({ Icon, href, label, bg, color }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="p-2 rounded-lg transition-all"
                  style={{ color, background: bg, border: '3px solid #000', boxShadow: '3px 3px 0 #000' }}
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {[
            {
              title: 'Shop',
              links: [
                { label: 'All Products', to: '/products' },
                { label: 'Electronics', to: '/products?category=electronics' },
                { label: 'Fashion', to: '/products?category=fashion' },
                { label: 'Home & Garden', to: '/products?search=home%20garden' },
                { label: 'Sports', to: '/products?search=sports' },
              ],
            },
            {
              title: 'Account',
              links: [
                { label: 'Login', to: '/login' },
                { label: 'Register', to: '/register' },
                { label: 'My Orders', to: '/profile/orders' },
                { label: 'Profile', to: '/profile' },
                { label: 'Wishlist', to: '/wishlist' },
              ],
            },
            {
              title: 'Support',
              links: [
                { label: 'Help Center', to: '/help' },
                { label: 'Returns', to: '/returns' },
                { label: 'Track Order', to: '/profile/orders' },
                { label: 'Contact Us', to: '/products?search=contact' },
                { label: 'FAQs', to: '/products?search=faq' },
              ],
            },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="font-display text-2xl uppercase mb-4">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="text-sm font-semibold hover:underline transition-colors"
                      style={{ color: 'var(--text-secondary)' }}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-2"
          style={{ borderTop: '4px solid #000', color: 'var(--text-secondary)' }}>
          <p className="text-xs">© 2025 NEXUS. All rights reserved.</p>
          <p className="text-xs">Built with React + Node.js + MongoDB Atlas</p>
        </div>
      </div>
    </footer>
  )
}