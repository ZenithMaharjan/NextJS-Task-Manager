"use client";

import { HelpCircle, Mail } from "lucide-react";
import Link from "next/link";

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
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
      <div className="p-8 max-w-4xl mx-auto space-y-12">
        <header className="relative flex flex-col items-center text-center space-y-4 pt-8">
          <div className="absolute top-0 right-0"></div>

          <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl text-indigo-600 dark:text-indigo-400 mb-2">
            <HelpCircle size={32} />
          </div>

          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 dark:text-white">
            Frequently Asked
            <span className="bg-linear-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
              Questions
            </span>
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl">
            Everything you need to know about Coccos platform. Can&apos;t find the answer
            you&apos;re looking for? Reach out to our team.
          </p>
        </header>

        <section className="space-y-4 max-w-3xl mx-auto" aria-label="FAQ List">
          {FAQ_DATA.map((faq, index) => (
            <FAQItem key={`faq-${index}`} question={faq.question} answer={faq.answer} />
          ))}
        </section>

        <footer className="pt-12 pb-20 text-center">
          <div className="inline-flex flex-col items-center p-8 rounded-3xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 w-full max-w-2xl shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Still have questions?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
              We&apos;re here to help! Our support team typically responds within a few hours.
            </p>
            <Link
              href="mailto:support@coccos.pages.dev"
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-600/20 active:scale-95 group"
            >
              <Mail className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              Contact Support
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
