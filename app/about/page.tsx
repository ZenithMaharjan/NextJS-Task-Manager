"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { FiChevronRight } from "react-icons/fi";

interface AccordionProps {
  title?: string;
  renderHeader?: (props: { isExpanded: boolean }) => React.ReactNode;
  className?: string;
  activeClassName?: string;
  titleClassName?: string;
  isExpandedByDefault?: boolean;
  isExpanded?: boolean;
  children: React.ReactNode;
}

const Accordion: React.FC<AccordionProps> = ({
  isExpandedByDefault = false,
  isExpanded,
  title,
  children,
  className = "",
  activeClassName = "",
  renderHeader,
  titleClassName = "",
}) => {
  const content = useRef<HTMLDivElement>(null);

  const [active, setActive] = useState(isExpandedByDefault);

  useEffect(() => {
    if (isExpanded !== undefined) {
      setActive(isExpanded);
    }
  }, [isExpanded]);

  const [contentHeight, setContentHeight] = useState("0px");

  const toggleAccordion = useCallback(() => {
    if (isExpanded === undefined) {
      setActive((prev) => !prev);
    }
  }, [isExpanded]);

  useEffect(() => {
    if (active && content.current) {
      setContentHeight(`${content.current.scrollHeight}px`);
    } else {
      setContentHeight("0px");
    }
  }, [active, children]);

  return (
    <div className={`${className} ${active ? activeClassName : ""}`}>
      <div className="cursor-pointer" onClick={toggleAccordion}>
        {renderHeader ? (
          renderHeader({ isExpanded: active })
        ) : (
          <div
            className={`flex items-center justify-between ${titleClassName}`}
          >
            {title}
            <FiChevronRight
              className={`w-5 h-5 transition-transform duration-200 ${
                active ? "rotate-90" : ""
              }`}
            />
          </div>
        )}
      </div>
      <div
        ref={content}
        style={{ maxHeight: contentHeight }}
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          active ? "opacity-100" : "opacity-0"
        }`}
      >
        {children}
      </div>
    </div>
  );
};

export default function FAQPage() {
  const faqs = [
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-gray-600">
            Find answers to common questions about our platform
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <Accordion
              key={index}
              title={faq.question}
              className="bg-white rounded-lg shadow-md overflow-hidden"
              activeClassName="shadow-lg"
              titleClassName="font-semibold text-gray-900 text-lg px-6 py-4 hover:bg-gray-50 transition-colors"
            >
              <div className="px-6 pb-4 pt-2">
                <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
              </div>
            </Accordion>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">Still have questions?</p>
          <a
            href="mailto:support@coccos.pages.dev"
            className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}
