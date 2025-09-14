import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building, 
  Upload, 
  FileText, 
  CreditCard, 
  MapPin, 
  Phone, 
  Mail,
  Check,
  AlertCircle,
  Clock
} from 'lucide-react';
import { vendorApplicationService, CreateApplicationData } from '../../services/vendorApplicationService';
import { useAuth } from '../../contexts/AuthContext';
import { VendorApplication } from '../../types/enhanced';

const VendorApplicationPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [existingApplication, setExistingApplication] = useState<VendorApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<CreateApplicationData>({
    businessName: '',
    businessType: 'individual',
    businessRegistrationNumber: '',
    taxId: '',
    businessAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States'
    },
    contactPerson: user?.name || '',
    phone: '',
    website: '',
    businessDescription: '',
    productCategories: [],
    expectedMonthlySales: undefined,
    previousExperience: '',
    documents: {}
  });

  const productCategories = [
    'Electronics', 'Fashion', 'Home & Kitchen', 'Beauty & Health',
    'Sports & Recreation', 'Toys & Games', 'Automotive', 'Baby & Kids',
    'Pet Supplies', 'Books & Media', 'Art & Crafts', 'Jewelry & Accessories'
  ];

  useEffect(() => {
    checkExistingApplication();
  }, [user]);

  const checkExistingApplication = async () => {
    if (!user) return;

    try {
      const application = await vendorApplicationService.getApplication(user.id);
      setExistingApplication(application);
      
      if (application) {
        setFormData({
          businessName: application.businessName,
          businessType: application.businessType,
          businessRegistrationNumber: application.businessRegistrationNumber || '',
          taxId: application.taxId || '',
          businessAddress: application.businessAddress,
          contactPerson: application.contactPerson,
          phone: application.phone,
          website: application.website || '',
          businessDescription: application.businessDescription,
          productCategories: application.productCategories,
          expectedMonthlySales: application.expectedMonthlySales,
          previousExperience: application.previousExperience || '',
          documents: application.documents
        });
      }
    } catch (error) {
      console.error('Failed to load existing application:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    if (name.startsWith('businessAddress.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        businessAddress: {
          ...prev.businessAddress,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleCategoryToggle = (category: string) => {
    setFormData(prev => ({
      ...prev,
      productCategories: prev.productCategories.includes(category)
        ? prev.productCategories.filter(c => c !== category)
        : [...prev.productCategories, category]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    try {
      setSubmitting(true);
      
      if (existingApplication) {
        await vendorApplicationService.updateApplication(existingApplication.id, formData);
      } else {
        await vendorApplicationService.createApplication(formData, user.id);
      }

      navigate('/vendor/application-status');
    } catch (error) {
      console.error('Failed to submit application:', error);
      alert('Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show status if application exists
  if (existingApplication && existingApplication.status !== 'rejected') {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            {existingApplication.status === 'approved' ? (
              <Check className="h-16 w-16 text-green-600 mx-auto mb-6" />
            ) : existingApplication.status === 'under_review' ? (
              <Clock className="h-16 w-16 text-orange-600 mx-auto mb-6" />
            ) : (
              <AlertCircle className="h-16 w-16 text-blue-600 mx-auto mb-6" />
            )}
            
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {existingApplication.status === 'approved' ? 'Application Approved!' :
               existingApplication.status === 'under_review' ? 'Application Under Review' :
               'Application Pending'}
            </h1>
            
            <p className="text-gray-600 mb-6">
              {existingApplication.status === 'approved' 
                ? 'Congratulations! Your vendor application has been approved. You can now start selling on Samoku.'
                : existingApplication.status === 'under_review'
                ? 'Our team is currently reviewing your application. We\'ll notify you once the review is complete.'
                : 'Thank you for your application. Our team will review it within 2-3 business days.'
              }
            </p>

            {existingApplication.reviewNotes && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <h4 className="font-medium text-gray-900 mb-2">Review Notes:</h4>
                <p className="text-gray-700">{existingApplication.reviewNotes}</p>
              </div>
            )}

            <div className="flex justify-center space-x-4">
              {existingApplication.status === 'approved' ? (
                <button
                  onClick={() => navigate('/vendor')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Go to Dashboard
                </button>
              ) : (
                <button
                  onClick={() => navigate('/')}
                  className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Back to Home
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Name *
            </label>
            <input
              type="text"
              name="businessName"
              required
              value={formData.businessName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Type *
            </label>
            <select
              name="businessType"
              required
              value={formData.businessType}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="individual">Individual/Sole Proprietorship</option>
              <option value="llc">LLC</option>
              <option value="corporation">Corporation</option>
              <option value="partnership">Partnership</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Registration Number
            </label>
            <input
              type="text"
              name="businessRegistrationNumber"
              value={formData.businessRegistrationNumber}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tax ID / EIN
            </label>
            <input
              type="text"
              name="taxId"
              value={formData.taxId}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Description *
          </label>
          <textarea
            name="businessDescription"
            required
            rows={4}
            value={formData.businessDescription}
            onChange={handleInputChange}
            placeholder="Describe your business, the products you plan to sell, and your experience..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact & Address Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Person *
            </label>
            <input
              type="text"
              name="contactPerson"
              required
              value={formData.contactPerson}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              name="phone"
              required
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Website
            </label>
            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleInputChange}
              placeholder="https://"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="mt-6">
          <h4 className="text-md font-semibold text-gray-900 mb-4">Business Address</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Street Address *
              </label>
              <input
                type="text"
                name="businessAddress.street"
                required
                value={formData.businessAddress.street}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City *
              </label>
              <input
                type="text"
                name="businessAddress.city"
                required
                value={formData.businessAddress.city}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State *
              </label>
              <input
                type="text"
                name="businessAddress.state"
                required
                value={formData.businessAddress.state}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ZIP Code *
              </label>
              <input
                type="text"
                name="businessAddress.zipCode"
                required
                value={formData.businessAddress.zipCode}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country *
              </label>
              <select
                name="businessAddress.country"
                required
                value={formData.businessAddress.country}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="United States">United States</option>
                <option value="Canada">Canada</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Australia">Australia</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Categories & Experience</h3>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Product Categories * (Select all that apply)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {productCategories.map((category) => (
              <label key={category} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.productCategories.includes(category)}
                  onChange={() => handleCategoryToggle(category)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{category}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expected Monthly Sales
            </label>
            <select
              name="expectedMonthlySales"
              value={formData.expectedMonthlySales || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select range</option>
              <option value="1000">Under $1,000</option>
              <option value="5000">$1,000 - $5,000</option>
              <option value="15000">$5,000 - $15,000</option>
              <option value="50000">$15,000 - $50,000</option>
              <option value="100000">$50,000+</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Previous E-commerce Experience
          </label>
          <textarea
            name="previousExperience"
            rows={4}
            value={formData.previousExperience}
            onChange={handleInputChange}
            placeholder="Tell us about your previous experience selling online, managing inventory, customer service, etc."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Upload</h3>
        <p className="text-gray-600 mb-6">
          Upload the required documents to verify your business. All documents are securely encrypted.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { key: 'businessLicense', label: 'Business License', required: true },
            { key: 'taxCertificate', label: 'Tax Certificate', required: false },
            { key: 'identityDocument', label: 'Government ID', required: true },
            { key: 'bankingInfo', label: 'Banking Information', required: true }
          ].map((doc) => (
            <div key={doc.key} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">{doc.label}</h4>
                {doc.required && <span className="text-red-500 text-sm">Required</span>}
              </div>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-500">PDF, JPG, PNG up to 10MB</p>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-blue-900">Document Requirements</h4>
              <ul className="text-sm text-blue-800 mt-2 space-y-1">
                <li>• Business License: Required for all business types</li>
                <li>• Government ID: Valid driver's license or passport</li>
                <li>• Banking Info: Bank statement or voided check</li>
                <li>• Tax Certificate: Sales tax permit (if applicable)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const steps = [
    { number: 1, title: 'Business Info', icon: Building },
    { number: 2, title: 'Contact & Address', icon: MapPin },
    { number: 3, title: 'Products & Experience', icon: FileText },
    { number: 4, title: 'Documents', icon: Upload }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Vendor Application</h1>
          <p className="text-gray-600">Join thousands of successful vendors on Samoku</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;
              
              return (
                <div key={step.number} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    isCompleted 
                      ? 'bg-green-600 border-green-600 text-white'
                      : isActive
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'border-gray-300 text-gray-500'
                  }`}>
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <div className="ml-3 hidden sm:block">
                    <p className={`text-sm font-medium ${
                      isActive || isCompleted ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-4 ${
                      isCompleted ? 'bg-green-600' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}

            {/* Navigation */}
            <div className="flex justify-between pt-8 border-t border-gray-200">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitting || formData.productCategories.length === 0}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Submit Application</span>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VendorApplicationPage;