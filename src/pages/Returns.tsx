import React, { useState } from 'react';
import { RotateCcw, Clock, CheckCircle, Package, AlertCircle, ArrowRight } from 'lucide-react';

const Returns: React.FC = () => {
  const [returnForm, setReturnForm] = useState({
    orderNumber: '',
    email: '',
    reason: '',
    itemId: '',
    additionalInfo: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setReturnForm({
      ...returnForm,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle return request submission
    console.log('Return request submitted:', returnForm);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <RotateCcw className="h-16 w-16 text-white mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Returns & Exchanges</h1>
          <p className="text-xl text-green-100">
            Easy returns and exchanges with our hassle-free process
          </p>
        </div>
      </section>

      {/* Return Process */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">How Returns Work</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
            {[
              {
                step: '1',
                title: 'Request Return',
                description: 'Fill out our return form or contact support',
                icon: Package,
                color: 'bg-blue-500'
              },
              {
                step: '2',
                title: 'Get Return Label',
                description: 'We email you a prepaid return shipping label',
                icon: RotateCcw,
                color: 'bg-green-500'
              },
              {
                step: '3',
                title: 'Ship Item Back',
                description: 'Package the item and drop it off at any shipping location',
                icon: Package,
                color: 'bg-orange-500'
              },
              {
                step: '4',
                title: 'Receive Refund',
                description: 'Get your refund within 5-7 business days',
                icon: CheckCircle,
                color: 'bg-purple-500'
              }
            ].map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.step} className="text-center">
                  <div className={`${step.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-2">Step {step.step}</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              );
            })}
          </div>

          {/* Return Policy Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            <div className="bg-green-50 border border-green-200 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-green-900 mb-6">What Can Be Returned</h3>
              <ul className="space-y-3 text-green-800">
                <li className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Items in original, unused condition</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Products with original packaging and tags</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Returns initiated within 30 days</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Defective or damaged items</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Items that don't match description</span>
                </li>
              </ul>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-red-900 mb-6">Return Restrictions</h3>
              <ul className="space-y-3 text-red-800">
                <li className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <span>Personalized or custom items</span>
                </li>
                <li className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <span>Perishable goods (food, flowers)</span>
                </li>
                <li className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <span>Hygiene products (cosmetics, underwear)</span>
                </li>
                <li className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <span>Digital downloads and software</span>
                </li>
                <li className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <span>Items returned after 30 days</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Return Request Form */}
          <div className="bg-white border border-gray-200 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-8">Start a Return Request</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Order Number *
                  </label>
                  <input
                    type="text"
                    name="orderNumber"
                    required
                    value={returnForm.orderNumber}
                    onChange={handleChange}
                    placeholder="ORD-12345678"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={returnForm.email}
                    onChange={handleChange}
                    placeholder="your.email@example.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Return *
                </label>
                <select
                  name="reason"
                  required
                  value={returnForm.reason}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a reason</option>
                  <option value="defective">Item is defective</option>
                  <option value="wrong-item">Received wrong item</option>
                  <option value="not-as-described">Item not as described</option>
                  <option value="size-issue">Size/fit issue</option>
                  <option value="quality-issue">Quality not as expected</option>
                  <option value="changed-mind">Changed my mind</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Information
                </label>
                <textarea
                  name="additionalInfo"
                  rows={4}
                  value={returnForm.additionalInfo}
                  onChange={handleChange}
                  placeholder="Please provide any additional details about your return request..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <span>Submit Return Request</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Refund Timeline */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Refund Timeline</h2>
          
          <div className="space-y-6">
            {[
              {
                title: 'Return Approved',
                time: 'Same day',
                description: 'We review your return request and send approval email with return label'
              },
              {
                title: 'Item Shipped Back',
                time: '1-3 days',
                description: 'You ship the item back to us using the provided return label'
              },
              {
                title: 'Item Received',
                time: '3-7 days',
                description: 'We receive and inspect your returned item'
              },
              {
                title: 'Refund Processed',
                time: '5-7 business days',
                description: 'Refund is issued to your original payment method'
              }
            ].map((stage, index) => (
              <div key={stage.title} className="flex items-start space-x-4">
                <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1 bg-white rounded-lg p-6 border border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{stage.title}</h3>
                      <p className="text-gray-600">{stage.description}</p>
                    </div>
                    <div className="text-sm font-medium text-blue-600 mt-2 sm:mt-0">
                      {stage.time}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Returns;