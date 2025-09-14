import { supabase } from '../lib/supabase';
import { ProductReview, ProductReviewVote } from '../types/enhanced';

export interface CreateReviewData {
  productId: string;
  rating: number;
  title: string;
  comment?: string;
  imageUrls?: string[];
  orderId?: string;
}

export interface UpdateReviewData {
  rating?: number;
  title?: string;
  comment?: string;
  imageUrls?: string[];
}

class ReviewService {
  async getProductReviews(productId: string, limit?: number): Promise<ProductReview[]> {
    try {
      let query = supabase
        .from('product_reviews')
        .select(`
          *,
          users!product_reviews_customer_id_fkey(name, avatar_url)
        `)
        .eq('product_id', productId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data.map(this.mapReview);
    } catch (error) {
      console.error('Failed to fetch product reviews:', error);
      throw error;
    }
  }

  async getUserReviews(userId: string): Promise<ProductReview[]> {
    try {
      const { data, error } = await supabase
        .from('product_reviews')
        .select(`
          *,
          products(name, images),
          users!product_reviews_customer_id_fkey(name, avatar_url)
        `)
        .eq('customer_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data.map(this.mapReview);
    } catch (error) {
      console.error('Failed to fetch user reviews:', error);
      throw error;
    }
  }

  async createReview(reviewData: CreateReviewData, customerId: string): Promise<ProductReview> {
    try {
      // Check if user has purchased this product
      const { data: orderCheck } = await supabase
        .from('order_items')
        .select(`
          id,
          orders!inner(customer_id, status)
        `)
        .eq('product_id', reviewData.productId)
        .eq('orders.customer_id', customerId)
        .in('orders.status', ['delivered', 'completed'])
        .limit(1);

      const isVerifiedPurchase = orderCheck && orderCheck.length > 0;

      const { data, error } = await supabase
        .from('product_reviews')
        .insert({
          product_id: reviewData.productId,
          customer_id: customerId,
          order_id: reviewData.orderId,
          rating: reviewData.rating,
          title: reviewData.title,
          comment: reviewData.comment,
          image_urls: reviewData.imageUrls || [],
          is_verified_purchase: isVerifiedPurchase,
          is_approved: true, // Auto-approve for now, add moderation later
        })
        .select(`
          *,
          users!product_reviews_customer_id_fkey(name, avatar_url)
        `)
        .single();

      if (error) {
        throw error;
      }

      // Update product rating
      await this.updateProductRating(reviewData.productId);

      return this.mapReview(data);
    } catch (error) {
      console.error('Failed to create review:', error);
      throw error;
    }
  }

  async updateReview(reviewId: string, updates: UpdateReviewData): Promise<ProductReview> {
    try {
      const { data, error } = await supabase
        .from('product_reviews')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', reviewId)
        .select(`
          *,
          users!product_reviews_customer_id_fkey(name, avatar_url)
        `)
        .single();

      if (error) {
        throw error;
      }

      // Update product rating if rating changed
      if (updates.rating !== undefined) {
        await this.updateProductRating(data.product_id);
      }

      return this.mapReview(data);
    } catch (error) {
      console.error('Failed to update review:', error);
      throw error;
    }
  }

  async deleteReview(reviewId: string): Promise<void> {
    try {
      // Get product ID before deletion
      const { data: review } = await supabase
        .from('product_reviews')
        .select('product_id')
        .eq('id', reviewId)
        .single();

      const { error } = await supabase
        .from('product_reviews')
        .delete()
        .eq('id', reviewId);

      if (error) {
        throw error;
      }

      // Update product rating
      if (review) {
        await this.updateProductRating(review.product_id);
      }
    } catch (error) {
      console.error('Failed to delete review:', error);
      throw error;
    }
  }

  async voteOnReview(reviewId: string, userId: string, isHelpful: boolean): Promise<void> {
    try {
      const { error } = await supabase
        .from('product_review_votes')
        .upsert({
          review_id: reviewId,
          user_id: userId,
          is_helpful: isHelpful,
        });

      if (error) {
        throw error;
      }

      // Update vote counts on the review
      await this.updateReviewVoteCounts(reviewId);
    } catch (error) {
      console.error('Failed to vote on review:', error);
      throw error;
    }
  }

  async addVendorResponse(reviewId: string, response: string, vendorId: string): Promise<ProductReview> {
    try {
      // Verify vendor owns the product
      const { data: review } = await supabase
        .from('product_reviews')
        .select(`
          product_id,
          products!inner(owner_id)
        `)
        .eq('id', reviewId)
        .single();

      if (!review || review.products.owner_id !== vendorId) {
        throw new Error('Unauthorized to respond to this review');
      }

      const { data, error } = await supabase
        .from('product_reviews')
        .update({
          vendor_response: response,
          vendor_response_date: new Date().toISOString(),
        })
        .eq('id', reviewId)
        .select(`
          *,
          users!product_reviews_customer_id_fkey(name, avatar_url)
        `)
        .single();

      if (error) {
        throw error;
      }

      return this.mapReview(data);
    } catch (error) {
      console.error('Failed to add vendor response:', error);
      throw error;
    }
  }

  async getProductRatingStats(productId: string): Promise<{
    averageRating: number;
    totalReviews: number;
    ratingDistribution: { [key: number]: number };
  }> {
    try {
      const { data, error } = await supabase
        .from('product_reviews')
        .select('rating')
        .eq('product_id', productId)
        .eq('is_approved', true);

      if (error) {
        throw error;
      }

      const reviews = data || [];
      const totalReviews = reviews.length;
      
      if (totalReviews === 0) {
        return {
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        };
      }

      const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;
      
      const ratingDistribution = reviews.reduce((dist, review) => {
        dist[review.rating] = (dist[review.rating] || 0) + 1;
        return dist;
      }, {} as { [key: number]: number });

      return {
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews,
        ratingDistribution: {
          1: ratingDistribution[1] || 0,
          2: ratingDistribution[2] || 0,
          3: ratingDistribution[3] || 0,
          4: ratingDistribution[4] || 0,
          5: ratingDistribution[5] || 0,
        },
      };
    } catch (error) {
      console.error('Failed to get rating stats:', error);
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    }
  }

  private async updateProductRating(productId: string): Promise<void> {
    try {
      const stats = await this.getProductRatingStats(productId);

      const { error } = await supabase
        .from('products')
        .update({
          rating: stats.averageRating,
          review_count: stats.totalReviews,
        })
        .eq('id', productId);

      if (error) {
        console.error('Failed to update product rating:', error);
      }
    } catch (error) {
      console.error('Failed to update product rating:', error);
    }
  }

  private async updateReviewVoteCounts(reviewId: string): Promise<void> {
    try {
      const { data: votes } = await supabase
        .from('product_review_votes')
        .select('is_helpful')
        .eq('review_id', reviewId);

      if (votes) {
        const helpfulVotes = votes.filter(vote => vote.is_helpful).length;
        const totalVotes = votes.length;

        await supabase
          .from('product_reviews')
          .update({
            helpful_votes: helpfulVotes,
            total_votes: totalVotes,
          })
          .eq('id', reviewId);
      }
    } catch (error) {
      console.error('Failed to update review vote counts:', error);
    }
  }

  private mapReview(dbReview: any): ProductReview {
    return {
      id: dbReview.id,
      productId: dbReview.product_id,
      customerId: dbReview.customer_id,
      customerName: dbReview.users?.name || 'Anonymous',
      customerAvatar: dbReview.users?.avatar_url,
      orderId: dbReview.order_id,
      rating: dbReview.rating,
      title: dbReview.title,
      comment: dbReview.comment,
      imageUrls: dbReview.image_urls || [],
      isVerifiedPurchase: dbReview.is_verified_purchase,
      isApproved: dbReview.is_approved,
      helpfulVotes: dbReview.helpful_votes || 0,
      totalVotes: dbReview.total_votes || 0,
      vendorResponse: dbReview.vendor_response,
      vendorResponseDate: dbReview.vendor_response_date,
      createdAt: dbReview.created_at,
      updatedAt: dbReview.updated_at,
    };
  }
}

export const reviewService = new ReviewService();