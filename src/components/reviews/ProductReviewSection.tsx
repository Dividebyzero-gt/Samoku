import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, ThumbsDown, MessageSquare, Camera, Shield } from 'lucide-react';
import { reviewService, CreateReviewData } from '../../services/reviewService';
import { useAuth } from '../../contexts/AuthContext';
import { ProductReview } from '../../types/enhanced';

interface ProductReviewSectionProps {
  productId: string;
  productName: string;
}

const ProductReviewSection: React.FC<ProductReviewSectionProps> = ({ productId, productName }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [ratingStats, setRatingStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  });

  const [reviewForm, setReviewForm] = useState<CreateReviewData>({
    productId,
    rating: 5,
    title: '',
    comment: '',
    imageUrls: []
  });

  useEffect(() => {
    loadReviews();
    loadRatingStats();
  }, [productId]);

  const loadReviews = async () => {
    try {
      const productReviews = await reviewService.getProductReviews(productId, 10);
      setReviews(productReviews);
    } catch (error) {
      console.error('Failed to load reviews:', error);
    }
  };

  const loadRatingStats = async () => {
    try {
      const stats = await reviewService.getProductRatingStats(productId);
      setRatingStats(stats);
    } catch (error) {
      console.error('Failed to load rating stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await reviewService.createReview(reviewForm, user.id);
      setShowReviewForm(false);
      setReviewForm({
        productId,
        rating: 5,
        title: '',
        comment: '',
        imageUrls: []
      });
      await loadReviews();
      await loadRatingStats();
    } catch (error) {
      console.error('Failed to submit review:', error);
      alert('Failed to submit review. Please try again.');
    }
  };

  const handleVoteOnReview = async (reviewId: string, isHelpful: boolean) => {
    if (!user) return;

    try {
      await reviewService.voteOnReview(reviewId, user.id, isHelpful);
      await loadReviews(); // Reload to get updated vote counts
    } catch (error) {
      console.error('Failed to vote on review:', error);
    }
  };

  if (loading) {
    return (
      <div className="py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Rating Overview */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Average Rating */}
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start space-x-4 mb-4">
              <div className="text-5xl font-bold text-gray-900">
                {ratingStats.averageRating.toFixed(1)}
              </div>
              <div>
                <div className="flex items-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-6 w-6 ${
                        i < Math.floor(ratingStats.averageRating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-gray-600">
                  Based on {ratingStats.totalReviews} review{ratingStats.totalReviews !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = ratingStats.ratingDistribution[rating] || 0;
              const percentage = ratingStats.totalReviews > 0 
                ? (count / ratingStats.totalReviews) * 100 
                : 0;

              return (
                <div key={rating} className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600 w-8">{rating} ★</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-12">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Write Review Button */}
        {user && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={() => setShowReviewForm(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Write a Review</span>
            </button>
          </div>
        )}
      </div>

      {/* Review Form */}
      {showReviewForm && user && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-xl font-semibold text-gray-900 mb-6">Write Your Review</h4>
          
          <form onSubmit={handleSubmitReview} className="space-y-6">
            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Overall Rating *
              </label>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setReviewForm({ ...reviewForm, rating })}
                    className="p-1"
                  >
                    <Star
                      className={`h-8 w-8 transition-colors ${
                        rating <= reviewForm.rating
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300 hover:text-yellow-200'
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-3 text-lg font-medium text-gray-900">
                  {reviewForm.rating}/5
                </span>
              </div>
            </div>

            {/* Review Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Review Title *
              </label>
              <input
                type="text"
                required
                value={reviewForm.title}
                onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                placeholder="Summarize your experience..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Review Comment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Review
              </label>
              <textarea
                rows={4}
                value={reviewForm.comment}
                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                placeholder="Share your thoughts about this product..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex space-x-4">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Submit Review
              </button>
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h4>
            <p className="text-gray-600">Be the first to review {productName}</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start space-x-4">
                {/* Avatar */}
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                  {review.customerAvatar ? (
                    <img
                      src={review.customerAvatar}
                      alt={review.customerName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-600 font-medium">
                      {review.customerName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h5 className="font-medium text-gray-900 flex items-center space-x-2">
                        <span>{review.customerName}</span>
                        {review.isVerifiedPurchase && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <Shield className="h-3 w-3 mr-1" />
                            Verified Purchase
                          </span>
                        )}
                      </h5>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <h6 className="font-semibold text-gray-900 mb-2">{review.title}</h6>
                  
                  {review.comment && (
                    <p className="text-gray-700 mb-4 leading-relaxed">{review.comment}</p>
                  )}

                  {/* Review Images */}
                  {review.imageUrls.length > 0 && (
                    <div className="flex space-x-2 mb-4">
                      {review.imageUrls.map((imageUrl, index) => (
                        <img
                          key={index}
                          src={imageUrl}
                          alt={`Review image ${index + 1}`}
                          className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                        />
                      ))}
                    </div>
                  )}

                  {/* Helpful Votes */}
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">Was this helpful?</span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleVoteOnReview(review.id, true)}
                        className="flex items-center space-x-1 text-sm text-gray-600 hover:text-green-600 transition-colors"
                      >
                        <ThumbsUp className="h-4 w-4" />
                        <span>{review.helpfulVotes}</span>
                      </button>
                      <button
                        onClick={() => handleVoteOnReview(review.id, false)}
                        className="flex items-center space-x-1 text-sm text-gray-600 hover:text-red-600 transition-colors"
                      >
                        <ThumbsDown className="h-4 w-4" />
                        <span>{review.totalVotes - review.helpfulVotes}</span>
                      </button>
                    </div>
                  </div>

                  {/* Vendor Response */}
                  {review.vendorResponse && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h6 className="font-medium text-blue-900 mb-2">Vendor Response</h6>
                      <p className="text-blue-800 text-sm">{review.vendorResponse}</p>
                      <p className="text-xs text-blue-600 mt-2">
                        {new Date(review.vendorResponseDate!).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductReviewSection;