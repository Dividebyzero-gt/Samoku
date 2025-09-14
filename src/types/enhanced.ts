// Enhanced types for multivendor features

export interface ProductVariant {
  id: string;
  productId: string;
  name: string; // e.g., "Color", "Size"
  value: string; // e.g., "Red", "Large"
  sku?: string;
  priceAdjustment: number; // Additional cost (+) or discount (-)
  stockQuantity: number;
  imageUrls: string[];
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductReview {
  id: string;
  productId: string;
  customerId: string;
  customerName: string;
  customerAvatar?: string;
  orderId?: string;
  rating: number; // 1-5
  title: string;
  comment?: string;
  imageUrls: string[];
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  helpfulVotes: number;
  totalVotes: number;
  vendorResponse?: string;
  vendorResponseDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Wishlist {
  id: string;
  userId: string;
  productId: string;
  product?: Product;
  createdAt: string;
}

export interface VendorApplication {
  id: string;
  userId: string;
  businessName: string;
  businessType: 'individual' | 'llc' | 'corporation' | 'partnership';
  businessRegistrationNumber?: string;
  taxId?: string;
  businessAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  contactPerson: string;
  phone: string;
  website?: string;
  businessDescription: string;
  productCategories: string[];
  expectedMonthlySales?: number;
  previousExperience?: string;
  documents: {
    businessLicense?: string;
    taxCertificate?: string;
    identityDocument?: string;
    bankingInfo?: string;
  };
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  reviewNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoreCustomization {
  id: string;
  storeId: string;
  themeColor: string;
  bannerImage?: string;
  logoImage?: string;
  coverImage?: string;
  customCss?: string;
  socialLinks: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
  };
  businessHours: {
    monday?: { open: string; close: string; closed?: boolean };
    tuesday?: { open: string; close: string; closed?: boolean };
    wednesday?: { open: string; close: string; closed?: boolean };
    thursday?: { open: string; close: string; closed?: boolean };
    friday?: { open: string; close: string; closed?: boolean };
    saturday?: { open: string; close: string; closed?: boolean };
    sunday?: { open: string; close: string; closed?: boolean };
  };
  returnPolicy?: string;
  shippingPolicy?: string;
  aboutSection?: string;
  featuredProducts: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CommissionTransaction {
  id: string;
  orderItemId: string;
  storeId: string;
  orderId: string;
  saleAmount: number;
  commissionRate: number;
  commissionAmount: number;
  platformFee: number;
  netAmount: number; // Amount vendor receives
  status: 'pending' | 'processing' | 'paid' | 'failed';
  payoutId?: string;
  processedAt?: string;
  createdAt: string;
}

export interface ProductReviewVote {
  id: string;
  reviewId: string;
  userId: string;
  isHelpful: boolean;
  createdAt: string;
}

export interface EnhancedProduct extends Product {
  variants?: ProductVariant[];
  reviews?: ProductReview[];
  averageRating?: number;
  totalReviews?: number;
}

export interface SearchFilters {
  category?: string;
  subcategory?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number; // Minimum rating
  inStock?: boolean;
  freeShipping?: boolean;
  brand?: string;
  vendor?: string;
  sortBy?: 'relevance' | 'price-asc' | 'price-desc' | 'rating' | 'newest' | 'popular';
  search?: string;
}

export interface VendorStats {
  totalSales: number;
  totalOrders: number;
  totalProducts: number;
  averageRating: number;
  totalReviews: number;
  pendingOrders: number;
  totalCommissions: number;
  unpaidCommissions: number;
  thisMonthSales: number;
  lastMonthSales: number;
  topSellingProducts: Product[];
  recentOrders: Order[];
}