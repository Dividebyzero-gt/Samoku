import React from 'react';
import { Truck, Clock, Globe, Package, MapPin, Shield } from 'lucide-react';

const ShippingInfo: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-gradient-to-r from-blue-600 to-green-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Truck className="h-16 w-16 text-white mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Shipping Information</h1>
          <p className="text-xl text-blue-100">
            Fast, reliable, and secure delivery worldwide
          </p>
        </div>
      </section>

      {/* Shipping Options */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Shipping Options</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {[
              {
                name: 'Standard Shipping',
                time: '5-7 Business Days',
                cost: 'Free on orders $50+',
                description: 'Reliable and economical shipping for everyday orders',
                icon: Package,
                color: 'bg-blue-500'
              },
              {
                name: 'Expedited Shipping',
                time: '2-3 Business Days',
                cost: '$9.99',
                description: 'Faster delivery when you need it sooner',
                icon: Clock,
                color: 'bg-orange-500'
              },
              {
                name: 'Express Shipping',
                time: '1-2 Business Days',
                cost: '$19.99',
                description: 'Next-day delivery for urgent orders',
                icon: Truck,
                color: 'bg-red-500'
              }
            ].map((option) => {
              const Icon = option.icon;
              return (
                <div key={option.name} className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow">
                  <div className={`${option.color} w-16 h-16 rounded-xl flex items-center justify-center mb-6`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{option.name}</h3>
                  <p className="text-lg font-semibold text-blue-600 mb-2">{option.time}</p>
                  <p className="text-lg text-gray-900 mb-4">{option.cost}</p>
                  <p className="text-gray-600">{option.description}</p>
                </div>
              );
            })}
          </div>

          {/* Shipping Zones */}
          <div className="bg-gray-50 rounded-2xl p-8 mb-16">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
              <Globe className="h-6 w-6 mr-3 text-blue-600" />
              Shipping Zones & Delivery Times
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Zone</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Countries</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Standard</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Expedited</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Express</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  <tr className="border-b border-gray-100">
                    <td className="py-4 px-4 font-medium">Zone 1</td>
                    <td className="py-4 px-4">United States, Canada</td>
                    <td className="py-4 px-4">3-5 days</td>
                    <td className="py-4 px-4">2-3 days</td>
                    <td className="py-4 px-4">1-2 days</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-4 px-4 font-medium">Zone 2</td>
                    <td className="py-4 px-4">Europe, UK, Australia</td>
                    <td className="py-4 px-4">5-8 days</td>
                    <td className="py-4 px-4">3-5 days</td>
                    <td className="py-4 px-4">2-3 days</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-4 px-4 font-medium">Zone 3</td>
                    <td className="py-4 px-4">Asia, South America</td>
                    <td className="py-4 px-4">7-12 days</td>
                    <td className="py-4 px-4">5-8 days</td>
                    <td className="py-4 px-4">3-5 days</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-4 font-medium">Zone 4</td>
                    <td className="py-4 px-4">Africa, Remote locations</td>
                    <td className="py-4 px-4">10-21 days</td>
                    <td className="py-4 px-4">7-14 days</td>
                    <td className="py-4 px-4">5-10 days</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Special Shipping Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white border border-gray-200 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <MapPin className="h-6 w-6 mr-3 text-blue-600" />
                Shipping Policies
              </h3>
              <div className="space-y-4 text-gray-700">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Free Shipping Threshold</h4>
                  <p>Enjoy free standard shipping on all orders over $50 within the United States and Canada.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Processing Time</h4>
                  <p>Most orders are processed within 1-2 business days. Custom or made-to-order items may take 3-5 business days.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Weekend & Holiday Shipping</h4>
                  <p>Orders placed on weekends or holidays will be processed on the next business day.</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Shield className="h-6 w-6 mr-3 text-green-600" />
                Shipping Protection
              </h3>
              <div className="space-y-4 text-gray-700">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Package Insurance</h4>
                  <p>All shipments are automatically insured up to $100. Additional insurance available for high-value items.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Lost Package Policy</h4>
                  <p>If your package is lost during transit, we'll replace it at no additional cost or provide a full refund.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Delivery Confirmation</h4>
                  <p>Signature confirmation required for orders over $200 to ensure secure delivery.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* International Shipping */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">International Shipping</h2>
          
          <div className="bg-white rounded-2xl p-8 border border-gray-200">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6">Important Information</h3>
                <div className="space-y-4 text-gray-700">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Customs & Duties</h4>
                    <p>International customers are responsible for any customs duties, taxes, or fees imposed by their country.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Customs Declaration</h4>
                    <p>We accurately declare all package contents and values as required by international shipping regulations.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Restricted Items</h4>
                    <p>Some products cannot be shipped to certain countries due to local regulations. Restrictions are noted on product pages.</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6">Tracking & Support</h3>
                <div className="space-y-4 text-gray-700">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">International Tracking</h4>
                    <p>All international shipments include tracking numbers that work with local postal services.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Customer Support</h4>
                    <p>Our international support team is available in multiple languages to assist with shipping questions.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Currency</h4>
                    <p>All prices are displayed in USD. Your bank or payment provider may apply currency conversion fees.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-blue-900 mb-4">Have Shipping Questions?</h3>
            <p className="text-blue-800 mb-6">
              Our shipping experts are here to help with any questions about delivery options, tracking, or international shipping.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Contact Shipping Support
              </a>
              <a
                href="/track-order"
                className="border-2 border-blue-600 text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 hover:text-white transition-colors"
              >
                Track Your Order
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ShippingInfo;