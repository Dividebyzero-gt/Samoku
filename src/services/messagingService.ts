import { supabase } from '../lib/supabase';

export interface Conversation {
  id: string;
  customerId: string;
  vendorId: string;
  storeId: string;
  productId?: string;
  orderId?: string;
  subject: string;
  status: 'open' | 'closed' | 'resolved';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  lastMessageAt: string;
  customerUnreadCount: number;
  vendorUnreadCount: number;
  createdAt: string;
  updatedAt: string;
  customer?: {
    name: string;
    email: string;
    avatarUrl?: string;
  };
  vendor?: {
    name: string;
    email: string;
    avatarUrl?: string;
  };
  store?: {
    name: string;
  };
  product?: {
    name: string;
    images: string[];
  };
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  messageText: string;
  attachments: string[];
  isRead: boolean;
  readAt?: string;
  messageType: 'text' | 'image' | 'file' | 'system';
  createdAt: string;
  sender?: {
    name: string;
    email: string;
    avatarUrl?: string;
  };
}

export interface CreateConversationData {
  vendorId: string;
  storeId: string;
  subject: string;
  productId?: string;
  orderId?: string;
  initialMessage: string;
}

export interface CreateMessageData {
  conversationId: string;
  messageText: string;
  attachments?: string[];
  messageType?: 'text' | 'image' | 'file';
}

class MessagingService {
  async getUserConversations(userId: string): Promise<Conversation[]> {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          customer:users!conversations_customer_id_fkey(name, email, avatar_url),
          vendor:users!conversations_vendor_id_fkey(name, email, avatar_url),
          store:stores(name),
          product:products(name, images)
        `)
        .or(`customer_id.eq.${userId},vendor_id.eq.${userId}`)
        .order('last_message_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data.map(this.mapConversation);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
      throw error;
    }
  }

  async getConversation(conversationId: string): Promise<Conversation | null> {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          customer:users!conversations_customer_id_fkey(name, email, avatar_url),
          vendor:users!conversations_vendor_id_fkey(name, email, avatar_url),
          store:stores(name),
          product:products(name, images)
        `)
        .eq('id', conversationId)
        .single();

      if (error) {
        throw error;
      }

      return this.mapConversation(data);
    } catch (error) {
      console.error('Failed to fetch conversation:', error);
      return null;
    }
  }

  async getConversationMessages(conversationId: string): Promise<Message[]> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:users(name, email, avatar_url)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        throw error;
      }

      return data.map(this.mapMessage);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      throw error;
    }
  }

  async createConversation(conversationData: CreateConversationData, customerId: string): Promise<Conversation> {
    try {
      // Create conversation
      const { data: conversation, error: conversationError } = await supabase
        .from('conversations')
        .insert({
          customer_id: customerId,
          vendor_id: conversationData.vendorId,
          store_id: conversationData.storeId,
          product_id: conversationData.productId,
          order_id: conversationData.orderId,
          subject: conversationData.subject,
          vendor_unread_count: 1
        })
        .select(`
          *,
          customer:users!conversations_customer_id_fkey(name, email, avatar_url),
          vendor:users!conversations_vendor_id_fkey(name, email, avatar_url),
          store:stores(name),
          product:products(name, images)
        `)
        .single();

      if (conversationError) {
        throw conversationError;
      }

      // Create initial message
      await this.sendMessage({
        conversationId: conversation.id,
        messageText: conversationData.initialMessage
      }, customerId);

      return this.mapConversation(conversation);
    } catch (error) {
      console.error('Failed to create conversation:', error);
      throw error;
    }
  }

  async sendMessage(messageData: CreateMessageData, senderId: string): Promise<Message> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: messageData.conversationId,
          sender_id: senderId,
          message_text: messageData.messageText,
          attachments: messageData.attachments || [],
          message_type: messageData.messageType || 'text'
        })
        .select(`
          *,
          sender:users(name, email, avatar_url)
        `)
        .single();

      if (error) {
        throw error;
      }

      return this.mapMessage(data);
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }

  async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    try {
      // Mark messages as read
      const { error: messageError } = await supabase
        .from('messages')
        .update({ 
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('conversation_id', conversationId)
        .neq('sender_id', userId)
        .eq('is_read', false);

      if (messageError) {
        throw messageError;
      }

      // Reset unread count for this user
      const { data: conversation } = await supabase
        .from('conversations')
        .select('customer_id, vendor_id')
        .eq('id', conversationId)
        .single();

      if (conversation) {
        const updateField = conversation.customer_id === userId 
          ? 'customer_unread_count' 
          : 'vendor_unread_count';

        await supabase
          .from('conversations')
          .update({ [updateField]: 0 })
          .eq('id', conversationId);
      }
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
      throw error;
    }
  }

  async closeConversation(conversationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('conversations')
        .update({ 
          status: 'closed',
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Failed to close conversation:', error);
      throw error;
    }
  }

  async getUnreadMessageCount(userId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('customer_unread_count, vendor_unread_count, customer_id, vendor_id')
        .or(`customer_id.eq.${userId},vendor_id.eq.${userId}`);

      if (error) {
        throw error;
      }

      let totalUnread = 0;
      data.forEach(conversation => {
        if (conversation.customer_id === userId) {
          totalUnread += conversation.customer_unread_count;
        } else if (conversation.vendor_id === userId) {
          totalUnread += conversation.vendor_unread_count;
        }
      });

      return totalUnread;
    } catch (error) {
      console.error('Failed to get unread message count:', error);
      return 0;
    }
  }

  private mapConversation(dbConversation: any): Conversation {
    return {
      id: dbConversation.id,
      customerId: dbConversation.customer_id,
      vendorId: dbConversation.vendor_id,
      storeId: dbConversation.store_id,
      productId: dbConversation.product_id,
      orderId: dbConversation.order_id,
      subject: dbConversation.subject,
      status: dbConversation.status,
      priority: dbConversation.priority,
      lastMessageAt: dbConversation.last_message_at,
      customerUnreadCount: dbConversation.customer_unread_count,
      vendorUnreadCount: dbConversation.vendor_unread_count,
      createdAt: dbConversation.created_at,
      updatedAt: dbConversation.updated_at,
      customer: dbConversation.customer ? {
        name: dbConversation.customer.name,
        email: dbConversation.customer.email,
        avatarUrl: dbConversation.customer.avatar_url
      } : undefined,
      vendor: dbConversation.vendor ? {
        name: dbConversation.vendor.name,
        email: dbConversation.vendor.email,
        avatarUrl: dbConversation.vendor.avatar_url
      } : undefined,
      store: dbConversation.store ? {
        name: dbConversation.store.name
      } : undefined,
      product: dbConversation.product ? {
        name: dbConversation.product.name,
        images: dbConversation.product.images
      } : undefined
    };
  }

  private mapMessage(dbMessage: any): Message {
    return {
      id: dbMessage.id,
      conversationId: dbMessage.conversation_id,
      senderId: dbMessage.sender_id,
      messageText: dbMessage.message_text,
      attachments: dbMessage.attachments || [],
      isRead: dbMessage.is_read,
      readAt: dbMessage.read_at,
      messageType: dbMessage.message_type,
      createdAt: dbMessage.created_at,
      sender: dbMessage.sender ? {
        name: dbMessage.sender.name,
        email: dbMessage.sender.email,
        avatarUrl: dbMessage.sender.avatar_url
      } : undefined
    };
  }
}

export const messagingService = new MessagingService();