import { Link } from 'react-router-dom'
import { Zap, Star, Truck, Gift } from 'lucide-react'

export default function CollectionsPage() {
  const collections = [
    {
      title: 'BEST SELLERS',
      description: 'Top-performing products loved by our community',
      icon: Star,
      color: '#e91e63',
      category: 'electronics',
      image: '🏆'
    },
    {
      title: 'TRENDING NOW',
      description: 'The hottest products gaining momentum this week',
      icon: Zap,
      color: '#ff5722',
      category: 'fashion',
      image: '🔥'
    },
    {
      title: 'NEW ARRIVALS',
      description: 'Fresh products just added to our marketplace',
      icon: Gift,
      color: '#00e5ff',
      category: 'toys',
      image: '✨'
    },
    {
      title: 'FAST SHIPPING',
      description: 'Products available with express delivery',
      icon: Truck,
      color: '#22c55e',
      category: 'sports',
      image: '🚚'
    }
  ]

  const categories = [
    {
      name: 'Electronics',
      description: 'Tech gadgets and devices',
      products: '2,500+',
      color: '#3b82f6',
      urlCategory: 'electronics'
    },
    {
      name: 'Fashion',
      description: 'Apparel and accessories',
      products: '5,000+',
      color: '#ec4899',
      urlCategory: 'fashion'
    },
    {
      name: 'Home & Living',
      description: 'Furniture and home decor',
      products: '3,200+',
      color: '#f59e0b',
      urlCategory: 'home'
    },
    {
      name: 'Sports & Outdoors',
      description: 'Athletic and outdoor gear',
      products: '1,800+',
      color: '#10b981',
      urlCategory: 'sports'
    },
    {
      name: 'Books & Media',
      description: 'Books, audiobooks, and media',
      products: '4,500+',
      color: '#8b5cf6',
      urlCategory: 'books'
    },
    {
      name: 'Beauty & Wellness',
      description: 'Skincare and wellness products',
      products: '2,100+',
      color: '#f97316',
      urlCategory: 'beauty'
    },
    {
      name: 'Toys & Games',
      description: 'Toys, games, and collectibles',
      products: '1,600+',
      color: '#06b6d4',
      urlCategory: 'toys'
    },
    {
      name: 'Automotive',
      description: 'Car accessories and parts',
      products: '900+',
      color: '#6366f1',
      urlCategory: 'automotive'
    }
  ]

  return (
    <div className="pt-20 min-h-screen bg-white">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-16 sm:py-24">
        <div className="text-center space-y-6">
          <h1 className="font-display text-5xl sm:text-7xl uppercase tracking-tight">
            Curated<br />
            <span style={{ color: 'var(--accent)' }}>Collections</span>
          </h1>
          <p className="text-xl max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Explore expertly organized collections of products handpicked for quality, value, and style. Discover your next favorite item.
          </p>
        </div>
      </section>

      {/* Featured Collections */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="font-display text-4xl uppercase mb-12">Featured Collections</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {collections.map((collection) => {
            const Icon = collection.icon
            return (
              <Link key={collection.title} to={`/products?category=${collection.category}`}>
                <div 
                  className="p-8 rounded-2xl cursor-pointer transition-transform hover:translate-y-[-4px] hover:shadow-lg"
                  style={{ 
                    background: '#fff',
                    border: '4px solid #000',
                    boxShadow: '6px 6px 0 #000'
                  }}
                >
                  <div className="flex items-start justify-between mb-6">
                    <Icon size={32} style={{ color: collection.color }} />
                    <span className="text-4xl">{collection.image}</span>
                  </div>
                  <h3 className="font-display text-2xl uppercase mb-2">{collection.title}</h3>
                  <p style={{ color: 'var(--text-secondary)' }} className="mb-4">{collection.description}</p>
                  <div className="flex items-center gap-2 font-bold" style={{ color: collection.color }}>
                    Explore Collection <span>→</span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Shop by Category */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="font-display text-4xl uppercase mb-12">Shop by Category</h2>
        <div className="grid md:grid-cols-4 gap-4">
          {categories.map((category) => (
            <Link key={category.name} to={`/products?category=${category.urlCategory}`}>
              <div 
                className="p-6 rounded-xl cursor-pointer transition-all hover:scale-105"
                style={{ 
                  background: '#fff',
                  border: '3px solid #000',
                  boxShadow: '4px 4px 0 #000'
                }}
              >
                <div 
                  className="w-12 h-12 rounded-lg mb-4 flex items-center justify-center"
                  style={{ background: category.color }}
                >
                  <span className="text-xl font-black">●</span>
                </div>
                <h3 className="font-bold text-lg uppercase mb-1">{category.name}</h3>
                <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                  {category.description}
                </p>
                <p style={{ color: category.color }} className="text-sm font-bold">
                  {category.products} products
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Curated Sections */}
      <section className="max-w-7xl mx-auto px-4 py-16 space-y-8">
        <h2 className="font-display text-4xl uppercase">Special Sections</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div 
            className="p-8 rounded-2xl"
            style={{ 
              background: 'linear-gradient(135deg, #ff5722 0%, #ff9800 100%)',
              border: '4px solid #000',
              color: '#fff'
            }}
          >
            <h3 className="font-display text-3xl uppercase mb-3">Flash Deals</h3>
            <p className="text-lg mb-4">Limited-time offers ending TODAY. Up to 70% off selected items.</p>
            <Link to="/products" className="inline-block font-bold uppercase hover:underline">
              Shop Flash Deals →
            </Link>
          </div>

          <div 
            className="p-8 rounded-2xl"
            style={{ 
              background: '#e91e63',
              border: '4px solid #000',
              color: '#fff'
            }}
          >
            <h3 className="font-display text-3xl uppercase mb-3">Seller Favorites</h3>
            <p className="text-lg mb-4">Hand-picked by our top independent sellers. Their personal recommendations.</p>
            <Link to="/products" className="inline-block font-bold uppercase hover:underline">
              Explore Favorites →
            </Link>
          </div>
        </div>
      </section>

      {/* Why Collections Matter */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="bg-black p-12 rounded-2xl text-white text-center" style={{ border: '4px solid #fff' }}>
          <h3 className="font-display text-3xl uppercase mb-4">Collections That Inspire</h3>
          <p className="text-lg mb-6 max-w-2xl mx-auto">
            Our collections are designed to help you discover amazing products faster. Whether you're looking for trending items, bestsellers, or category deep-dives, we've organized everything for maximum inspiration.
          </p>
          <p className="text-sm uppercase tracking-wide" style={{ color: '#00e5ff' }}>
            ✦ Expertly Curated ✦ Regularly Updated ✦ Community Driven ✦
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="font-display text-3xl uppercase mb-6">Ready to Explore?</h2>
        <Link to="/products" className="btn-primary px-10 py-4 text-lg inline-block">
          Start Shopping Now
        </Link>
      </section>
    </div>
  )
}
