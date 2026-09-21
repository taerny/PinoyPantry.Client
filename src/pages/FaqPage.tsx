import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';

const FAQS: { group: string; items: { q: string; a: React.ReactNode }[] }[] = [
  {
    group: 'Ordering & Payment',
    items: [
      {
        q: 'How do I place an order?',
        a: 'Add items to your cart, go to checkout, fill in your details and choose a delivery method. Your order is placed straight away, with no online payment needed at that point.',
      },
      {
        q: 'How do I pay?',
        a: "By bank transfer. After you place your order, the bank details and your invoice number (use it as the payment reference) are shown on screen and emailed to you if you gave an email. We'll mark your order as paid once we see the payment.",
      },
      {
        q: "I didn't give an email. How will I get my invoice?",
        a: "Email is optional. The bank details are shown right after you order, and we'll contact you by phone. You can also message us if you'd like your invoice sent another way.",
      },
      {
        q: 'Do you take card payments?',
        a: "Not on the website at the moment. Online orders are paid by bank transfer. In-store, ask us about payment options.",
      },
      {
        q: 'Can I change or cancel my order?',
        a: (
          <>
            Contact us as soon as possible, before your order is prepared or delivered, and we'll do our
            best to help. Pasabuy orders usually can't be cancelled once submitted.
          </>
        ),
      },
    ],
  },
  {
    group: 'Delivery & Pickup',
    items: [
      {
        q: 'What delivery options do you have?',
        a: 'Click & Collect (pick up yourself), delivery within Dunedin for a flat $5, and delivery outside Dunedin, where the fee depends on distance.',
      },
      {
        q: 'How much is delivery outside Dunedin?',
        a: "It depends on where you are. After you order, we'll contact you to arrange delivery and confirm the final total before you pay.",
      },
      {
        q: 'Where and when can I collect my order?',
        a: "We'll message you with pickup details once your order is ready.",
      },
      {
        q: 'How long will my order take?',
        a: "We'll be in touch after you order to confirm timing. Delivery times are estimates and may change with stock and courier availability.",
      },
    ],
  },
  {
    group: 'Products',
    items: [
      {
        q: 'Are your products authentic?',
        a: 'Yes. We specialise in Filipino groceries: canned goods, snacks, instant noodles, condiments, beverages, dried fish and more.',
      },
      {
        q: 'What does "Limited Stock" mean?',
        a: "There are only a few left. Once they're gone, the item shows as sold out until we restock.",
      },
      {
        q: 'What about allergens and best-before dates?',
        a: 'Many products are imported and labelling may differ from photos on our site. Please check the label, or ask us if you have allergies or dietary needs.',
      },
      {
        q: "An item I want is sold out. Can you get it?",
        a: (
          <>
            Maybe! Send us a message via the <Link to="/contact" className="text-[#D32F2F] hover:underline">contact page</Link> or
            try our Pasabuy service below.
          </>
        ),
      },
    ],
  },
  {
    group: 'Pasabuy',
    items: [
      {
        q: 'What is Pasabuy?',
        a: "Pasabuy means \"please buy for me.\" You send us the Filipino items you're missing, we buy them in the Philippines, ship them to New Zealand and let you know once they arrive in Dunedin.",
      },
      {
        q: 'How does Pasabuy pricing work?',
        a: "Prices include product cost, international freight and expected import/clearance costs. If an unexpected charge comes up (e.g. an inspection cost), we'll contact you before going ahead.",
      },
      {
        q: 'When will my Pasabuy order arrive?',
        a: 'Each shipment has an order cut-off and an estimated arrival date on our homepage. The arrival date is an estimate only: shipping, customs and MPI processing can cause delays.',
      },
      {
        q: "What if an item isn't available in the Philippines?",
        a: "We'll contact you about a suitable alternative.",
      },
      {
        q: 'When do I pay for Pasabuy?',
        a: 'Payment is on delivery or pick-up.',
      },
    ],
  },
  {
    group: 'Problems & Returns',
    items: [
      {
        q: 'My item arrived damaged or wrong. What now?',
        a: "Contact us as soon as you can, with a photo if possible, and we'll make it right with a replacement, credit or refund.",
      },
      {
        q: 'Can I return food I no longer want?',
        a: "For food safety reasons we generally can't accept returns of opened or unwanted food. Your rights under the Consumer Guarantees Act aren't affected.",
      },
    ],
  },
];

export function FaqPage() {
  useDocumentTitle('FAQ');

  return (
    <div className="min-h-screen bg-white">
      <div className="pt-16 pb-10">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-3 text-[#3E2723]">Frequently Asked Questions</h1>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Quick answers about ordering, payment, delivery and Pasabuy.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-20">
        <div className="max-w-3xl mx-auto space-y-8">
          {FAQS.map(group => (
            <section key={group.group}>
              <h2 className="text-xl font-bold text-[#3E2723] mb-3">{group.group}</h2>
              <Accordion type="single" collapsible className="bg-gray-50 border border-gray-200 rounded-xl px-5">
                {group.items.map((item, i) => (
                  <AccordionItem key={i} value={`${group.group}-${i}`}>
                    <AccordionTrigger className="text-left text-[#3E2723] font-medium">{item.q}</AccordionTrigger>
                    <AccordionContent className="text-sm text-gray-600 leading-relaxed">{item.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
          ))}

          <p className="text-center text-sm text-gray-500 pt-4">
            Still have a question?{' '}
            <Link to="/contact" className="text-[#D32F2F] hover:underline">Send us a message</Link>. See also our{' '}
            <Link to="/terms" className="text-[#D32F2F] hover:underline">Terms &amp; Conditions</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
