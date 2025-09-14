import React, { useState } from 'react';
import { Search, ChevronDown, ChevronRight, MessageSquare, Book, Package, CreditCard, User, Truck } from 'lucide-react';

const HelpCenter: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const faqCategories = [
    {
      id: 'orders',
      title: 'Orders & Shipping',
      icon: Package,
      color: 'bg-blue-50 text-blue-600',
      questions: [
        {
          q: 'How can I track my order?',
          a: 'You can track your order by logging into your account and visiting the "Orders" section. You\'ll receive tracking information via email once your order ships.'
        },
        {
          q: 'What are your shipping options?',
          a: 'We offer standard shipping (5-7 business days), expedited shipping (2-3 business days), and express shipping (1-2 business days). Free shipping is available on orders over $50.'
        },
        {
          q: 'Can I change or cancel my order?',
          a: 'Orders can be modified or cancelled within 1 hour of placement. After this window, please contact our support team for assistance.'
        },
        {
          q: 'Do you ship internationally?',
          a: 'Yes, we ship to over 190 countries worldwide. International shipping costs and delivery times vary by destination.'
        }
      ]
    },
    {
      id: 'returns',
      title: 'Returns & Refunds',
      icon: Truck,
      color: 'bg-green-50 text-green-600',
      questions: [
        {
          q: 'What is your return policy?',
          a: 'We offer a 30-day return window for most items. Products must be unused and in original packaging. Some restrictions apply to custom or perishable items.'
        },
        {
          q: 'How do I return an item?',
          a: 'Initiate a return through your account dashboard or contact support. We\'ll provide a prepaid return label for eligible items.'
        },
        {
          q: 'When will I receive my refund?',
          a: 'Refunds are processed within 5-7 business days after we receive your returned item. The refund will be credited to your original payment method.'
        },
        {
          q: 'Who pays for return shipping?',
          a: 'Return shipping is free for defective or incorrect items. For other returns, customers are responsible for return shipping costs.'
        }
      ]
    },
    {
      id: 'payments',
      title: 'Payments & Billing',
      icon: CreditCard,
      color: 'bg-purple-50 text-purple-600',
      questions: [
        {
          q: 'What payment methods do you accept?',
          a: 'We accept all major credit cards (Visa, Mastercard, American Express, Discover), PayPal, Apple Pay, Google Pay, and bank transfers.'
        },
        {
          q: 'Is my payment information secure?',
          a: 'Yes, all payment information is encrypted and processed through PCI-compliant payment processors. We never store your credit card details on our servers.'
        },
        {
          q: 'Can I use multiple payment methods for one order?',
          a: 'Currently, each order must be paid with a single payment method. You can use gift cards or store credit in combination with other payment methods.'
        },
        {
          q: 'Why was my payment declined?',
          a: 'Payment declines can occur due to insufficient funds, incorrect billing information, or bank security measures. Please verify your details and try again.'
        }
      ]
    },
    {
      id: 'account',
      title: 'Account & Profile',
      icon: User,
      color: 'bg-orange-50 text-orange-600',
      questions: [
        {
          q: 'How do I create an account?',
          a: 'Click "Register" in the top navigation, provide your email and basic information, and verify your email address to activate your account.'
        },
        {
          q: 'I forgot my password. How do I reset it?',
          a: 'Click "Forgot Password" on the login page, enter your email address, and follow the instructions in the reset email we send you.'
        },
        {
          q: 'How do I update my profile information?',
          a: 'Log into your account, go to "Profile Settings," and update your personal information, addresses, and preferences.'
        },
        {
          q: 'Can I delete my account?',
          a: 'Yes, you can delete your account from the Profile Settings page. This action is permanent and cannot be undone.'
        }
      ]
    }
  ];

  const filteredFAQs = faqCategories.map(category => ({
    ...category,
    questions: category.questions.filter(
      qa => 
        qa.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        qa.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => 
    searchQuery === '' || 
    category.questions.length > 0 ||
    category.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Help Center</h1>
          <p className="text-xl text-blue-100 mb-8">
            Find answers to common questions and get the help you need
          </p>

          {/* Search */}
          <div className="relative max-w-2xl mx-auto">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search help articles..."
              className="w-full px-6 py-4 pr-14 text-lg border-0 rounded-2xl text-gray-900 placeholder-gray-500 focus:ring-4 focus:ring-white/20"
            />
            <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { title: 'Track Order', icon: Package, href: '/track-order', color: 'bg-blue-600' },
              { title: 'Start Return', icon: Truck, href: '/returns', color: 'bg-green-600' },
              { title: 'Contact Support', icon: MessageSquare, href: '/contact', color: 'bg-purple-600' },
              { title: 'Vendor Help', icon: User, href: '/vendor-center', color: 'bg-orange-600' }
            ].map((action) => {
              const Icon = action.icon;
              return (
                <a
                  key={action.title}
                  href={action.href}
                  className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow text-center group"
                >
                  <div className={`${action.color} w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900">{action.title}</h3>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Frequently Asked Questions
          </h2>

          <div className="space-y-8">
            {filteredFAQs.map((category) => {
              const Icon = category.icon;
              return (
                <div key={category.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                  <button
                    onClick={() => setExpandedSection(
                      expandedSection === category.id ? null : category.id
                    )}
                    className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`${category.color} p-3 rounded-lg`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{category.title}</h3>
                        <p className="text-gray-600">{category.questions.length} articles</p>
                      </div>
                    </div>
                    {expandedSection === category.id ? (
                      <ChevronDown className="h-6 w-6 text-gray-400" />
                    ) : (
                      <ChevronRight className="h-6 w-6 text-gray-400" />
                    )}
                  </button>

                  {expandedSection === category.id && (
                    <div className="border-t border-gray-200 bg-gray-50">
                      <div className="p-6 space-y-6">
                        {category.questions.map((qa, index) => (
                          <div key={index} className="bg-white rounded-lg p-6 border border-gray-200">
                            <h4 className="font-semibold text-gray-900 mb-3">{qa.q}</h4>
                            <p className="text-gray-700 leading-relaxed">{qa.a}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Still Need Help */}
          <div className="mt-16 text-center">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-8">
              <h3 className="text-2xl font-bold mb-4">Still Need Help?</h3>
              <p className="text-blue-100 mb-6">
                Can't find what you're looking for? Our support team is here to help.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/contact"
                  className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Contact Support
                </a>
                <button className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
                  Start Live Chat
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HelpCenter;