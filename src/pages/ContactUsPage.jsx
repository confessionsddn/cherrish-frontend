import LegalHeader from './LegalHeader'
import './LegalPages.css'

export default function ContactUsPage() {
  return (
    <div className="legal-page">
      <LegalHeader currentPath="/contact-us" />
      <main className="legal-content">
        <section className="legal-card">
          <h1>Contact Us</h1>
          <p>
            We are here to help you with account issues, reporting concerns, and general feedback about Cherrish.
          </p>

          <h2>Support Channels</h2>
          <ul>
            <li>Email: itmconfessionddn@gmail.com</li>
            <li>Safety reports: itmconfessionddn@gmail.com</li>
            <li>Average response time: 24 to 48 working hours</li>
          </ul>

          <h2>What to Include</h2>
          <ul>
            <li>Your registered email address</li>
            <li>A short description of the issue</li>
            <li>Relevant screenshots, if available</li>
          </ul>
        </section>
      </main>
    </div>
  )
}
