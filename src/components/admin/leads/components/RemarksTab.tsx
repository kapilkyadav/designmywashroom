
import React, { useState } from 'react';
import { format } from 'date-fns';
import { LeadRemark, LeadService } from '@/services/LeadService';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { MessageCircle, Send, AlertCircle, Clock } from 'lucide-react';

interface RemarksTabProps {
  leadId: string;
  isLoading: boolean;
  remarks: LeadRemark[];
  onRemarkAdded: (newRemark: string) => void;
  currentRemark?: string | null;
}

const RemarksTab: React.FC<RemarksTabProps> = ({ 
  leadId, 
  isLoading, 
  remarks, 
  onRemarkAdded,
  currentRemark 
}) => {
  const { toast } = useToast();
  const [newRemark, setNewRemark] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleAddRemark = async () => {
    if (!newRemark.trim()) {
      toast({
        title: "Cannot add empty remark",
        description: "Please enter some text for your remark.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const result = await LeadService.addRemark(leadId, newRemark);
      
      if (result) {
        // Pass the new remark back to the parent component
        onRemarkAdded(newRemark);
        setNewRemark('');
      }
    } catch (error) {
      console.error('Error adding remark:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <div className="flex flex-col space-y-2">
          <Textarea 
            placeholder="Add a new remark about this lead..."
            value={newRemark}
            onChange={(e) => setNewRemark(e.target.value)}
            className="resize-none"
            rows={3}
          />
          <div className="flex justify-end">
            <Button 
              onClick={handleAddRemark} 
              disabled={isSubmitting || !newRemark.trim()}
              size="sm"
            >
              {isSubmitting ? (
                <>Saving...</>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Add Remark
                </>
              )}
            </Button>
          </div>
        </div>
        
        <div className="border-t pt-4">
          <h3 className="text-sm font-medium mb-3 text-muted-foreground flex items-center">
            <MessageCircle className="h-4 w-4 mr-2" />
            Current Remark
          </h3>
          
          {currentRemark ? (
            <div className="bg-muted/50 rounded-md p-3 mb-6">
              <div className="flex justify-between items-start">
                <p className="whitespace-pre-wrap text-sm">{currentRemark}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-3 mb-6 text-muted-foreground flex flex-col items-center">
              <p>No current remark.</p>
            </div>
          )}

          <h3 className="text-sm font-medium mb-3 text-muted-foreground flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            Remark History
          </h3>
          
          {isLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin h-6 w-6 border-2 border-primary rounded-full border-t-transparent"></div>
            </div>
          ) : remarks && remarks.length > 0 ? (
            <div className="space-y-3">
              {remarks.map((remark) => (
                <div key={remark.id} className="bg-muted/30 rounded-md p-3 border-l-2 border-primary">
                  <p className="whitespace-pre-wrap text-sm mb-2">{remark.remark}</p>
                  <p className="text-xs text-muted-foreground">
                    Added on {formatDate(remark.created_at)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground flex flex-col items-center">
              <AlertCircle className="h-8 w-8 mb-2 opacity-50" />
              <p>No previous remarks available.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RemarksTab;
