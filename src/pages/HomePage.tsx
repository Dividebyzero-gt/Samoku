import React from 'react';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Star, 
  Shield, 
  Truck, 
  Users, 
  Search,
  ChevronLeft,
  ChevronRight,
  Tag,
  Zap,
  Award,
  Clock,
  Smartphone,
  Laptop,
  Home,
  Shirt,
  Dumbbell,
  Baby,
  Car,
  Heart,
  Gift,
  Sparkles
} from 'lucide-react';
import { productService } from '../services/productService';
import { Product } from '../types';
import ProductCard from '../components/products/ProductCard';

const categories = [
  { name: 'Electronics', slug: 'electronics', icon: Smartphone, color: 'bg-blue-500', image: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { name: 'Fashion', slug: 'fashion', icon: Shirt, color: 'bg-pink-500', image: 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { name: 'Home & Kitchen', slug: 'home-kitchen', icon: Home, color: 'bg-green-500', image: 'https://images.pexels.com/photos/4686821/pexels-photo-4686821.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { name: 'Beauty', slug: 'beauty', icon: Sparkles, color: 'bg-purple-500', image: 'https://images.pexels.com/photos/4465124/pexels-photo-4465124.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { name: 'Sports', slug: 'sports', icon: Dumbbell, color: 'bg-orange-500', image: 'https://images.pexels.com/photos/416978/pexels-photo-416978.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { name: 'Baby & Kids', slug: 'baby-kids', icon: Baby, color: 'bg-yellow-500', image: 'https://images.pexels.com/photos/1148998/pexels-photo-1148998.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { name: 'Automotive', slug: 'automotive', icon: Car, color: 'bg-gray-500', image: 'https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { name: 'Toys', slug: 'toys', icon: Gift, color: 'bg-red-500', image: 'https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg?auto=compress&cs=tinysrgb&w=400' }
];

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [topDeals, setTopDeals] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const loadHomePageData = async () => {
      try {
        const [featured, deals, arrivals, sellers] = await Promise.all([
          productService.getProducts({ sortBy: 'rating', isActive: true }),
          productService.getProducts({ sortBy: 'price-asc', isActive: true }),
          productService.getProducts({ sortBy: 'newest', isActive: true }),
          productService.getProducts({ sortBy: 'relevance', isActive: true })
        ]);
        
        setFeaturedProducts(featured.slice(0, 12));
        setTopDeals(deals.slice(0, 8));
        setNewArrivals(arrivals.slice(0, 8));
        setBestSellers(sellers.slice(0, 8));
      } catch (error) {
        console.error('Failed to load homepage data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadHomePageData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const heroSlides = [
    {
      title: "Premium Quality, Unbeatable Prices",
      subtitle: "Discover amazing deals from trusted vendors worldwide",
      cta: "Shop Now",
      background: "https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg?auto=compress&cs=tinysrgb&w=1600",
      overlay: "bg-gradient-to-r from-blue-900/70 to-purple-900/50"
    },
    {
      title: "New Arrivals Every Day",
      subtitle: "Be the first to discover the latest trends and innovations",
      cta: "Explore New",
      background: "https://images.pexels.com/photos/1488463/pexels-photo-1488463.jpeg?auto=compress&cs=tinysrgb&w=1600",
      overlay: "bg-gradient-to-r from-green-900/70 to-blue-900/50"
    },
    {
      title: "Join Thousands of Sellers",
      subtitle: "Start your business journey with our powerful platform",
      cta: "Become a Vendor",
      background: "https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=1600",
      overlay: "bg-gradient-to-r from-purple-900/70 to-pink-900/50"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Carousel */}
      <section className="relative h-[70vh] overflow-hidden">
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="absolute inset-0">
              <img
                src={slide.background}
                alt=""
                className="w-full h-full object-cover"
              />
              <div className={`absolute inset-0 ${slide.overlay}`}></div>
            </div>
            
            <div className="relative z-10 h-full flex items-center">
              <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl">
                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                    {slide.title}
                  </h1>
                  <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-2xl">
                    {slide.subtitle}
                  </p>
                  <Link
                    to={slide.cta === "Become a Vendor" ? "/register" : "/products"}
                    className="inline-flex items-center bg-white text-gray-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    {slide.cta}
                    <ArrowRight className="ml-3 h-6 w-6" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Carousel Controls */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/75'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Enhanced Search Bar */}
      <section className="bg-white shadow-lg -mt-16 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <form onSubmit={handleSearch} className="max-w-4xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search millions of products..."
                className="w-full px-6 py-4 pr-16 text-lg border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 shadow-sm"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition-colors"
              >
                <Search className="h-6 w-6" />
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Category Navigation */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Shop by Category
            </h2>
            <p className="text-xl text-gray-600">
              Explore our vast collection across all categories
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Link
                  key={category.slug}
                  to={`/products?category=${category.slug}`}
                  className="group relative overflow-hidden rounded-2xl aspect-square hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-300" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
                    <div className={`${category.color} p-3 rounded-full mb-3 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-center text-sm md:text-base leading-tight">
                      {category.name}
                    </h3>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Flash Deals */}
      <section className="py-16 bg-gradient-to-r from-red-600 to-pink-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white mb-12">
            <div className="inline-flex items-center space-x-2 bg-yellow-400 text-red-600 px-4 py-2 rounded-full font-bold mb-4">
              <Zap className="h-5 w-5" />
              <span>FLASH DEALS</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Limited Time Offers
            </h2>
            <p className="text-xl opacity-90">
              Grab these amazing deals before they're gone!
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 animate-pulse">
                  <div className="w-full h-48 bg-gray-300 rounded-xl mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {topDeals.slice(0, 4).map((product) => (
                <div key={product.id} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="relative">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-bold">
                      DEAL
                    </div>
                    {product.originalPrice && (
                      <div className="absolute top-3 right-3 bg-yellow-400 text-red-600 px-2 py-1 rounded-lg text-xs font-bold">
                        -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    <div className="flex items-center mb-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(product.rating)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="ml-2 text-xs text-gray-600">
                          ({product.reviewCount})
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xl font-bold text-gray-900">
                          ${product.price.toFixed(2)}
                        </span>
                        {product.originalPrice && (
                          <span className="text-sm text-gray-500 line-through ml-2">
                            ${product.originalPrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <Link
                        to={`/products/${product.id}`}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold"
                      >
                        Shop Now
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Products Carousel */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Featured Products
              </h2>
              <p className="text-xl text-gray-600">
                Handpicked by our experts
              </p>
            </div>
            <Link
              to="/products"
              className="hidden sm:flex items-center text-blue-600 hover:text-blue-700 font-semibold text-lg group"
            >
              View All
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-2xl p-6 animate-pulse">
                  <div className="w-full h-64 bg-gray-300 rounded-xl mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Best Sellers */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <div className="inline-flex items-center space-x-2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full font-semibold mb-4">
                <Award className="h-5 w-5" />
                <span>BEST SELLERS</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Customer Favorites
              </h2>
              <p className="text-xl text-gray-600">
                Most loved products this month
              </p>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 animate-pulse shadow-lg">
                  <div className="w-full h-48 bg-gray-300 rounded-xl mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {bestSellers.slice(0, 4).map((product, index) => (
                <div key={product.id} className="relative">
                  <div className="absolute -top-3 -left-3 bg-yellow-400 text-gray-900 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm z-10 shadow-lg">
                    #{index + 1}
                  </div>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <div className="inline-flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-full font-semibold mb-4">
                <Clock className="h-5 w-5" />
                <span>NEW ARRIVALS</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Fresh & Trending
              </h2>
              <p className="text-xl text-gray-600">
                Latest products just added
              </p>
            </div>
            <Link
              to="/products?sort=newest"
              className="hidden sm:flex items-center text-blue-600 hover:text-blue-700 font-semibold text-lg group"
            >
              View All New
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-2xl p-6 animate-pulse">
                  <div className="w-full h-48 bg-gray-300 rounded-xl mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {newArrivals.slice(0, 4).map((product) => (
                <div key={product.id} className="relative">
                  <div className="absolute top-3 left-3 bg-green-500 text-white px-2 py-1 rounded-lg text-xs font-bold z-10">
                    NEW
                  </div>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Millions Choose Samoku
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Trusted by customers worldwide for quality, security, and exceptional service
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="bg-blue-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Shield className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Secure Shopping</h3>
              <p className="text-gray-300 leading-relaxed">
                Bank-level encryption and fraud protection for every transaction
              </p>
            </div>

            <div className="text-center group">
              <div className="bg-green-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Truck className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Fast Delivery</h3>
              <p className="text-gray-300 leading-relaxed">
                Free shipping on orders over $50 with express delivery options
              </p>
            </div>

            <div className="text-center group">
              <div className="bg-purple-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Users className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Trusted Vendors</h3>
              <p className="text-gray-300 leading-relaxed">
                Carefully vetted sellers with verified quality standards
              </p>
            </div>

            <div className="text-center group">
              <div className="bg-yellow-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Heart className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">24/7 Support</h3>
              <p className="text-gray-300 leading-relaxed">
                Round-the-clock customer service and easy returns
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold text-blue-400 mb-2">10M+</div>
              <div className="text-gray-300">Products</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-green-400 mb-2">50K+</div>
              <div className="text-gray-300">Vendors</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-purple-400 mb-2">1M+</div>
              <div className="text-gray-300">Customers</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-yellow-400 mb-2">99.9%</div>
              <div className="text-gray-300">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Brands/Stores */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Popular Stores
            </h2>
            <p className="text-xl text-gray-600">
              Shop from top-rated vendors
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[
              { name: 'Tech Central', logo: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=200', rating: 4.8 },
              { name: 'Fashion Hub', logo: 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=200', rating: 4.9 },
              { name: 'Home Essentials', logo: 'https://images.pexels.com/photos/4686821/pexels-photo-4686821.jpeg?auto=compress&cs=tinysrgb&w=200', rating: 4.7 },
              { name: 'Beauty Corner', logo: 'https://images.pexels.com/photos/4465124/pexels-photo-4465124.jpeg?auto=compress&cs=tinysrgb&w=200', rating: 4.6 },
              { name: 'Sports World', logo: 'https://images.pexels.com/photos/416978/pexels-photo-416978.jpeg?auto=compress&cs=tinysrgb&w=200', rating: 4.8 },
              { name: 'Kids Paradise', logo: 'https://images.pexels.com/photos/1148998/pexels-photo-1148998.jpeg?auto=compress&cs=tinysrgb&w=200', rating: 4.9 }
            ].map((store) => (
              <div key={store.name} className="bg-gray-50 rounded-2xl p-6 text-center hover:shadow-lg transition-all duration-300 cursor-pointer group">
                <img
                  src={store.logo}
                  alt={store.name}
                  className="w-16 h-16 rounded-full mx-auto mb-4 object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <h3 className="font-semibold text-gray-900 mb-2">{store.name}</h3>
                <div className="flex items-center justify-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-600">{store.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile CTA */}
      <section className="py-16 bg-white sm:hidden">
        <div className="px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Start Shopping?
          </h2>
          <div className="space-y-3">
            <Link
              to="/products"
              className="block w-full bg-blue-600 text-white py-4 rounded-lg font-semibold text-lg"
            >
              Browse All Products
            </Link>
            <Link
              to="/register"
              className="block w-full border-2 border-blue-600 text-blue-600 py-4 rounded-lg font-semibold text-lg"
            >
              Start Selling
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;