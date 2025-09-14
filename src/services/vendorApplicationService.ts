import { supabase } from '../lib/supabase';
import { VendorApplication } from '../types/enhanced';

export interface CreateApplicationData {
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
  documents?: {
    businessLicense?: string;
    taxCertificate?: string;
    identityDocument?: string;
    bankingInfo?: string;
  };
}

class VendorApplicationService {
  async createApplication(applicationData: CreateApplicationData, userId: string): Promise<VendorApplication> {
    try {
      const { data, error } = await supabase
        .from('vendor_applications')
        .insert({
          user_id: userId,
          business_name: applicationData.businessName,
          business_type: applicationData.businessType,
          business_registration_number: applicationData.businessRegistrationNumber,
          tax_id: applicationData.taxId,
          business_address: applicationData.businessAddress,
          contact_person: applicationData.contactPerson,
          phone: applicationData.phone,
          website: applicationData.website,
          business_description: applicationData.businessDescription,
          product_categories: applicationData.productCategories,
          expected_monthly_sales: applicationData.expectedMonthlySales,
          previous_experience: applicationData.previousExperience,
          documents: applicationData.documents || {},
          status: 'pending',
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.mapApplication(data);
    } catch (error) {
      console.error('Failed to create vendor application:', error);
      throw error;
    }
  }

  async getApplication(userId: string): Promise<VendorApplication | null> {
    try {
      const { data, error } = await supabase
        .from('vendor_applications')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No application found
        }
        throw error;
      }

      return this.mapApplication(data);
    } catch (error) {
      console.error('Failed to fetch vendor application:', error);
      return null;
    }
  }

  async getAllApplications(status?: VendorApplication['status']): Promise<VendorApplication[]> {
    try {
      let query = supabase
        .from('vendor_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data.map(this.mapApplication);
    } catch (error) {
      console.error('Failed to fetch vendor applications:', error);
      throw error;
    }
  }

  async updateApplicationStatus(
    applicationId: string, 
    status: VendorApplication['status'],
    reviewNotes?: string,
    reviewerId?: string
  ): Promise<VendorApplication> {
    try {
      const { data, error } = await supabase
        .from('vendor_applications')
        .update({
          status,
          review_notes: reviewNotes,
          reviewed_by: reviewerId,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', applicationId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // If approved, update user role and create store
      if (status === 'approved') {
        await this.approveVendorApplication(data);
      }

      return this.mapApplication(data);
    } catch (error) {
      console.error('Failed to update application status:', error);
      throw error;
    }
  }

  async updateApplication(applicationId: string, updates: Partial<CreateApplicationData>): Promise<VendorApplication> {
    try {
      const { data, error } = await supabase
        .from('vendor_applications')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', applicationId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.mapApplication(data);
    } catch (error) {
      console.error('Failed to update vendor application:', error);
      throw error;
    }
  }

  private async approveVendorApplication(application: any): Promise<void> {
    try {
      // Update user role to vendor
      const { error: userError } = await supabase
        .from('users')
        .update({ role: 'vendor' })
        .eq('id', application.user_id);

      if (userError) {
        console.error('Failed to update user role:', userError);
      }

      // Create store for the approved vendor
      const { error: storeError } = await supabase
        .from('stores')
        .insert({
          user_id: application.user_id,
          name: application.business_name,
          description: application.business_description,
          is_approved: true,
          is_active: true,
        });

      if (storeError) {
        console.error('Failed to create store:', storeError);
      }
    } catch (error) {
      console.error('Failed to complete vendor approval:', error);
    }
  }

  private mapApplication(dbApplication: any): VendorApplication {
    return {
      id: dbApplication.id,
      userId: dbApplication.user_id,
      businessName: dbApplication.business_name,
      businessType: dbApplication.business_type,
      businessRegistrationNumber: dbApplication.business_registration_number,
      taxId: dbApplication.tax_id,
      businessAddress: dbApplication.business_address,
      contactPerson: dbApplication.contact_person,
      phone: dbApplication.phone,
      website: dbApplication.website,
      businessDescription: dbApplication.business_description,
      productCategories: dbApplication.product_categories,
      expectedMonthlySales: dbApplication.expected_monthly_sales,
      previousExperience: dbApplication.previous_experience,
      documents: dbApplication.documents || {},
      status: dbApplication.status,
      reviewNotes: dbApplication.review_notes,
      reviewedBy: dbApplication.reviewed_by,
      reviewedAt: dbApplication.reviewed_at,
      createdAt: dbApplication.created_at,
      updatedAt: dbApplication.updated_at,
    };
  }
}

export const vendorApplicationService = new VendorApplicationService();