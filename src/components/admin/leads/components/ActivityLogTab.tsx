
import React from 'react';
import { format } from 'date-fns';
import { LeadActivityLog } from '@/services/LeadService';

interface ActivityLogTabProps {
  isLoading: boolean;
  activityLogs: LeadActivityLog[];
}

const ActivityLogTab: React.FC<ActivityLogTabProps> = ({ isLoading, activityLogs }) => {
  return (
    <>
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin h-6 w-6 border-2 border-primary rounded-full border-t-transparent"></div>
        </div>
      ) : activityLogs.length > 0 ? (
        <div className="space-y-4">
          {activityLogs.map((log) => (
            <div key={log.id} className="border rounded-md p-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{log.action}</h4>
                  {log.details && <p className="text-sm text-muted-foreground">{log.details}</p>}
                </div>
                <div className="text-xs text-muted-foreground">
                  {format(new Date(log.created_at), 'dd MMM yyyy, HH:mm')}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          No activity logs found for this lead.
        </div>
      )}
    </>
  );
};

export default ActivityLogTab;
