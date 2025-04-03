
import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format, parseISO } from 'date-fns';
import { CalendarIcon, Pencil, Save, X, ExternalLink } from 'lucide-react';
import { DatePicker } from '@/components/ui/date-picker';
import { useToast } from '@/hooks/use-toast';
import { Lead, LeadActivityLog } from '@/services/leads/types';
import { LeadCrudService } from '@/services/leads/LeadCrudService';
import { ActivityLogService } from '@/services/leads/ActivityLogService';
import ConvertLeadDialog from './ConvertLeadDialog';

interface LeadDetailsDialogProps {
  lead: Lead;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

const LeadDetailsDialog: React.FC<LeadDetailsDialogProps> = ({ lead, open, onOpenChange, onUpdate }) => {
  const [editMode, setEditMode] = useState(false);
  const [updatedLead, setUpdatedLead] = useState<Partial<Lead>>({});
  const [activityLogs, setActivityLogs] = useState<LeadActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newRemark, setNewRemark] = useState('');
  const [isConvertDialogOpen, setIsConvertDialogOpen] = useState(false);
  const { toast } = useToast();

  // Fetch activity logs when dialog opens
  useEffect(() => {
    if (open && lead) {
      fetchActivityLogs();
    }
  }, [open, lead]);

  const fetchActivityLogs = async () => {
    if (!lead) return;
    
    const logs = await ActivityLogService.getLeadActivityLogs(lead.id);
    setActivityLogs(logs);
  };

  const handleInputChange = (field: keyof Lead, value: any) => {
    setUpdatedLead(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveChanges = async () => {
    if (!lead) return;
    
    setIsLoading(true);
    try {
      const result = await LeadCrudService.updateLead(lead.id, updatedLead);
      if (result) {
        toast({
          title: "Lead updated",
          description: "The lead has been successfully updated.",
        });
        setEditMode(false);
        onUpdate();
      }
    } catch (error) {
      console.error('Error updating lead:', error);
      toast({
        title: "Error",
        description: "Failed to update lead",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRemark = async () => {
    if (!newRemark.trim() || !lead) return;
    
    setIsLoading(true);
    try {
      await ActivityLogService.addLeadRemark(lead.id, newRemark);
      setNewRemark('');
      fetchActivityLogs();
      onUpdate();
      
      toast({
        title: "Remark added",
        description: "Your remark has been added to this lead.",
      });
    } catch (error) {
      console.error('Error adding remark:', error);
      toast({
        title: "Error",
        description: "Failed to add remark",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy HH:mm');
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Handler for the convert to project button
  const handleConvertToProject = () => {
    setIsConvertDialogOpen(true);
  };

  // After conversion is complete
  const handleConversionComplete = () => {
    // Close this dialog
    onOpenChange(false);
    
    // Refresh parent data
    onUpdate();
    
    // Show success message
    toast({
      title: "Lead converted to project",
      description: "The lead has been successfully converted to a project."
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              Lead Details
              {!editMode ? (
                <Button variant="outline" size="sm" onClick={() => setEditMode(true)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => setEditMode(false)}>
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                  <Button variant="default" size="sm" onClick={handleSaveChanges} disabled={isLoading}>
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                </div>
              )}
            </DialogTitle>
            <DialogDescription>
              Created on {lead.created_at ? format(new Date(lead.created_at), 'MMM dd, yyyy') : 'Unknown date'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Customer Name</label>
                {!editMode ? (
                  <p>{lead.customer_name}</p>
                ) : (
                  <Input 
                    value={updatedLead.customer_name ?? lead.customer_name}
                    onChange={(e) => handleInputChange('customer_name', e.target.value)}
                  />
                )}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone</label>
                {!editMode ? (
                  <p>{lead.phone}</p>
                ) : (
                  <Input 
                    value={updatedLead.phone ?? lead.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                )}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                {!editMode ? (
                  <p>{lead.email || '—'}</p>
                ) : (
                  <Input 
                    value={updatedLead.email ?? lead.email ?? ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                )}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                {!editMode ? (
                  <p>{lead.location || '—'}</p>
                ) : (
                  <Input 
                    value={updatedLead.location ?? lead.location ?? ''}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                  />
                )}
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Lead Date</label>
                {!editMode ? (
                  <p>{lead.lead_date ? format(new Date(lead.lead_date), 'MMM dd, yyyy') : '—'}</p>
                ) : (
                  <div className="flex">
                    <DatePicker 
                      date={updatedLead.lead_date ? new Date(updatedLead.lead_date) : lead.lead_date ? new Date(lead.lead_date) : undefined}
                      onSelect={(date) => handleInputChange('lead_date', date?.toISOString())}
                    />
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                {!editMode ? (
                  <p>{lead.status}</p>
                ) : (
                  <Select
                    value={updatedLead.status ?? lead.status}
                    onValueChange={(value) => handleInputChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="New">New</SelectItem>
                      <SelectItem value="Contacted">Contacted</SelectItem>
                      <SelectItem value="Qualified">Qualified</SelectItem>
                      <SelectItem value="Lost">Lost</SelectItem>
                      <SelectItem value="Converted">Converted</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Budget Preference</label>
                {!editMode ? (
                  <p>{lead.budget_preference || '—'}</p>
                ) : (
                  <Select
                    value={updatedLead.budget_preference ?? lead.budget_preference ?? ''}
                    onValueChange={(value) => handleInputChange('budget_preference', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select budget range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Not specified</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Next Followup Date</label>
                {!editMode ? (
                  <p>{lead.next_followup_date ? format(new Date(lead.next_followup_date), 'MMM dd, yyyy') : '—'}</p>
                ) : (
                  <div className="flex">
                    <DatePicker 
                      date={updatedLead.next_followup_date ? new Date(updatedLead.next_followup_date) : lead.next_followup_date ? new Date(lead.next_followup_date) : undefined}
                      onSelect={(date) => handleInputChange('next_followup_date', date?.toISOString())}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="space-y-2 pt-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">Remarks</label>
              
              {/* Add Convert to Project Button */}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleConvertToProject}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Convert to Project
              </Button>
            </div>
            <Textarea 
              value={newRemark} 
              onChange={(e) => setNewRemark(e.target.value)}
              placeholder="Add a new remark..."
            />
            <Button 
              size="sm" 
              onClick={handleAddRemark} 
              disabled={!newRemark.trim() || isLoading}
            >
              Add Remark
            </Button>
          </div>
          
          <div className="space-y-2 mt-4">
            <h3 className="text-sm font-medium">Activity Log</h3>
            <div className="max-h-40 overflow-y-auto border rounded-md p-4 space-y-2">
              {activityLogs.length === 0 ? (
                <p className="text-sm text-muted-foreground">No activity logged for this lead</p>
              ) : (
                activityLogs.map(log => (
                  <div key={log.id} className="border-b last:border-0 pb-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">{log.action}</span>
                      <span className="text-xs text-muted-foreground">{formatDateTime(log.created_at)}</span>
                    </div>
                    {log.details && <p className="text-sm">{log.details}</p>}
                  </div>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Add the ConvertLeadDialog */}
      <ConvertLeadDialog
        lead={lead}
        open={isConvertDialogOpen}
        onOpenChange={setIsConvertDialogOpen}
        onConversionComplete={handleConversionComplete}
      />
    </>
  );
};

export default LeadDetailsDialog;
