
import { toast } from '@/components/ui/use-toast';

export class HttpClient {
  static async get<T>(url: string): Promise<T> {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error: any) {
      toast({
        title: "Request Failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  }

  static async post<T>(url: string, data: any): Promise<T> {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error: any) {
      toast({
        title: "Request Failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  }
}
