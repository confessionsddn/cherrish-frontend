import LegalHeader from './LegalHeader'
import './LegalPages.css'

export default function RefundsCancellationPage() {
  return (
    <div className="legal-page">
      <LegalHeader currentPath="/refunds-and-cancellation-policy" />
      <main className="legal-content">
        <section className="legal-card">
          <h1>Refunds and Cancellation Policy</h1>
          <p>
            This policy explains cancellation and refund handling for paid services including credits and premium
            subscriptions on Cherrish.
          </p>

          <h2>Credits</h2>
          <ul>
            <li>Purchased credits are generally non-refundable once added to an account.</li>
            <li>Duplicate or failed transactions can be reviewed and corrected after verification.</li>
          </ul>

          <h2>Premium Plans</h2>
          <ul>
            <li>You may cancel renewal at any time before the next billing cycle.</li>
            <li>Current billing cycle charges are not automatically prorated unless required by law.</li>
          </ul>

          <h2>Requesting Help</h2>
          <p>
            For billing questions, contact billing@cherrish.app with your transaction details and account email.
          </p>
        </section>
      </main>
    </div>
  )
}
