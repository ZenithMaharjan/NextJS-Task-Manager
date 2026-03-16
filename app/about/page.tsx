import FAQItem from "./_components/FAQItem";

const FAQ_DATA = [
  {
    question: "What is Coccos?",
    answer:
      "Coccos is a platform designed to help you manage and organize your digital content efficiently. We provide tools and services to streamline your workflow and enhance productivity.",
  },
  {
    question: "How do I get started?",
    answer:
      "Getting started is easy! Simply sign up for an account, complete your profile, and you'll have access to all our features. Check out our documentation for detailed guides and tutorials.",
  },
  {
    question: "What support options are available?",
    answer:
      "We offer multiple support channels including email support, live chat during business hours, and comprehensive documentation. Premium users get priority support with faster response times.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Yes, we take security seriously. All data is encrypted in transit and at rest. We use industry-standard security protocols and regularly audit our systems to ensure your information stays safe.",
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer:
      "Absolutely! You can cancel your subscription at any time from your account settings. You'll continue to have access until the end of your billing period, and no further charges will be made.",
  },
  {
    question: "Do you offer refunds?",
    answer:
      "We offer a 30-day money-back guarantee for all new subscriptions. If you're not satisfied within the first 30 days, contact our support team for a full refund.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-3xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
          <p className="text-lg text-gray-600">
            Find answers to common questions about our platform
          </p>
        </header>

        <section className="space-y-4" aria-label="FAQ List">
          {FAQ_DATA.map((faq, index) => (
            <FAQItem key={`faq-${index}`} question={faq.question} answer={faq.answer} />
          ))}
        </section>

        <footer className="mt-12 text-center">
          <p className="text-gray-600 mb-4">Still have questions?</p>
          <a
            href="mailto:support@coccos.pages.dev"
            className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg"
          >
            Contact Support
          </a>
        </footer>
      </div>
    </div>
  );
}
