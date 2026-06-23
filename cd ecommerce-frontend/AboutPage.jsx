import { ArrowRight, Zap, Heart, Shield, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function AboutPage() {
  return (
    <div className="pt-20 min-h-screen bg-white">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-16 sm:py-24">
        <div className="text-center space-y-6">
          <h1 className="font-display text-5xl sm:text-7xl uppercase tracking-tight">
            NEXUS<span style={{ color: 'var(--accent)' }}>.</span>
          </h1>
          <p className="text-2xl font-bold uppercase">Everything, Everywhere</p>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            A bold new marketplace where independent traders meet global consumers. We're building the future of commerce with radical transparency, uncompromising quality, and a design philosophy that refuses to whisper.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <h2 className="font-display text-4xl uppercase">Our Mission</h2>
            <p className="text-lg leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              NEXUS is a next-generation e-commerce platform built to empower small sellers and discerning buyers. We connect independent traders directly to customers who value authenticity and quality, eliminating unnecessary middlemen and creating genuine economic opportunity.
            </p>
            <p className="text-lg leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Every product on NEXUS is curated with purpose. Every seller is vetted with care. Every transaction is built on trust.
            </p>
          </div>
          <div className="p-8 rounded-2xl" style={{ background: '#000', border: '4px solid #000', color: '#fff' }}>
            <p className="text-4xl font-black mb-4">100%</p>
            <p className="text-lg font-bold">Independent Seller First Platform</p>
            <p className="mt-4 text-sm">We prioritize traders over corporations, giving small businesses the tools and visibility they deserve.</p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="font-display text-4xl uppercase mb-12">Core Values</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {[
            { icon: Zap, title: 'Bold Design', desc: 'No corporate blandness. Our UI is loud, unapologetic, and unforgettable.' },
            { icon: Heart, title: 'Seller Empowerment', desc: 'Traders keep more. Earn more. Grow more. Your success is our success.' },
            { icon: Shield, title: 'Trust & Safety', desc: '100% verified sellers, secure payments, and buyer protection guarantees.' },
            { icon: TrendingUp, title: 'Growth Partners', desc: 'We invest in seller success with analytics, promotion tools, and fair commission rates.' }
          ].map((value) => (
            <div key={value.title} className="p-6 rounded-2xl" style={{ background: '#fff', border: '4px solid #000', boxShadow: '6px 6px 0 #000' }}>
              <value.icon size={32} style={{ color: 'var(--accent)' }} className="mb-4" />
              <h3 className="font-bold text-xl uppercase mb-2">{value.title}</h3>
              <p style={{ color: 'var(--text-secondary)' }}>{value.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why NEXUS Section */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="font-display text-4xl uppercase mb-12">Why Choose NEXUS?</h2>
        <div className="space-y-4">
          {[
            'Direct Access to Sellers - No corporate gatekeeping, just honest business',
            'Fair Commission Model - Sellers earn 85%+ of every sale',
            'Seller Analytics Dashboard - Real-time data on inventory, sales, and customers',
            'Global Market Reach - Sell to customers worldwide from day one',
            'Marketing Support - Promotion tools, trending features, and seasonal campaigns',
            'Fast Payouts - Weekly settlements to your preferred payment method',
            'Dedicated Support Team - Real humans answering your questions 24/7',
            'Innovation First - Early access to new features and beta programs'
          ].map((feature, idx) => (
            <div key={idx} className="flex items-start gap-4 p-4 rounded-xl" style={{ background: '#f4f4f0', border: '2px solid #000' }}>
              <ArrowRight size={20} style={{ color: 'var(--accent)', flexShrink: 0 }} className="mt-1" />
              <p className="text-lg font-medium">{feature}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="bg-white p-12 rounded-2xl text-center" style={{ border: '4px solid #000', boxShadow: '8px 8px 0 #000' }}>
          <h3 className="font-display text-3xl uppercase mb-4">Ready to Join the Revolution?</h3>
          <p className="text-lg mb-8" style={{ color: 'var(--text-secondary)' }}>
            Whether you're a seller looking to launch your business or a buyer seeking authentic products, NEXUS is your platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/products" className="btn-primary px-8 py-4 text-lg">
              Shop Now
            </Link>
            <Link to="/register" className="btn-outline px-8 py-4 text-lg">
              Become a Seller
            </Link>
          </div>
        </div>
      </section>

      {/* Footer Stats */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { num: '10K+', label: 'Active Sellers' },
            { num: '500K+', label: 'Products' },
            { num: '1M+', label: 'Happy Customers' },
            { num: '50+', label: 'Countries' }
          ].map((stat) => (
            <div key={stat.label} className="text-center p-6 rounded-xl" style={{ background: '#f4f4f0', border: '3px solid #000' }}>
              <p className="font-display text-3xl font-black">{stat.num}</p>
              <p className="text-sm uppercase font-bold mt-2" style={{ color: 'var(--text-secondary)' }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}