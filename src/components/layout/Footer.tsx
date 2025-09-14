import React from 'react';
import { Link } from 'react-router-dom';
import { Store, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube, Linkedin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      {/* Newsletter Signup */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-4">Stay Updated with Samoku</h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Get the latest deals, new arrivals, and exclusive offers delivered to your inbox
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-6 py-3 rounded-lg border-0 focus:ring-4 focus:ring-white/20 text-gray-900 placeholder-gray-500"
              />
              <button
                type="submit"
                className="bg-yellow-400 text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition-colors whitespace-nowrap"
              >
                Subscribe Now
              </button>
            </form>
            <p className="text-xs text-blue-200 mt-3">
              Join 500,000+ subscribers • No spam, unsubscribe anytime
            </p>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center space-x-3 mb-6">
              <Store className="h-10 w-10 text-blue-400" />
              <span className="text-3xl font-bold">Samoku</span>
            </Link>
            <p className="text-gray-300 mb-6 max-w-md leading-relaxed">
              Your premium multivendor marketplace connecting millions of customers with trusted sellers worldwide. 
              Discover quality products, competitive prices, and exceptional service.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-gray-300">
                <Mail className="h-5 w-5 text-blue-400" />
                <a href="mailto:support@samoku.com" className="hover:text-white transition-colors">
                  support@samoku.com
                </a>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <Phone className="h-5 w-5 text-blue-400" />
                <a href="tel:+16083842859" className="hover:text-white transition-colors">
                  +1 (608) 384-2859
                </a>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <MapPin className="h-5 w-5 text-blue-400" />
                <span>Madison, WI, United States</span>
              </div>
            </div>

            {/* Social Media */}
            <div className="mt-8">
              <h4 className="text-lg font-semibold mb-4">Follow Us</h4>
              <div className="flex space-x-4">
                {[
                  { icon: Facebook, href: '#', label: 'Facebook' },
                  { icon: Twitter, href: '#', label: 'Twitter' },
                  { icon: Instagram, href: '#', label: 'Instagram' },
                  { icon: Youtube, href: '#', label: 'YouTube' },
                  { icon: Linkedin, href: '#', label: 'LinkedIn' }
                ].map(({ icon: Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    className="bg-gray-800 p-3 rounded-lg hover:bg-gray-700 transition-colors group"
                    aria-label={label}
                  >
                    <Icon className="h-5 w-5 text-gray-400 group-hover:text-white transition-colors" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Customer Service</h3>
            <ul className="space-y-4">
              <li>
                <Link to="/help" className="text-gray-300 hover:text-white transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="text-gray-300 hover:text-white transition-colors">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link to="/returns" className="text-gray-300 hover:text-white transition-colors">
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link to="/size-guide" className="text-gray-300 hover:text-white transition-colors">
                  Size Guide
                </Link>
              </li>
              <li>
                <Link to="/track-order" className="text-gray-300 hover:text-white transition-colors">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link to="/warranty" className="text-gray-300 hover:text-white transition-colors">
                  Warranty
                </Link>
              </li>
            </ul>
          </div>

          {/* Shopping */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Shopping</h3>
            <ul className="space-y-4">
              <li>
                <Link to="/products" className="text-gray-300 hover:text-white transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/products?category=electronics" className="text-gray-300 hover:text-white transition-colors">
                  Electronics
                </Link>
              </li>
              <li>
                <Link to="/products?category=fashion" className="text-gray-300 hover:text-white transition-colors">
                  Fashion
                </Link>
              </li>
              <li>
                <Link to="/products?category=home-kitchen" className="text-gray-300 hover:text-white transition-colors">
                  Home & Kitchen
                </Link>
              </li>
              <li>
                <Link to="/products?category=beauty" className="text-gray-300 hover:text-white transition-colors">
                  Beauty & Health
                </Link>
              </li>
              <li>
                <Link to="/products?sort=newest" className="text-gray-300 hover:text-white transition-colors">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link to="/products?sort=rating" className="text-gray-300 hover:text-white transition-colors">
                  Top Rated
                </Link>
              </li>
              <li>
                <Link to="/deals" className="text-gray-300 hover:text-white transition-colors">
                  Daily Deals
                </Link>
              </li>
            </ul>
          </div>

          {/* Company & Legal */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Company</h3>
            <ul className="space-y-4">
              <li>
                <Link to="/about" className="text-gray-300 hover:text-white transition-colors">
                  About Samoku
                </Link>
              </li>
              <li>
                <Link to="/careers" className="text-gray-300 hover:text-white transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link to="/press" className="text-gray-300 hover:text-white transition-colors">
                  Press Center
                </Link>
              </li>
              <li>
                <Link to="/investor-relations" className="text-gray-300 hover:text-white transition-colors">
                  Investor Relations
                </Link>
              </li>
              <li>
                <Link to="/vendor-center" className="text-gray-300 hover:text-white transition-colors">
                  Vendor Center
                </Link>
              </li>
              <li>
                <Link to="/affiliate-program" className="text-gray-300 hover:text-white transition-colors">
                  Affiliate Program
                </Link>
              </li>
              <li>
                <Link to="/sustainability" className="text-gray-300 hover:text-white transition-colors">
                  Sustainability
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Mobile App Download */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="text-center lg:text-left lg:flex lg:items-center lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <h4 className="text-lg font-semibold mb-2">Get the Samoku Mobile App</h4>
              <p className="text-gray-300">Shop on the go with our mobile app</p>
            </div>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 justify-center lg:justify-end">
              <a
                href="#"
                className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center space-x-2"
              >
                <span>📱</span>
                <div className="text-left">
                  <div className="text-xs">Download on the</div>
                  <div className="text-sm font-semibold">App Store</div>
                </div>
              </a>
              <a
                href="#"
                className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center space-x-2"
              >
                <span>🤖</span>
                <div className="text-left">
                  <div className="text-xs">Get it on</div>
                  <div className="text-sm font-semibold">Google Play</div>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-6 lg:space-y-0">
            {/* Legal Links */}
            <div className="flex flex-wrap justify-center lg:justify-start space-x-6 text-sm">
              <Link to="/privacy-policy" className="text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms-of-service" className="text-gray-400 hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link to="/cookie-policy" className="text-gray-400 hover:text-white transition-colors">
                Cookie Policy
              </Link>
              <Link to="/accessibility" className="text-gray-400 hover:text-white transition-colors">
                Accessibility
              </Link>
              <Link to="/sitemap" className="text-gray-400 hover:text-white transition-colors">
                Sitemap
              </Link>
            </div>

            {/* Copyright */}
            <div className="text-center lg:text-right">
              <p className="text-gray-400 text-sm mb-2">
                © 2025 Samoku Marketplace Inc. All rights reserved.
              </p>
              <div className="flex justify-center lg:justify-end space-x-4 text-xs text-gray-500">
                <span>🔒 SSL Secured</span>
                <span>💳 Safe Payments</span>
                <span>🚚 Worldwide Shipping</span>
                <span>↩️ Easy Returns</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-gray-800 border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h4 className="text-sm font-semibold text-gray-300 mb-2">We Accept</h4>
              <div className="flex space-x-3">
                {['💳 Visa', '💳 Mastercard', '🅿️ PayPal', '🍎 Apple Pay', '🤖 Google Pay', '💰 Stripe'].map((payment) => (
                  <span key={payment} className="bg-gray-700 px-3 py-1 rounded text-xs text-gray-300">
                    {payment}
                  </span>
                ))}
              </div>
            </div>
            <div className="text-center md:text-right">
              <p className="text-xs text-gray-400 mb-1">
                Trusted by 10+ million customers worldwide
              </p>
              <div className="flex justify-center md:justify-end space-x-2 text-xs text-gray-500">
                <span>⭐ 4.8/5 Rating</span>
                <span>•</span>
                <span>🛡️ A+ BBB Rating</span>
                <span>•</span>
                <span>🏆 Industry Leader</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;