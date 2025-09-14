import React, { useState } from 'react';
import { Filter, X, Star, DollarSign, Package, Truck } from 'lucide-react';

interface SearchFilters {
  category: string;
  subcategory: string;
  minPrice: string;
  maxPrice: string;
  rating: string;
  inStock: boolean;
  freeShipping: boolean;
  vendor: string;
  brand: string;
}

interface AdvancedSearchFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onClearFilters: () => void;
}

const AdvancedSearchFilters: React.FC<AdvancedSearchFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const categories = [
    { name: 'All Categories', value: '' },
    { name: 'Electronics', value: 'electronics', subcategories: ['Phones', 'Laptops', 'Audio', 'Gaming'] },
    { name: 'Fashion', value: 'fashion', subcategories: ['Clothing', 'Shoes', 'Accessories', 'Jewelry'] },
    { name: 'Home & Kitchen', value: 'home-kitchen', subcategories: ['Furniture', 'Appliances', 'Decor', 'Kitchen'] },
    { name: 'Beauty', value: 'beauty', subcategories: ['Skincare', 'Makeup', 'Hair Care', 'Fragrance'] },
    { name: 'Sports', value: 'sports', subcategories: ['Fitness', 'Outdoor', 'Team Sports', 'Water Sports'] },
    { name: 'Toys', value: 'toys', subcategories: ['Educational', 'Action Figures', 'Board Games', 'Outdoor Toys'] }
  ];

  const selectedCategory = categories.find(cat => cat.value === filters.category);
  const subcategories = selectedCategory?.subcategories || [];

  const handleFilterChange = (key: keyof SearchFilters, value: string | boolean) => {
    const newFilters = { ...filters, [key]: value };
    
    // Clear subcategory if category changes
    if (key === 'category') {
      newFilters.subcategory = '';
    }
    
    onFiltersChange(newFilters);
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== '' && value !== false
  );

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Filter Toggle */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-500" />
          <span className="font-medium text-gray-900">Advanced Filters</span>
          {hasActiveFilters && (
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              Active
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClearFilters();
              }}
              className="text-red-600 hover:text-red-700 text-sm font-medium"
            >
              Clear All
            </button>
          )}
          <div className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
            ⌄
          </div>
        </div>
      </button>

      {/* Filter Content */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-6 space-y-6">
          {/* Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {subcategories.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subcategory
                </label>
                <select
                  value={filters.subcategory}
                  onChange={(e) => handleFilterChange('subcategory', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Subcategories</option>
                  {subcategories.map(subcat => (
                    <option key={subcat} value={subcat.toLowerCase().replace(/\s+/g, '-')}>
                      {subcat}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
              <DollarSign className="h-4 w-4 mr-2" />
              Price Range
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  type="number"
                  placeholder="Min Price"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <input
                  type="number"
                  placeholder="Max Price"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
              <Star className="h-4 w-4 mr-2" />
              Minimum Rating
            </label>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => handleFilterChange('rating', rating.toString())}
                  className={`flex items-center space-x-1 px-3 py-2 border rounded-lg transition-colors ${
                    filters.rating === rating.toString()
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <Star className={`h-4 w-4 ${
                    filters.rating === rating.toString() ? 'text-yellow-400 fill-current' : 'text-gray-400'
                  }`} />
                  <span className="text-sm">{rating}+</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Filters */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Quick Filters
            </label>
            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.inStock}
                  onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <Package className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">In Stock Only</span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.freeShipping}
                  onChange={(e) => handleFilterChange('freeShipping', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <Truck className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">Free Shipping</span>
              </label>
            </div>
          </div>

          {/* Vendor & Brand */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vendor
              </label>
              <input
                type="text"
                placeholder="Search vendors..."
                value={filters.vendor}
                onChange={(e) => handleFilterChange('vendor', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand
              </label>
              <input
                type="text"
                placeholder="Search brands..."
                value={filters.brand}
                onChange={(e) => handleFilterChange('brand', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Applied Filters */}
          {hasActiveFilters && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Applied Filters
              </label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(filters).map(([key, value]) => {
                  if (!value || value === '') return null;
                  
                  const displayValue = typeof value === 'boolean' 
                    ? key.replace(/([A-Z])/g, ' $1').toLowerCase()
                    : `${key}: ${value}`;

                  return (
                    <span
                      key={key}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                    >
                      {displayValue}
                      <button
                        onClick={() => handleFilterChange(key as keyof SearchFilters, typeof value === 'boolean' ? false : '')}
                        className="ml-2 hover:text-blue-900"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvancedSearchFilters;