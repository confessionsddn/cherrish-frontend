import './LegalPages.css'

const LEGAL_LINKS = [
  { path: '/contact-us', label: 'Contact Us' },
  { path: '/terms-and-conditions', label: 'Terms & Conditions' },
  { path: '/refunds-and-cancellation-policy', label: 'Refunds & Cancellation' }
]

export default function LegalHeader({ currentPath }) {
  return (
    <header className="legal-header">
      <button className="legal-brand" onClick={() => (window.location.href = '/')}>
        cherrish
      </button>

      <nav className="legal-nav" aria-label="Legal pages">
        {LEGAL_LINKS.map((link) => (
          <button
            key={link.path}
            className={`legal-nav-btn ${currentPath === link.path ? 'active' : ''}`}
            onClick={() => (window.location.href = link.path)}
          >
            {link.label}
          </button>
        ))}
      </nav>
    </header>
  )
}
