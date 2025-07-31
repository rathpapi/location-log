import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RefreshCw, MapPin, Clock, Users } from 'lucide-react';

interface AttendanceRecord {
  id: string;
  name: string;
  result: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  submitted_at: string;
  in_zone: boolean;
}

interface AttendanceDashboardProps {
  refreshTrigger?: number;
}

const AttendanceDashboard: React.FC<AttendanceDashboardProps> = ({ refreshTrigger }) => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      // Get records from localStorage
      const storedRecords = JSON.parse(localStorage.getItem('attendanceRecords') || '[]');
      setRecords(storedRecords.reverse()); // Show newest first
    } catch (error) {
      console.error('Error fetching records:', error);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [refreshTrigger]);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatLocation = (lat: number, lng: number) => {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Attendance Records
            </CardTitle>
            <CardDescription>
              Recent attendance submissions with location verification
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchRecords}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading records...</span>
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No attendance records found
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="space-y-4">
              {records.map((record) => (
                <div
                  key={record.id}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{record.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {record.result}
                      </p>
                    </div>
                    <Badge variant={record.in_zone ? 'default' : 'destructive'}>
                      {record.in_zone ? 'In Zone' : 'Out of Zone'}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{formatTime(record.submitted_at)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      <span>{formatLocation(record.latitude, record.longitude)}</span>
                      <span className="text-xs">
                        (±{Math.round(record.accuracy)}m)
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default AttendanceDashboard;