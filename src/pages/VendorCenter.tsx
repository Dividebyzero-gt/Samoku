import React from 'react';
import { Link } from 'react-router-dom';
import { Store, DollarSign, TrendingUp, Users, Package, Support, BarChart3, Shield, Globe, Award } from 'lucide-react';

const VendorCenter: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Store className="h-20 w-20 text-white mx-auto mb-8" />
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Vendor Center</h1>
            <p className="text-xl md:text-2xl text-purple-100 max-w-3xl mx-auto mb-8">
              Join thousands of successful vendors on Samoku. Start your business journey today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-white text-purple-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
              >
                Start Selling Now
              </Link>
              <a
                href="#vendor-guide"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-purple-600 transition-colors"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Sell on Samoku?
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to build and grow your business
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: 'Access to Millions',
                description: 'Reach over 10 million active customers worldwide',
                color: 'bg-blue-500'
              },
              {
                icon: DollarSign,
                title: 'Low Fees',
                description: 'Competitive 5% commission with no hidden fees',
                color: 'bg-green-500'
              },
              {
                icon: Package,
                title: 'Easy Listing',
                description: 'Simple product upload with bulk import tools',
                color: 'bg-purple-500'
              },
              {
                icon: TrendingUp,
                title: 'Marketing Support',
                description: 'Featured placement and promotional opportunities',
                color: 'bg-orange-500'
              },
              {
                icon: BarChart3,
                title: 'Analytics Dashboard',
                description: 'Detailed insights into sales and customer behavior',
                color: 'bg-indigo-500'
              },
              {
                icon: Support,
                title: '24/7 Support',
                description: 'Dedicated vendor support team always available',
                color: 'bg-red-500'
              }
            ].map(({ icon: Icon, title, description, color }) => (
              <div key={title} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
                <div className={`${color} w-16 h-16 rounded-xl flex items-center justify-center mb-6`}>
                  <Icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{title}</h3>
                <p className="text-gray-600 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Vendor Success Stories
            </h2>
            <p className="text-xl text-gray-600">
              Real vendors, real results
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'TechGear Pro',
                category: 'Electronics',
                revenue: '$150,000',
                period: 'First Year',
                growth: '+340%',
                image: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=400',
                quote: 'Samoku helped us reach customers we never thought possible. The platform is incredibly user-friendly.'
              },
              {
                name: 'Fashion Forward',
                category: 'Fashion',
                revenue: '$89,000',
                period: '6 Months',
                growth: '+250%',
                image: 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=400',
                quote: 'The marketing support and analytics tools have been game-changers for our business growth.'
              },
              {
                name: 'Home Harmony',
                category: 'Home & Garden',
                revenue: '$210,000',
                period: '18 Months',
                growth: '+180%',
                image: 'https://images.pexels.com/photos/4686821/pexels-photo-4686821.jpeg?auto=compress&cs=tinysrgb&w=400',
                quote: 'From startup to six-figure revenue - Samoku made it possible with their excellent platform.'
              }
            ].map((story) => (
              <div key={story.name} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                <img
                  src={story.image}
                  alt={story.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">{story.name}</h3>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      {story.category}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-2xl font-bold text-green-600">{story.revenue}</div>
                      <div className="text-sm text-gray-600">{story.period}</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{story.growth}</div>
                      <div className="text-sm text-gray-600">Revenue Growth</div>
                    </div>
                  </div>
                  <p className="text-gray-600 italic text-sm leading-relaxed">
                    "{story.quote}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Getting Started Guide */}
      <section id="vendor-guide" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How to Get Started
            </h2>
            <p className="text-xl text-gray-600">
              Simple steps to launch your business on Samoku
            </p>
          </div>

          <div className="space-y-8">
            {[
              {
                step: '1',
                title: 'Create Your Vendor Account',
                description: 'Sign up with your business information and complete our vendor application process.',
                details: ['Provide business registration details', 'Upload required documentation', 'Complete identity verification'],
                color: 'bg-blue-500'
              },
              {
                step: '2',
                title: 'Set Up Your Store',
                description: 'Customize your store profile and add your first products to start selling.',
                details: ['Design your store banner and logo', 'Write compelling store description', 'Add your first 5-10 products'],
                color: 'bg-green-500'
              },
              {
                step: '3',
                title: 'Get Approved',
                description: 'Our team reviews your application and store setup for quality standards.',
                details: ['Review typically takes 1-3 business days', 'Quality check on products and store', 'Receive approval notification'],
                color: 'bg-purple-500'
              },
              {
                step: '4',
                title: 'Start Selling',
                description: 'Your store goes live and you can start receiving orders from customers.',
                details: ['Products appear in search results', 'Access to marketing tools', 'Begin earning revenue'],
                color: 'bg-orange-500'
              }
            ].map((step) => (
              <div key={step.step} className="flex flex-col lg:flex-row items-start lg:items-center space-y-6 lg:space-y-0 lg:space-x-8">
                <div className={`${step.color} w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold flex-shrink-0`}>
                  {step.step}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-lg text-gray-600 mb-4">{step.description}</p>
                  <ul className="space-y-2">
                    {step.details.map((detail, index) => (
                      <li key={index} className="flex items-center space-x-3 text-gray-700">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Vendor Requirements
            </h2>
            <p className="text-xl text-gray-600">
              What you need to become a successful Samoku vendor
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-8 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Shield className="h-6 w-6 mr-3 text-green-600" />
                Basic Requirements
              </h3>
              <ul className="space-y-4 text-gray-700">
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                  <span>Valid business registration or tax ID</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                  <span>High-quality product images and descriptions</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                  <span>Ability to fulfill orders within 24-48 hours</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                  <span>Excellent customer service standards</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                  <span>Compliance with all applicable laws and regulations</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Award className="h-6 w-6 mr-3 text-blue-600" />
                What We Provide
              </h3>
              <ul className="space-y-4 text-gray-700">
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <span>Professional storefront with customization options</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <span>Integrated payment processing and order management</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <span>Marketing tools and promotional opportunities</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <span>Detailed analytics and sales reporting</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <span>Dedicated vendor support team</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Commission Structure */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600">
              Simple, fair pricing with no hidden fees
            </p>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-12 text-center">
            <div className="max-w-3xl mx-auto">
              <div className="text-6xl font-bold text-blue-600 mb-4">5%</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Commission Per Sale</h3>
              <p className="text-lg text-gray-600 mb-8">
                That's it! No monthly fees, no listing fees, no setup costs. You only pay when you make a sale.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h4 className="font-bold text-gray-900 mb-2">What's Included</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Payment processing</li>
                    <li>• Order management</li>
                    <li>• Customer support</li>
                    <li>• Marketing tools</li>
                  </ul>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h4 className="font-bold text-gray-900 mb-2">Payout Schedule</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Weekly payouts</li>
                    <li>• Direct bank transfer</li>
                    <li>• Detailed earning reports</li>
                    <li>• Tax documentation</li>
                  </ul>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h4 className="font-bold text-gray-900 mb-2">No Hidden Fees</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• No monthly subscription</li>
                    <li>• No listing fees</li>
                    <li>• No setup costs</li>
                    <li>• No long-term contracts</li>
                  </ul>
                </div>
              </div>

              <Link
                to="/register"
                className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
              >
                <span>Start Selling Today</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Resources */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Vendor Resources
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to succeed
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'Seller Handbook',
                description: 'Complete guide to selling on Samoku',
                icon: '📖',
                link: '#'
              },
              {
                title: 'Product Photography Tips',
                description: 'Create stunning product images that sell',
                icon: '📸',
                link: '#'
              },
              {
                title: 'SEO Best Practices',
                description: 'Optimize your listings for better visibility',
                icon: '🔍',
                link: '#'
              },
              {
                title: 'Marketing Strategies',
                description: 'Proven tactics to boost your sales',
                icon: '📈',
                link: '#'
              },
              {
                title: 'Customer Service Guide',
                description: 'Build lasting customer relationships',
                icon: '💬',
                link: '#'
              },
              {
                title: 'Legal Compliance',
                description: 'Stay compliant with regulations',
                icon: '⚖️',
                link: '#'
              }
            ].map((resource) => (
              <a
                key={resource.title}
                href={resource.link}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-200 group"
              >
                <div className="text-4xl mb-4">{resource.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {resource.title}
                </h3>
                <p className="text-gray-600">{resource.description}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of successful vendors already selling on Samoku
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
            >
              Apply to Become a Vendor
            </Link>
            <a
              href="/contact"
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-colors"
            >
              Speak to Our Team
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default VendorCenter;