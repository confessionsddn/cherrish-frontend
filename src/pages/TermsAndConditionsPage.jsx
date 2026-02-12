import LegalHeader from './LegalHeader'
import './LegalPages.css'

export default function TermsAndConditionsPage() {
  return (
    <div className="legal-page">
      <LegalHeader currentPath="/terms-and-conditions" />
      <main className="legal-content">
        <section className="legal-card">
          <h1>Terms and Conditions</h1>
          <p>
            By accessing Cherrish, you agree to use the platform responsibly and in compliance with all applicable
            laws.
          </p>

          <h2>Eligibility</h2>
          <p>
            You must provide accurate account information and be part of an approved institution community to use core
            platform features.
          </p>

          <h2>Acceptable Use</h2>
          <ul>
            <li>No harassment, threats, hate speech, or illegal content.</li>
            <li>No impersonation, fraudulent activity, or unauthorized access attempts.</li>
            <li>No attempts to reverse engineer or disrupt platform services.</li>
          </ul>

          <h2>Enforcement</h2>
          <p>
            We may remove content, suspend access, or permanently ban accounts that violate these terms or our safety
            standards.
          </p>
        </section>
      </main>
    </div>
  )
}
