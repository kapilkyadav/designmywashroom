
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { RealProjectService, ConvertibleRecord } from '@/services/RealProjectService';

interface ConvertDialogContainerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectCreated: () => void;
}

// Update the record type to match the ConvertibleRecord type
const recordTypes = ['lead', 'project_estimate'] as const;
type RecordType = typeof recordTypes[number];

const ConvertDialogContainer: React.FC<ConvertDialogContainerProps> = ({
  open,
  onOpenChange,
  onProjectCreated,
}) => {
  const [recordType, setRecordType] = useState<RecordType>('lead');
  const [recordId, setRecordId] = useState<string>('');
  const [record, setRecord] = useState<ConvertibleRecord | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

  useEffect(() => {
    const fetchRecord = async () => {
      if (!recordId) {
        setRecord(null);
        return;
      }

      setIsFetching(true);
      try {
        const records = await RealProjectService.getConvertibleRecords({
          record_type: recordType,
          record_id: recordId,
        });

        if (records && records.length > 0) {
          setRecord(records[0]);
        } else {
          setRecord(null);
          toast({
            title: "No record found",
            description: "No matching record found for the provided ID.",
            variant: "destructive",
          });
        }
      } catch (error: any) {
        console.error("Error fetching record:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to fetch record.",
          variant: "destructive",
        });
        setRecord(null);
      } finally {
        setIsFetching(false);
      }
    };

    fetchRecord();
  }, [recordType, recordId]);

  const handleConvert = async () => {
    if (!record) return;

    setIsConverting(true);
    try {
      // No direct conversion needed, just pass the record to the creation page
      toast({
        title: "Ready to convert",
        description: "You will be redirected to the project creation page.",
      });
      onOpenChange(false);
      onProjectCreated(); // Fixed: Removed the argument since onProjectCreated takes no arguments
    } catch (error: any) {
      console.error("Error converting record:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to convert record.",
        variant: "destructive",
      });
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Convert Record to Project</DialogTitle>
          <DialogDescription>
            Select the record type and enter the ID to convert.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="recordType" className="text-right">
              Record Type
            </Label>
            <RadioGroup defaultValue={recordType} className="col-span-3" onValueChange={(value) => setRecordType(value as RecordType)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="lead" id="lead" />
                <Label htmlFor="lead">Lead</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="project_estimate" id="project_estimate" />
                <Label htmlFor="project_estimate">Project Estimate</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="recordId" className="text-right">
              Record ID
            </Label>
            <Input
              type="text"
              id="recordId"
              value={recordId}
              onChange={(e) => setRecordId(e.target.value)}
              className="col-span-3"
            />
          </div>
          {isFetching && (
            <div className="flex items-center justify-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Fetching Record...
            </div>
          )}
          {record && (
            <div className="border rounded-md p-4">
              <h4 className="text-sm font-medium">Record Preview</h4>
              <p className="text-sm">Client Name: {record.client_name}</p>
              <p className="text-sm">Client Email: {record.client_email || 'N/A'}</p>
              <p className="text-sm">Client Mobile: {record.client_mobile}</p>
              <p className="text-sm">Created Date: {new Date(record.created_date).toLocaleDateString()}</p>
              {record.status && <p className="text-sm">Status: {record.status}</p>}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => {
            onOpenChange(false);
            setRecordType('lead');
            setRecordId('');
            setRecord(null);
          }}>
            Cancel
          </Button>
          <Button type="button" onClick={handleConvert} disabled={!record || isConverting}>
            {isConverting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Converting...
              </>
            ) : (
              "Convert to Project"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConvertDialogContainer;
