-- Create tables for RC Generator application

-- User balance table
CREATE TABLE public.user_balance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  balance DECIMAL(10,2) NOT NULL DEFAULT 100.00,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Transactions table
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_number TEXT NOT NULL,
  cost DECIMAL(10,2) NOT NULL,
  type TEXT NOT NULL DEFAULT 'rc_generation',
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Cached RC data table
CREATE TABLE public.cached_rc_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_number TEXT NOT NULL UNIQUE,
  rc_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Top-up transactions table
CREATE TABLE public.topup_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  amount DECIMAL(10,2) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (for future authentication if needed)
ALTER TABLE public.user_balance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cached_rc_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topup_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations for now (public access)
CREATE POLICY "Allow all access to user_balance" ON public.user_balance FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to transactions" ON public.transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to cached_rc_data" ON public.cached_rc_data FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to topup_transactions" ON public.topup_transactions FOR ALL USING (true) WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_user_balance_updated_at
  BEFORE UPDATE ON public.user_balance
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cached_rc_data_updated_at
  BEFORE UPDATE ON public.cached_rc_data
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial balance record
INSERT INTO public.user_balance (balance) VALUES (100.00);