import React from 'react';
import { Users, Globe, Award, Heart, Shield, Zap, Target, TrendingUp } from 'lucide-react';

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">About Samoku</h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Connecting the world through commerce. We're building the future of online marketplace experiences.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                To democratize commerce by creating a platform where anyone can build a successful business, 
                and customers can discover amazing products from trusted vendors worldwide.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                We believe in empowering entrepreneurs and providing customers with unparalleled choice, 
                quality, and value through innovative technology and exceptional service.
              </p>
            </div>
            <div className="relative">
              <img
                src="https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Our Mission"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-blue-600 text-white p-4 rounded-xl shadow-lg">
                <p className="text-sm font-semibold">Since 2023</p>
                <p className="text-xs opacity-90">Transforming commerce</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Powering Global Commerce
            </h2>
            <p className="text-xl text-gray-600">
              Our platform continues to grow and serve millions worldwide
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Users, stat: '10M+', label: 'Active Customers', color: 'text-blue-600' },
              { icon: Globe, stat: '50K+', label: 'Trusted Vendors', color: 'text-green-600' },
              { icon: Award, stat: '100M+', label: 'Products Sold', color: 'text-purple-600' },
              { icon: Target, stat: '190+', label: 'Countries Served', color: 'text-orange-600' }
            ].map(({ icon: Icon, stat, label, color }) => (
              <div key={label} className="text-center">
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                  <Icon className={`h-12 w-12 ${color} mx-auto mb-4`} />
                  <div className="text-4xl font-bold text-gray-900 mb-2">{stat}</div>
                  <div className="text-gray-600">{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Core Values
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The principles that guide everything we do and shape our company culture
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Heart,
                title: 'Customer First',
                description: 'Every decision we make starts with asking: "How does this benefit our customers?" Their success is our success.',
                color: 'bg-red-500'
              },
              {
                icon: Shield,
                title: 'Trust & Security',
                description: 'We maintain the highest standards of security and transparency to protect our users and their data.',
                color: 'bg-blue-500'
              },
              {
                icon: Zap,
                title: 'Innovation',
                description: 'We continuously evolve our platform using cutting-edge technology to stay ahead of market needs.',
                color: 'bg-yellow-500'
              },
              {
                icon: Users,
                title: 'Community',
                description: 'We foster a supportive ecosystem where vendors and customers can thrive together.',
                color: 'bg-green-500'
              },
              {
                icon: Award,
                title: 'Excellence',
                description: 'We strive for excellence in every aspect of our service, from user experience to customer support.',
                color: 'bg-purple-500'
              },
              {
                icon: Globe,
                title: 'Global Impact',
                description: 'We believe in breaking down barriers and creating opportunities for businesses worldwide.',
                color: 'bg-indigo-500'
              }
            ].map(({ icon: Icon, title, description, color }) => (
              <div key={title} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
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

      {/* Growth Timeline */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Journey
            </h2>
            <p className="text-xl text-gray-600">
              From startup to global marketplace leader
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-blue-200 hidden lg:block"></div>
            
            <div className="space-y-16">
              {[
                {
                  year: '2023',
                  title: 'Company Founded',
                  description: 'Started with a vision to democratize e-commerce and empower small businesses worldwide.',
                  align: 'left'
                },
                {
                  year: '2024',
                  title: 'First Million Users',
                  description: 'Reached our first million registered users and 10,000 active vendors across 50 countries.',
                  align: 'right'
                },
                {
                  year: '2025',
                  title: 'Global Expansion',
                  description: 'Launched in 190+ countries with advanced AI-powered recommendations and instant checkout.',
                  align: 'left'
                },
                {
                  year: 'Future',
                  title: 'Next Chapter',
                  description: 'Continuing to innovate with AR shopping, sustainable commerce, and blockchain integration.',
                  align: 'right'
                }
              ].map(({ year, title, description, align }) => (
                <div key={year} className={`flex items-center ${align === 'right' ? 'lg:flex-row-reverse' : ''}`}>
                  <div className={`flex-1 ${align === 'right' ? 'lg:text-right lg:pr-16' : 'lg:pl-16'}`}>
                    <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md mx-auto lg:mx-0">
                      <div className="text-blue-600 font-bold text-lg mb-2">{year}</div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
                      <p className="text-gray-600 leading-relaxed">{description}</p>
                    </div>
                  </div>
                  <div className="hidden lg:block w-6 h-6 bg-blue-600 rounded-full border-4 border-white shadow-lg relative z-10"></div>
                  <div className="flex-1"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Join CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Join the Samoku Family?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Whether you're looking to shop amazing products or build your business, we're here to help you succeed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors">
              Start Shopping
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-colors">
              Become a Vendor
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;