import { supabase } from '../lib/supabase';

export interface SupportTicket {
  id: string;
  userId: string;
  ticketNumber: string;
  subject: string;
  description: string;
  category: 'order' | 'payment' | 'product' | 'technical' | 'account' | 'other';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  assignedTo?: string;
  orderId?: string;
  productId?: string;
  attachments: string[];
  customerEmail?: string;
  customerPhone?: string;
  resolutionNotes?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    name: string;
    email: string;
  };
  assignedAgent?: {
    name: string;
    email: string;
  };
  responses?: SupportResponse[];
}

export interface SupportResponse {
  id: string;
  ticketId: string;
  responderId: string;
  responseText: string;
  attachments: string[];
  isInternal: boolean;
  responseType: 'reply' | 'note' | 'resolution';
  createdAt: string;
  responder?: {
    name: string;
    email: string;
  };
}

export interface CreateTicketData {
  subject: string;
  description: string;
  category: SupportTicket['category'];
  priority?: SupportTicket['priority'];
  orderId?: string;
  productId?: string;
  attachments?: string[];
  customerEmail?: string;
  customerPhone?: string;
}

export interface CreateResponseData {
  ticketId: string;
  responseText: string;
  attachments?: string[];
  isInternal?: boolean;
  responseType?: SupportResponse['responseType'];
}

class SupportService {
  async createTicket(ticketData: CreateTicketData, userId: string): Promise<SupportTicket> {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .insert({
          user_id: userId,
          subject: ticketData.subject,
          description: ticketData.description,
          category: ticketData.category,
          priority: ticketData.priority || 'normal',
          order_id: ticketData.orderId,
          product_id: ticketData.productId,
          attachments: ticketData.attachments || [],
          customer_email: ticketData.customerEmail,
          customer_phone: ticketData.customerPhone
        })
        .select(`
          *,
          user:users(name, email)
        `)
        .single();

      if (error) {
        throw error;
      }

      return this.mapTicket(data);
    } catch (error) {
      console.error('Failed to create support ticket:', error);
      throw error;
    }
  }

  async getUserTickets(userId: string): Promise<SupportTicket[]> {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select(`
          *,
          user:users(name, email),
          assigned_agent:users!support_tickets_assigned_to_fkey(name, email)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data.map(this.mapTicket);
    } catch (error) {
      console.error('Failed to fetch user tickets:', error);
      throw error;
    }
  }

  async getAllTickets(status?: SupportTicket['status'], category?: SupportTicket['category']): Promise<SupportTicket[]> {
    try {
      let query = supabase
        .from('support_tickets')
        .select(`
          *,
          user:users(name, email),
          assigned_agent:users!support_tickets_assigned_to_fkey(name, email)
        `)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data.map(this.mapTicket);
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
      throw error;
    }
  }

  async getTicket(ticketId: string): Promise<SupportTicket | null> {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select(`
          *,
          user:users(name, email),
          assigned_agent:users!support_tickets_assigned_to_fkey(name, email)
        `)
        .eq('id', ticketId)
        .single();

      if (error) {
        throw error;
      }

      // Get responses
      const responses = await this.getTicketResponses(ticketId);

      return {
        ...this.mapTicket(data),
        responses
      };
    } catch (error) {
      console.error('Failed to fetch ticket:', error);
      return null;
    }
  }

  async getTicketResponses(ticketId: string): Promise<SupportResponse[]> {
    try {
      const { data, error } = await supabase
        .from('support_responses')
        .select(`
          *,
          responder:users(name, email)
        `)
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      if (error) {
        throw error;
      }

      return data.map(this.mapResponse);
    } catch (error) {
      console.error('Failed to fetch ticket responses:', error);
      throw error;
    }
  }

  async addResponse(responseData: CreateResponseData, responderId: string): Promise<SupportResponse> {
    try {
      const { data, error } = await supabase
        .from('support_responses')
        .insert({
          ticket_id: responseData.ticketId,
          responder_id: responderId,
          response_text: responseData.responseText,
          attachments: responseData.attachments || [],
          is_internal: responseData.isInternal || false,
          response_type: responseData.responseType || 'reply'
        })
        .select(`
          *,
          responder:users(name, email)
        `)
        .single();

      if (error) {
        throw error;
      }

      // Update ticket status if this is a resolution
      if (responseData.responseType === 'resolution') {
        await this.updateTicketStatus(responseData.ticketId, 'resolved', responseData.responseText);
      } else {
        // Update ticket to in_progress if it was open
        await supabase
          .from('support_tickets')
          .update({ 
            status: 'in_progress',
            updated_at: new Date().toISOString()
          })
          .eq('id', responseData.ticketId)
          .eq('status', 'open');
      }

      return this.mapResponse(data);
    } catch (error) {
      console.error('Failed to add response:', error);
      throw error;
    }
  }

  async updateTicketStatus(
    ticketId: string, 
    status: SupportTicket['status'], 
    resolutionNotes?: string
  ): Promise<SupportTicket> {
    try {
      const updates: any = {
        status,
        updated_at: new Date().toISOString()
      };

      if (status === 'resolved' && resolutionNotes) {
        updates.resolution_notes = resolutionNotes;
        updates.resolved_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('support_tickets')
        .update(updates)
        .eq('id', ticketId)
        .select(`
          *,
          user:users(name, email),
          assigned_agent:users!support_tickets_assigned_to_fkey(name, email)
        `)
        .single();

      if (error) {
        throw error;
      }

      return this.mapTicket(data);
    } catch (error) {
      console.error('Failed to update ticket status:', error);
      throw error;
    }
  }

  async assignTicket(ticketId: string, agentId: string): Promise<SupportTicket> {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .update({ 
          assigned_to: agentId,
          status: 'in_progress',
          updated_at: new Date().toISOString()
        })
        .eq('id', ticketId)
        .select(`
          *,
          user:users(name, email),
          assigned_agent:users!support_tickets_assigned_to_fkey(name, email)
        `)
        .single();

      if (error) {
        throw error;
      }

      return this.mapTicket(data);
    } catch (error) {
      console.error('Failed to assign ticket:', error);
      throw error;
    }
  }

  async getTicketStats(): Promise<{
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    averageResponseTime: number;
  }> {
    try {
      const { data: tickets } = await supabase
        .from('support_tickets')
        .select('status, created_at, resolved_at');

      if (!tickets) {
        return { total: 0, open: 0, inProgress: 0, resolved: 0, averageResponseTime: 0 };
      }

      const total = tickets.length;
      const open = tickets.filter(t => t.status === 'open').length;
      const inProgress = tickets.filter(t => t.status === 'in_progress').length;
      const resolved = tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length;

      // Calculate average response time for resolved tickets
      const resolvedTickets = tickets.filter(t => t.resolved_at);
      const averageResponseTime = resolvedTickets.length > 0
        ? resolvedTickets.reduce((sum, ticket) => {
            const created = new Date(ticket.created_at);
            const resolved = new Date(ticket.resolved_at);
            return sum + (resolved.getTime() - created.getTime());
          }, 0) / resolvedTickets.length / (1000 * 60 * 60) // Convert to hours
        : 0;

      return {
        total,
        open,
        inProgress,
        resolved,
        averageResponseTime: Math.round(averageResponseTime * 10) / 10
      };
    } catch (error) {
      console.error('Failed to get ticket stats:', error);
      return { total: 0, open: 0, inProgress: 0, resolved: 0, averageResponseTime: 0 };
    }
  }

  private mapTicket(dbTicket: any): SupportTicket {
    return {
      id: dbTicket.id,
      userId: dbTicket.user_id,
      ticketNumber: dbTicket.ticket_number,
      subject: dbTicket.subject,
      description: dbTicket.description,
      category: dbTicket.category,
      priority: dbTicket.priority,
      status: dbTicket.status,
      assignedTo: dbTicket.assigned_to,
      orderId: dbTicket.order_id,
      productId: dbTicket.product_id,
      attachments: dbTicket.attachments || [],
      customerEmail: dbTicket.customer_email,
      customerPhone: dbTicket.customer_phone,
      resolutionNotes: dbTicket.resolution_notes,
      resolvedAt: dbTicket.resolved_at,
      createdAt: dbTicket.created_at,
      updatedAt: dbTicket.updated_at,
      user: dbTicket.user ? {
        name: dbTicket.user.name,
        email: dbTicket.user.email
      } : undefined,
      assignedAgent: dbTicket.assigned_agent ? {
        name: dbTicket.assigned_agent.name,
        email: dbTicket.assigned_agent.email
      } : undefined
    };
  }

  private mapResponse(dbResponse: any): SupportResponse {
    return {
      id: dbResponse.id,
      ticketId: dbResponse.ticket_id,
      responderId: dbResponse.responder_id,
      responseText: dbResponse.response_text,
      attachments: dbResponse.attachments || [],
      isInternal: dbResponse.is_internal,
      responseType: dbResponse.response_type,
      createdAt: dbResponse.created_at,
      responder: dbResponse.responder ? {
        name: dbResponse.responder.name,
        email: dbResponse.responder.email
      } : undefined
    };
  }
}

export const supportService = new SupportService();