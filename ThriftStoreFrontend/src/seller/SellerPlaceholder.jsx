export default function SellerPlaceholder() {
  return (
    <div className="auth-shell" style={{ textAlign: 'center' }}>
      <h2 style={{ marginTop: 0 }}>Seller portal placeholder</h2>
      <p style={{ color: '#5d554f', marginBottom: '18px' }}>
        MOCK/DEVELOPMENT seller access is active. This route is a placeholder until the seller dashboard is implemented.
      </p>
      <div className="card" style={{ padding: '1.1rem 1.25rem' }}>
        Seller registration is successfully mocked and stored in local session state only.
      </div>
    </div>
  )
}
