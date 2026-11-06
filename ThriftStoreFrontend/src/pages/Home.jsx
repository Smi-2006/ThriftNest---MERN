import { ArrowRight, Leaf, ShieldCheck, Sparkles, Star } from 'lucide-react'
import { Link } from 'react-router-dom'

const categories = [
  'Streetwear',
  'Desk Essentials',
  'Vintage Decor',
  'Accessories',
  'Footwear',
  'Workwear',
]

const benefits = [
  { icon: Leaf, title: 'Curated sustainability', text: 'Every purchase supports a second-life lifestyle and gives quality pieces a new chapter.' },
  { icon: ShieldCheck, title: 'Verified sellers', text: 'Trusted product listings and transparent quality checks keep your shopping experience secure.' },
  { icon: Sparkles, title: 'Fresh daily finds', text: 'The marketplace is refreshed with new arrivals and limited, carefully selected inventory.' },
]

export default function Home() {
  return (
    <div style={{ display: 'grid', gap: '56px' }}>
      <section className="hero" style={{ gridTemplateColumns: 'minmax(0, 1fr)' }}>
        <div className="hero-copy">
          <p style={{ textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700, color: '#8d7ca2', marginBottom: '16px' }}>
            Pre-loved, premium, personal
          </p>
          <h1>Discover timeless thrift finds for your everyday life.</h1>
          <p>
            Browse high-quality second-hand essentials and statement pieces from trusted sellers, all in one modern marketplace.
          </p>
          <div className="hero-actions">
            <Link to="/shop" className="button-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
              Shop now
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <section>
        <div className="section-heading">
          <h2>Popular categories</h2>
        </div>

        <div className="category-grid grid-3">
          {categories.map((category) => (
            <div key={category} className="category-tile">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                <span style={{ fontWeight: 700 }}>{category}</span>
                <Star size={16} color="#8d7ca2" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="section-heading">
          <h2>Why shoppers love ThriftNest</h2>
        </div>

        <div className="benefits-grid">
          {benefits.map(({ icon: Icon, title, text }) => (
            <div key={title} className="feature-card">
              <div style={{ width: 46, height: 46, borderRadius: 14, display: 'grid', placeItems: 'center', background: 'rgba(185, 221, 245, 0.28)', color: '#7d6992', marginBottom: 16 }}>
                <Icon size={20} />
              </div>
              <h3 style={{ marginTop: 0, marginBottom: '10px' }}>{title}</h3>
              <p style={{ margin: 0, color: '#5d554f', lineHeight: 1.7 }}>{text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
