/*
  # Create Messaging and Support System

  1. New Tables
    - `conversations` - Customer-vendor messaging
    - `messages` - Individual messages in conversations
    - `support_tickets` - Customer support system
    - `support_responses` - Support team responses

  2. Features
    - Real-time messaging between customers and vendors
    - Support ticket system
    - Message read/unread tracking
    - File attachments support

  3. Security
    - RLS policies for message privacy
    - Admin access to all conversations
    - Vendor access to own store messages
*/

-- Conversations Table
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vendor_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  subject text NOT NULL,
  status text DEFAULT 'open' CHECK (status IN ('open', 'closed', 'resolved')),
  priority text DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  last_message_at timestamptz DEFAULT now(),
  customer_unread_count integer DEFAULT 0,
  vendor_unread_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Messages Table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message_text text NOT NULL,
  attachments text[] DEFAULT '{}',
  is_read boolean DEFAULT false,
  read_at timestamptz,
  message_type text DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
  created_at timestamptz DEFAULT now()
);

-- Support Tickets Table
CREATE TABLE IF NOT EXISTS support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ticket_number text NOT NULL UNIQUE,
  subject text NOT NULL,
  description text NOT NULL,
  category text NOT NULL CHECK (category IN ('order', 'payment', 'product', 'technical', 'account', 'other')),
  priority text DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  status text DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  assigned_to uuid REFERENCES users(id),
  order_id uuid REFERENCES orders(id),
  product_id uuid REFERENCES products(id),
  attachments text[] DEFAULT '{}',
  customer_email text,
  customer_phone text,
  resolution_notes text,
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Support Responses Table
CREATE TABLE IF NOT EXISTS support_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  responder_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  response_text text NOT NULL,
  attachments text[] DEFAULT '{}',
  is_internal boolean DEFAULT false, -- Internal notes vs customer-facing responses
  response_type text DEFAULT 'reply' CHECK (response_type IN ('reply', 'note', 'resolution')),
  created_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversations_customer_id ON conversations(customer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_vendor_id ON conversations(vendor_id);
CREATE INDEX IF NOT EXISTS idx_conversations_store_id ON conversations(store_id);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON conversations(last_message_at);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_read ON messages(is_read);

CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_category ON support_tickets(category);
CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned ON support_tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_support_tickets_number ON support_tickets(ticket_number);

CREATE INDEX IF NOT EXISTS idx_support_responses_ticket_id ON support_responses(ticket_id);
CREATE INDEX IF NOT EXISTS idx_support_responses_responder_id ON support_responses(responder_id);

-- Enable Row Level Security
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_responses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversations
CREATE POLICY "Users can read own conversations"
  ON conversations
  FOR SELECT
  TO authenticated
  USING (customer_id = uid() OR vendor_id = uid());

CREATE POLICY "Users can create conversations"
  ON conversations
  FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = uid());

CREATE POLICY "Conversation participants can update"
  ON conversations
  FOR UPDATE
  TO authenticated
  USING (customer_id = uid() OR vendor_id = uid());

CREATE POLICY "Admin can manage all conversations"
  ON conversations
  FOR ALL
  TO authenticated
  USING ((jwt() ->> 'role'::text) = 'admin'::text);

-- RLS Policies for messages
CREATE POLICY "Conversation participants can read messages"
  ON messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND (c.customer_id = uid() OR c.vendor_id = uid())
    )
  );

CREATE POLICY "Conversation participants can send messages"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND (c.customer_id = uid() OR c.vendor_id = uid())
    )
    AND sender_id = uid()
  );

CREATE POLICY "Admin can manage all messages"
  ON messages
  FOR ALL
  TO authenticated
  USING ((jwt() ->> 'role'::text) = 'admin'::text);

-- RLS Policies for support_tickets
CREATE POLICY "Users can manage own support tickets"
  ON support_tickets
  FOR ALL
  TO authenticated
  USING (user_id = uid())
  WITH CHECK (user_id = uid());

CREATE POLICY "Admin can manage all support tickets"
  ON support_tickets
  FOR ALL
  TO authenticated
  USING ((jwt() ->> 'role'::text) = 'admin'::text);

-- RLS Policies for support_responses
CREATE POLICY "Ticket owners can read responses"
  ON support_responses
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM support_tickets st
      WHERE st.id = support_responses.ticket_id
      AND st.user_id = uid()
    )
    AND is_internal = false
  );

CREATE POLICY "Admin can manage all support responses"
  ON support_responses
  FOR ALL
  TO authenticated
  USING ((jwt() ->> 'role'::text) = 'admin'::text);

-- Function to update conversation on new message
CREATE OR REPLACE FUNCTION update_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
  -- Update conversation last message time and unread counts
  UPDATE conversations 
  SET 
    last_message_at = NEW.created_at,
    customer_unread_count = CASE 
      WHEN NEW.sender_id != customer_id THEN customer_unread_count + 1
      ELSE customer_unread_count
    END,
    vendor_unread_count = CASE 
      WHEN NEW.sender_id != vendor_id THEN vendor_unread_count + 1
      ELSE vendor_unread_count
    END,
    updated_at = now()
  WHERE id = NEW.conversation_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for conversation updates
DROP TRIGGER IF EXISTS trigger_update_conversation ON messages;
CREATE TRIGGER trigger_update_conversation
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_on_message();

-- Function to generate support ticket numbers
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.ticket_number := 'TKT-' || TO_CHAR(now(), 'YYYYMMDD') || '-' || 
                       LPAD(EXTRACT(epoch FROM now())::text, 10, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for ticket number generation
DROP TRIGGER IF EXISTS trigger_generate_ticket_number ON support_tickets;
CREATE TRIGGER trigger_generate_ticket_number
  BEFORE INSERT ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION generate_ticket_number();

-- Function to track product views
CREATE OR REPLACE FUNCTION track_product_view()
RETURNS TRIGGER AS $$
BEGIN
  -- Update product view count
  UPDATE products 
  SET 
    view_count = COALESCE(view_count, 0) + 1,
    updated_at = now()
  WHERE id = NEW.product_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add view_count column to products if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'view_count'
  ) THEN
    ALTER TABLE products ADD COLUMN view_count integer DEFAULT 0;
  END IF;
END $$;

-- Trigger for product view tracking
DROP TRIGGER IF EXISTS trigger_track_product_view ON product_views;
CREATE TRIGGER trigger_track_product_view
  AFTER INSERT ON product_views
  FOR EACH ROW
  EXECUTE FUNCTION track_product_view();