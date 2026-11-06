export default function Footer() {
  return (
    <footer style={{ background: 'linear-gradient(135deg, rgba(244, 184, 200, 0.12), rgba(185, 221, 245, 0.18))', borderTop: '1px solid var(--border)', color: 'var(--text)', marginTop: 'auto' }}>
      <div className="page-shell" style={{ paddingTop: '24px', paddingBottom: '24px', display: 'grid', gap: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div>
            <strong style={{ letterSpacing: '-0.04em', fontSize: '1.2rem', color: 'var(--text)' }}>ThriftNest</strong>
          </div>
          <div style={{ display: 'flex', gap: '22px', flexWrap: 'wrap', color: 'var(--text-soft)' }}>
            <span>Home</span>
            <span>Shop</span>
            <span>Support</span>
          </div>
        </div>
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '18px', color: 'var(--text-soft)', display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          <span>© 2026 ThriftNest</span>
          <span>Secure checkout • Easy returns • Sustainable shopping</span>
        </div>
      </div>
    </footer>
  )
}
