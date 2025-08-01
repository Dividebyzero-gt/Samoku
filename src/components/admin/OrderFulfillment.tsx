import React, { useState, useEffect } from 'react';
import { Truck, Package, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { dropshippingService } from '../../services/dropshippingService';
import { DropshippingOrder } from '../../types/dropshipping';

interface OrderFulfillmentProps {
  orderId: string;
  productId: string;
  customerInfo: {
    name: string;
    email: string;
  };
  shippingAddress: any;
  quantity: number;
  isDropshipped: boolean;
}

const OrderFulfillment: React.FC<OrderFulfillmentProps> = ({
  orderId,
  productId,
  customerInfo,
  shippingAddress,
  quantity,
  isDropshipped
}) => {
  const [fulfillmentStatus, setFulfillmentStatus] = useState<'idle' | 'processing' | 'fulfilled' | 'error'>('idle');
  const [trackingInfo, setTrackingInfo] = useState<DropshippingOrder | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isDropshipped) {
      checkFulfillmentStatus();
    }
  }, [orderId, isDropshipped]);

  const checkFulfillmentStatus = async () => {
    try {
      const order = await dropshippingService.getOrderStatus(orderId);
      if (order) {
        setTrackingInfo(order);
        setFulfillmentStatus(order.status === 'failed' ? 'error' : 'fulfilled');
      }
    } catch (error) {
      console.error('Failed to check fulfillment status:', error);
    }
  };

  const handleFulfillOrder = async () => {
    if (!isDropshipped) return;

    try {
      setFulfillmentStatus('processing');
      setError('');

      const response = await dropshippingService.fulfillOrder({
        orderId,
        productExternalId: productId,
        customerInfo,
        shippingAddress,
        quantity
      });

      if (response.success) {
        setTrackingInfo(response.tracking);
        setFulfillmentStatus('fulfilled');
      }
    } catch (error) {
      console.error('Fulfillment failed:', error);
      setError(error.message);
      setFulfillmentStatus('error');
    }
  };

  if (!isDropshipped) {
    return (
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <Package className="h-5 w-5 text-gray-600" />
          <span className="text-sm text-gray-600">Regular vendor product - manual fulfillment required</span>
        </div>
      </div>
    );
  }

  const getStatusIcon = () => {
    switch (fulfillmentStatus) {
      case 'processing':
        return <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />;
      case 'fulfilled':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Truck className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusText = () => {
    switch (fulfillmentStatus) {
      case 'processing':
        return 'Processing fulfillment...';
      case 'fulfilled':
        return trackingInfo ? `Fulfilled - ${trackingInfo.status}` : 'Fulfilled';
      case 'error':
        return 'Fulfillment failed';
      default:
        return 'Ready to fulfill';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {getStatusIcon()}
          <div>
            <h4 className="text-sm font-medium text-gray-900">Dropshipping Fulfillment</h4>
            <p className="text-sm text-gray-600">{getStatusText()}</p>
          </div>
        </div>
        
        {fulfillmentStatus === 'idle' && (
          <button
            onClick={handleFulfillOrder}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Fulfill Order
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {trackingInfo && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Fulfillment ID:</span>
              <span className="ml-2 font-medium">{trackingInfo.externalOrderId}</span>
            </div>
            <div>
              <span className="text-gray-600">Status:</span>
              <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                trackingInfo.status === 'shipped' 
                  ? 'bg-green-100 text-green-800'
                  : trackingInfo.status === 'processing'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
              }`}>
                {trackingInfo.status}
              </span>
            </div>
          </div>

          {trackingInfo.trackingNumber && (
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-gray-600">Tracking:</span>
              <span className="font-medium">{trackingInfo.trackingNumber}</span>
              {trackingInfo.trackingUrl && (
                <a
                  href={trackingInfo.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Track</span>
                </a>
              )}
            </div>
          )}

          <div className="text-xs text-gray-500">
            Last updated: {new Date(trackingInfo.updatedAt).toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderFulfillment;