
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { ProjectInfoValues, projectInfoSchema } from '../types';
import { ConvertibleRecord } from '@/services/RealProjectService';

export function useProjectInfoForm(recordToConvert?: ConvertibleRecord) {
  const projectInfoForm = useForm<ProjectInfoValues>({
    resolver: zodResolver(projectInfoSchema),
    defaultValues: {
      client_name: recordToConvert?.client_name || '',
      client_email: recordToConvert?.client_email || '',
      client_mobile: recordToConvert?.client_mobile || '',
      client_location: recordToConvert?.client_location || '',
      address: '',
      floor_number: '',
      service_lift_available: false,
      project_type: 'Not Specified',
      selected_brand: 'none',
    }
  });

  // Log the form values when recordToConvert changes
  useEffect(() => {
    if (recordToConvert) {
      console.log("Record to convert:", recordToConvert);
      console.log("Form values:", projectInfoForm.getValues());
    }
  }, [recordToConvert]);

  return projectInfoForm;
}
