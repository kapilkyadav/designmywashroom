
-- Create scheduled_jobs table
CREATE TABLE IF NOT EXISTS public.scheduled_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE,
  job_type TEXT NOT NULL,
  schedule TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  last_run TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index on job_type and status for efficient querying
CREATE INDEX IF NOT EXISTS idx_scheduled_jobs_type_status ON public.scheduled_jobs(job_type, status);
