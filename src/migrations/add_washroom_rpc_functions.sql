
-- Create RPC function to increment washroom count
CREATE OR REPLACE FUNCTION public.increment_washroom_count(p_project_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE real_projects
    SET washroom_count = washroom_count + 1
    WHERE id = p_project_id;
END;
$$;

-- Create RPC function to update washroom count
CREATE OR REPLACE FUNCTION public.update_washroom_count(p_project_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE real_projects
    SET washroom_count = (
        SELECT COUNT(*) 
        FROM project_washrooms 
        WHERE project_id = p_project_id
    )
    WHERE id = p_project_id;
END;
$$;

-- Add wall_area and ceiling_area columns to project_washrooms if they don't exist
ALTER TABLE project_washrooms 
ADD COLUMN IF NOT EXISTS wall_area numeric;

ALTER TABLE project_washrooms 
ADD COLUMN IF NOT EXISTS ceiling_area numeric;

COMMENT ON COLUMN project_washrooms.wall_area IS 'The total wall area in square feet';
COMMENT ON COLUMN project_washrooms.ceiling_area IS 'The ceiling area in square feet, typically same as floor area';
