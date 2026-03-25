import { useState } from 'react';
import { Mail, MapPin, Phone, Send, CheckCircle } from 'lucide-react';

export function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitted(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setError('Something went wrong. Please try again.');
      }
    } catch {
      setError('Unable to send message. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF8E1]">
      {/* Hero */}
      <div className="bg-[#3E2723] text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-3">Contact Us</h1>
          <p className="text-white/70 text-lg max-w-xl mx-auto">
            Have a question or want to place a special order? We'd love to hear from you!
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* Info cards */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm flex items-start gap-4">
              <div className="w-11 h-11 bg-[#F9A825]/20 rounded-full flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-[#F9A825]" />
              </div>
              <div>
                <p className="font-semibold text-[#3E2723]">Location</p>
                <p className="text-gray-500 text-sm mt-1">Dunedin, New Zealand</p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm flex items-start gap-4">
              <div className="w-11 h-11 bg-[#F9A825]/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5 text-[#F9A825]" />
              </div>
              <div>
                <p className="font-semibold text-[#3E2723]">Phone</p>
                <p className="text-gray-500 text-sm mt-1">+64 123 456 7890</p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm flex items-start gap-4">
              <div className="w-11 h-11 bg-[#F9A825]/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-[#F9A825]" />
              </div>
              <div>
                <p className="font-semibold text-[#3E2723]">Email</p>
                <p className="text-gray-500 text-sm mt-1">We'll reply as soon as possible</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-8">
            {submitted ? (
              <div className="flex flex-col items-center justify-center h-full py-12 text-center gap-4">
                <CheckCircle className="w-16 h-16 text-green-500" />
                <h2 className="text-2xl font-bold text-[#3E2723]">Message Sent!</h2>
                <p className="text-gray-500 max-w-sm">
                  Thank you for reaching out. We'll get back to you as soon as possible.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-4 px-6 py-2 bg-[#F9A825] text-[#3E2723] font-semibold rounded-lg hover:bg-[#FFB300] transition-colors"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h2 className="text-xl font-bold text-[#3E2723] mb-2">Send us a message</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Juan dela Cruz"
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F9A825] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F9A825] focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <select
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F9A825] focus:border-transparent"
                  >
                    <option value="">Select a subject</option>
                    <option value="Order Enquiry">Order Enquiry</option>
                    <option value="Product Availability">Product Availability</option>
                    <option value="Delivery Question">Delivery Question</option>
                    <option value="Feedback">Feedback</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea
                    name="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Write your message here..."
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F9A825] focus:border-transparent resize-none"
                  />
                </div>

                {error && (
                  <p className="text-red-500 text-sm">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#F9A825] hover:bg-[#FFB300] text-[#3E2723] font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
                >
                  {loading ? (
                    <span>Sending...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
