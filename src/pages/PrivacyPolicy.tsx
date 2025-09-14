import React from 'react';
import { Shield, Eye, Lock, UserCheck, Globe, Mail } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-gray-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-4 mb-6">
            <Shield className="h-12 w-12 text-blue-400" />
            <div>
              <h1 className="text-4xl font-bold">Privacy Policy</h1>
              <p className="text-gray-300 mt-2">Last updated: January 28, 2025</p>
            </div>
          </div>
          <p className="text-xl text-gray-200 leading-relaxed">
            Your privacy is critically important to us. This policy explains how we collect, use, and protect your information.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            {/* Quick Overview */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 mb-12">
              <h2 className="text-2xl font-bold text-blue-900 mb-4 flex items-center">
                <Eye className="h-6 w-6 mr-3" />
                Quick Overview
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <span>We collect information you provide and usage data to improve our service</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <span>We never sell your personal information to third parties</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <span>You have full control over your data and privacy settings</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <span>We use industry-standard security measures to protect your data</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <span>We comply with GDPR, CCPA, and other privacy regulations</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <span>Contact us anytime with privacy questions or concerns</span>
                  </div>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <UserCheck className="h-6 w-6 mr-3 text-blue-600" />
              Information We Collect
            </h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Personal Information</h3>
            <p className="text-gray-700 mb-4">
              When you create an account, make a purchase, or contact us, we may collect:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
              <li>Name, email address, phone number</li>
              <li>Billing and shipping addresses</li>
              <li>Payment information (processed securely by our payment partners)</li>
              <li>Account preferences and settings</li>
              <li>Communications with our support team</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Usage Information</h3>
            <p className="text-gray-700 mb-4">
              We automatically collect certain information about how you use our platform:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
              <li>Pages visited, time spent, and click patterns</li>
              <li>Device information (browser, operating system, IP address)</li>
              <li>Search queries and product interactions</li>
              <li>Shopping cart and purchase history</li>
              <li>Marketing campaign interactions</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center mt-12">
              <Lock className="h-6 w-6 mr-3 text-blue-600" />
              How We Use Your Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Delivery</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Process orders and payments</li>
                  <li>• Provide customer support</li>
                  <li>• Send transaction confirmations</li>
                  <li>• Manage your account and preferences</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Improvement</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Personalize your shopping experience</li>
                  <li>• Improve our website and services</li>
                  <li>• Analyze usage patterns and trends</li>
                  <li>• Develop new features and functionality</li>
                </ul>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center mt-12">
              <Globe className="h-6 w-6 mr-3 text-blue-600" />
              Information Sharing
            </h2>
            
            <p className="text-gray-700 mb-6">
              We do not sell, trade, or rent your personal information to third parties. We may share your information only in these limited circumstances:
            </p>
            
            <div className="bg-gray-50 rounded-xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">When We Share Information</h3>
              <ul className="space-y-3 text-gray-700">
                <li>• <strong>With vendors:</strong> Order details necessary for fulfillment (name, shipping address)</li>
                <li>• <strong>Service providers:</strong> Payment processors, shipping companies, and analytics partners</li>
                <li>• <strong>Legal requirements:</strong> When required by law, court order, or to protect our rights</li>
                <li>• <strong>Business transfers:</strong> In case of merger, acquisition, or sale of our company</li>
              </ul>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center mt-12">
              <Shield className="h-6 w-6 mr-3 text-blue-600" />
              Data Security
            </h2>
            
            <p className="text-gray-700 mb-6">
              We implement comprehensive security measures to protect your personal information:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <h4 className="font-semibold text-green-900 mb-3">Technical Safeguards</h4>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• SSL/TLS encryption for all data transmission</li>
                  <li>• Encrypted database storage</li>
                  <li>• Regular security audits and penetration testing</li>
                  <li>• Two-factor authentication options</li>
                </ul>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                <h4 className="font-semibold text-purple-900 mb-3">Operational Safeguards</h4>
                <ul className="text-sm text-purple-800 space-y-1">
                  <li>• Access controls and employee training</li>
                  <li>• Regular backups and disaster recovery</li>
                  <li>• Incident response procedures</li>
                  <li>• Privacy by design principles</li>
                </ul>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center mt-12">
              <UserCheck className="h-6 w-6 mr-3 text-blue-600" />
              Your Rights
            </h2>
            
            <p className="text-gray-700 mb-6">
              You have the following rights regarding your personal information:
            </p>
            
            <div className="bg-gray-50 rounded-xl p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Access & Control</h4>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li>• View and download your data</li>
                    <li>• Update your account information</li>
                    <li>• Delete your account and data</li>
                    <li>• Opt out of marketing communications</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Privacy Controls</h4>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li>• Manage cookie preferences</li>
                    <li>• Control data sharing settings</li>
                    <li>• Request data portability</li>
                    <li>• Lodge complaints with supervisory authorities</li>
                  </ul>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center mt-12">
              <Mail className="h-6 w-6 mr-3 text-blue-600" />
              Contact Us
            </h2>
            
            <p className="text-gray-700 mb-6">
              If you have any questions about this Privacy Policy or our data practices, please contact us:
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-blue-900 mb-3">Privacy Team</h4>
                  <div className="space-y-2 text-blue-800">
                    <p>Email: privacy@samoku.com</p>
                    <p>Phone: +1 (608) 384-2859</p>
                    <p>Response time: Within 48 hours</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-900 mb-3">Mailing Address</h4>
                  <div className="text-blue-800">
                    <p>Samoku Marketplace Inc.</p>
                    <p>Privacy Department</p>
                    <p>123 Commerce Street</p>
                    <p>Madison, WI 53703</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12 p-6 bg-yellow-50 border border-yellow-200 rounded-xl">
              <h3 className="text-lg font-semibold text-yellow-900 mb-3">Updates to This Policy</h3>
              <p className="text-yellow-800 text-sm">
                We may update this Privacy Policy from time to time. We will notify you of any material changes 
                by posting the new policy on this page and updating the "Last updated" date. We encourage you to 
                review this policy periodically to stay informed about how we protect your information.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicy;