import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const SECTIONS: { title: string; body: React.ReactNode }[] = [
  {
    title: 'About PinoyPantry',
    body: (
      <p>
        PinoyPantry is a Filipino grocery business based in Dunedin, New Zealand. We sell Filipino
        food and pantry products through this website and in person, and we run occasional
        <strong> Pasabuy</strong> shipments where we buy items in the Philippines for you. By placing an
        order or using this website you agree to these terms.
      </p>
    ),
  },
  {
    title: 'Orders',
    body: (
      <ul className="list-disc pl-5 space-y-1.5">
        <li>All prices are in New Zealand dollars (NZD).</li>
        <li>Placing an order is a request to buy. It is confirmed once we've received it and been in touch (by phone or email) where needed.</li>
        <li>Stock is limited. If an item you ordered turns out to be unavailable, we'll contact you to offer an alternative or adjust your order.</li>
        <li>Please give us an accurate name, phone number and delivery address. A working phone number is required so we can reach you about your order.</li>
      </ul>
    ),
  },
  {
    title: 'Payment',
    body: (
      <ul className="list-disc pl-5 space-y-1.5">
        <li>We don't take card payments on this website. Online orders are paid by <strong>bank transfer</strong>.</li>
        <li>Payment details, and your invoice number to use as the payment reference, are shown when you place your order and in your confirmation email (if you gave us an email address).</li>
        <li>Your order stays <strong>Pending</strong> until we've seen your payment come through. We may hold back preparing or releasing an order until it is paid.</li>
        <li>In-store (walk-in) purchases can be paid on the spot, or later in-store or by bank transfer if we've agreed to that with you.</li>
        <li>Pasabuy orders are paid on delivery or pick-up, as described on the Pasabuy section of our homepage.</li>
      </ul>
    ),
  },
  {
    title: 'Delivery and Click & Collect',
    body: (
      <ul className="list-disc pl-5 space-y-1.5">
        <li><strong>Click &amp; Collect:</strong> pick up your order yourself. We'll message you with pickup details.</li>
        <li><strong>Delivery within Dunedin:</strong> flat $5 delivery fee, added to your total at checkout.</li>
        <li><strong>Delivery outside Dunedin:</strong> the fee depends on distance. We'll contact you to arrange delivery and confirm the final total <em>before</em> you pay.</li>
        <li>Delivery times are estimates, not guarantees. We'll keep you updated if something changes.</li>
      </ul>
    ),
  },
  {
    title: 'Pasabuy orders',
    body: (
      <ul className="list-disc pl-5 space-y-1.5">
        <li>Pasabuy items are bought in the Philippines specifically for you and shipped to New Zealand, so they depend on availability there.</li>
        <li>If an item becomes unavailable, we'll contact you about a suitable alternative.</li>
        <li>Arrival dates are estimates only. Shipping schedules, customs clearance and MPI processing can cause delays.</li>
        <li>Our Pasabuy prices include product cost, freight and expected import/clearance costs. If an unexpected charge affects your order, we'll contact you before proceeding.</li>
        <li>Because we purchase items specifically for each customer, <strong>a submitted Pasabuy order may not be cancellable</strong>. Please check your order carefully before submitting.</li>
      </ul>
    ),
  },
  {
    title: 'Cancellations, damaged items and returns',
    body: (
      <ul className="list-disc pl-5 space-y-1.5">
        <li>Want to cancel a regular order? Contact us as soon as possible, before it has been prepared or delivered, and we'll do our best to help.</li>
        <li>If an item arrives damaged, incorrect or past its best-before date, contact us promptly (photos help) and we'll make it right with a replacement, credit or refund.</li>
        <li>For food safety reasons we generally can't accept returns of opened or unwanted food products.</li>
        <li>Nothing in these terms limits your rights under New Zealand's Consumer Guarantees Act.</li>
      </ul>
    ),
  },
  {
    title: 'Product information',
    body: (
      <p>
        Many of our products are imported. Photos are for illustration and packaging or labelling may
        differ from what's shown. Please read the label on the product for ingredients, allergens and
        best-before dates. If you have an allergy or dietary requirement, check the packaging or ask us
        before ordering.
      </p>
    ),
  },
  {
    title: 'Your information',
    body: (
      <ul className="list-disc pl-5 space-y-1.5">
        <li>We collect your name, phone number, delivery address and (optionally) email only to process and deliver your order, and to contact you about it.</li>
        <li>If you subscribe to our newsletter, we use your email to send you updates. Contact us any time to be removed.</li>
        <li>We don't sell your information. We only share what's needed to fulfil your order (for example, with a courier).</li>
        <li>We handle personal information in line with New Zealand's Privacy Act 2020. You can ask to see or correct the information we hold about you by contacting us.</li>
      </ul>
    ),
  },
  {
    title: 'Liability',
    body: (
      <p>
        We take care to keep this website and our product information accurate, but we can't promise
        it is always error-free or available. To the extent the law allows, we're not liable for
        indirect or consequential losses, and our liability for any order is limited to the amount you
        paid for it.
      </p>
    ),
  },
  {
    title: 'Changes and governing law',
    body: (
      <p>
        We may update these terms from time to time. The version on this page applies at the time you
        order. These terms are governed by New Zealand law.
      </p>
    ),
  },
];

export function TermsPage() {
  useDocumentTitle('Terms & Conditions');

  return (
    <div className="min-h-screen bg-white">
      <div className="pt-16 pb-10">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-3 text-[#3E2723]">Terms &amp; Conditions</h1>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            The simple rules for shopping with PinoyPantry.
          </p>
          <p className="text-xs text-gray-400 mt-2">Last updated: 22 September 2026</p>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-20">
        <div className="max-w-3xl mx-auto space-y-6">
          {SECTIONS.map((s, i) => (
            <section key={s.title} className="bg-gray-50 border border-gray-200 rounded-xl p-6">
              <h2 className="text-lg font-bold text-[#3E2723] mb-2">{i + 1}. {s.title}</h2>
              <div className="text-sm text-gray-600 leading-relaxed">{s.body}</div>
            </section>
          ))}

          <p className="text-center text-sm text-gray-500 pt-4">
            Questions? Check our <Link to="/faq" className="text-[#D32F2F] hover:underline">FAQ</Link> or{' '}
            <Link to="/contact" className="text-[#D32F2F] hover:underline">contact us</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
