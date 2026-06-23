import { Link } from 'react-router-dom'

export default function HelpCenter() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <Link to="/" className="text-sm text-orange-500 mb-4 inline-block">← Back to Home</Link>
      <h1 className="font-display text-5xl uppercase mb-2">Help Center</h1>
      <p className="text-sm text-gray-600 mb-8">Find guides and support articles for Users, Sellers and Admins.</p>

      <div className="grid md:grid-cols-3 gap-6">
        <section className="p-6 bg-white" style={{ border: '3px solid #000' }}>
          <h2 className="font-bold text-xl mb-3">Users</h2>
          <ul className="space-y-2 text-sm">
            <li>How to place an order</li>
            <li>Track your shipment</li>
            <li>Request a return or refund</li>
            <li>Manage your account & security</li>
            <li>Payment troubleshooting</li>
          </ul>
          <Link to="/support" className="mt-4 inline-block btn-primary">Contact Support</Link>
        </section>

        <section className="p-6 bg-white" style={{ border: '3px solid #000' }}>
          <h2 className="font-bold text-xl mb-3">Sellers</h2>
          <ul className="space-y-2 text-sm">
            <li>Onboarding & verification</li>
            <li>Managing products and inventory</li>
            <li>Orders, fulfillment and shipping</li>
            <li>Returns & disputes</li>
            <li>Payouts and tax information</li>
          </ul>
          <Link to="/support" className="mt-4 inline-block btn-primary">Contact Seller Support</Link>
        </section>

        <section className="p-6 bg-white" style={{ border: '3px solid #000' }}>
          <h2 className="font-bold text-xl mb-3">Admins</h2>
          <ul className="space-y-2 text-sm">
            <li>Platform policies & moderation</li>
            <li>Manage disputes and escalations</li>
            <li>View system health & analytics</li>
            <li>Configure fees & taxes</li>
            <li>Support ticket triage</li>
          </ul>
          <Link to="/admin/support" className="mt-4 inline-block btn-outline">Admin Support Panel</Link>
        </section>
      </div>

      <div className="mt-12">
        <h3 className="font-bold text-2xl mb-3">Frequently Asked Questions</h3>
        <div className="space-y-4 text-sm">
          <details className="p-4 bg-white" style={{ border: '3px solid #000' }}>
            <summary className="font-semibold">How do I return an item?</summary>
            <p className="mt-2">Go to Returns page in your profile, choose the item and follow the return flow. Refunds typically take 3-5 business days after approval.</p>
          </details>
          <details className="p-4 bg-white" style={{ border: '3px solid #000' }}>
            <summary className="font-semibold">How long until I get paid as a seller?</summary>
            <p className="mt-2">Payouts are processed every 7 days. Check the Seller dashboard for balance and payout history.</p>
          </details>
        </div>
      </div>
    </div>
  )
}
