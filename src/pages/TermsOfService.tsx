import React from 'react';
import { FileText, Scale, ShieldCheck, AlertCircle, Users, CreditCard } from 'lucide-react';

const TermsOfService: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-gray-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-4 mb-6">
            <FileText className="h-12 w-12 text-blue-400" />
            <div>
              <h1 className="text-4xl font-bold">Terms of Service</h1>
              <p className="text-gray-300 mt-2">Last updated: January 28, 2025</p>
            </div>
          </div>
          <p className="text-xl text-gray-200 leading-relaxed">
            These terms govern your use of Samoku's marketplace platform and services.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            {/* Agreement */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 mb-12">
              <h2 className="text-2xl font-bold text-blue-900 mb-4 flex items-center">
                <Scale className="h-6 w-6 mr-3" />
                Agreement to Terms
              </h2>
              <p className="text-blue-800 mb-4">
                By accessing and using Samoku, you accept and agree to be bound by these Terms of Service. 
                If you do not agree to abide by these terms, you are not authorized to use our platform.
              </p>
              <div className="bg-blue-100 rounded-lg p-4">
                <p className="text-sm text-blue-900 font-medium">
                  ⚠️ Important: These terms constitute a legally binding agreement between you and Samoku Marketplace Inc.
                </p>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Users className="h-6 w-6 mr-3 text-blue-600" />
              User Accounts and Responsibilities
            </h2>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Account Registration</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
              <li>You must provide accurate and complete information when creating an account</li>
              <li>You are responsible for maintaining the security of your account credentials</li>
              <li>You must be at least 18 years old to create an account</li>
              <li>One person may not maintain multiple accounts without our permission</li>
              <li>You must notify us immediately of any unauthorized account access</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Prohibited Activities</h3>
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
              <h4 className="font-semibold text-red-900 mb-3">You may not:</h4>
              <ul className="space-y-2 text-red-800 text-sm">
                <li>• Use our platform for any illegal or unauthorized purpose</li>
                <li>• Violate any laws in your jurisdiction or ours</li>
                <li>• Transmit harmful code, viruses, or malicious software</li>
                <li>• Attempt to gain unauthorized access to our systems</li>
                <li>• Interfere with or disrupt our services</li>
                <li>• Create fake accounts or impersonate others</li>
                <li>• Scrape or harvest user data without permission</li>
                <li>• Engage in fraudulent or deceptive practices</li>
              </ul>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center mt-12">
              <ShieldCheck className="h-6 w-6 mr-3 text-blue-600" />
              Vendor Terms
            </h2>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Vendor Approval Process</h3>
            <p className="text-gray-700 mb-4">
              All vendor applications are subject to review and approval. We reserve the right to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
              <li>Approve or reject vendor applications at our discretion</li>
              <li>Request additional documentation or verification</li>
              <li>Suspend or terminate vendor accounts for policy violations</li>
              <li>Set quality standards and product guidelines</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Product Listings</h3>
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
              <h4 className="font-semibold text-green-900 mb-3">Vendors must ensure:</h4>
              <ul className="space-y-2 text-green-800 text-sm">
                <li>• Accurate product descriptions and pricing</li>
                <li>• High-quality product images</li>
                <li>• Compliance with all applicable laws and regulations</li>
                <li>• Proper inventory management and fulfillment</li>
                <li>• Timely customer service and dispute resolution</li>
                <li>• Adherence to intellectual property rights</li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Commission and Fees</h3>
            <p className="text-gray-700 mb-4">
              Vendors agree to pay commission fees as outlined in their vendor agreement:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
              <li>Standard commission rate: 5% of gross sales</li>
              <li>Commission rates may vary by product category</li>
              <li>Fees are automatically deducted from vendor payouts</li>
              <li>Detailed fee structure available in vendor dashboard</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center mt-12">
              <CreditCard className="h-6 w-6 mr-3 text-blue-600" />
              Payment and Refunds
            </h2>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Payment Processing</h3>
            <p className="text-gray-700 mb-6">
              All payments are processed securely through our certified payment partners. We accept major 
              credit cards, PayPal, and other approved payment methods. Prices are in USD unless otherwise specified.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Refund Policy</h3>
            <div className="bg-gray-50 rounded-xl p-6 mb-8">
              <ul className="space-y-3 text-gray-700">
                <li>• <strong>30-day return window:</strong> Most items can be returned within 30 days</li>
                <li>• <strong>Original condition:</strong> Items must be unused and in original packaging</li>
                <li>• <strong>Return shipping:</strong> Customer responsibility unless item is defective</li>
                <li>• <strong>Processing time:</strong> Refunds processed within 5-7 business days</li>
                <li>• <strong>Exceptions:</strong> Custom, personalized, or perishable items may not be returnable</li>
              </ul>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center mt-12">
              <AlertCircle className="h-6 w-6 mr-3 text-blue-600" />
              Limitation of Liability
            </h2>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 mb-8">
              <p className="text-yellow-900 mb-4">
                <strong>Important Legal Notice:</strong> Our liability is limited to the maximum extent permitted by law.
              </p>
              <ul className="space-y-2 text-yellow-800 text-sm">
                <li>• Samoku is not liable for indirect, incidental, or consequential damages</li>
                <li>• Our total liability shall not exceed the amount paid for the specific transaction</li>
                <li>• We provide our platform "as is" without warranties of any kind</li>
                <li>• Vendors are solely responsible for their products and customer service</li>
              </ul>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-6 mt-12">Intellectual Property</h2>
            <p className="text-gray-700 mb-6">
              All content on Samoku, including but not limited to text, graphics, logos, images, and software, 
              is the property of Samoku or its licensors and is protected by copyright and trademark laws.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-6 mt-12">Changes to Terms</h2>
            <p className="text-gray-700 mb-6">
              We reserve the right to modify these terms at any time. Changes will be effective immediately 
              upon posting to our website. Your continued use of the platform constitutes acceptance of updated terms.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-6 mt-12">Governing Law</h2>
            <p className="text-gray-700 mb-6">
              These terms are governed by the laws of the State of Wisconsin, United States, without regard 
              to conflict of law provisions. Any disputes will be resolved in the courts of Madison, Wisconsin.
            </p>

            {/* Contact */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 mt-12">
              <h3 className="text-xl font-bold text-blue-900 mb-4">Questions About These Terms?</h3>
              <p className="text-blue-800 mb-4">
                If you have any questions about these Terms of Service, please contact our legal team:
              </p>
              <div className="space-y-2 text-blue-800">
                <p>Email: legal@samoku.com</p>
                <p>Phone: +1 (608) 384-2859</p>
                <p>Mail: Legal Department, Samoku Marketplace Inc., 123 Commerce Street, Madison, WI 53703</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TermsOfService;