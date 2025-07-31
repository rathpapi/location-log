import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AttendanceForm from '@/components/AttendanceForm';
import AttendanceDashboard from '@/components/AttendanceDashboard';
import { MapPin, Clock, Users, BarChart3 } from 'lucide-react';

const Index = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSubmitSuccess = () => {
    // Trigger dashboard refresh when new attendance is submitted
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-primary rounded-xl">
              <MapPin className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">
              Location Attendance
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Track attendance with precise location verification to ensure users are in the designated zone
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="flex items-start gap-3 p-4 bg-card rounded-lg border">
            <div className="p-2 bg-success/10 rounded-lg">
              <MapPin className="w-5 h-5 text-success" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Zone Verification</h3>
              <p className="text-sm text-muted-foreground">
                Automatically verifies user location within designated attendance zones
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-4 bg-card rounded-lg border">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Real-time Tracking</h3>
              <p className="text-sm text-muted-foreground">
                Instant timestamp and location recording for accurate attendance logs
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-4 bg-card rounded-lg border">
            <div className="p-2 bg-accent/10 rounded-lg">
              <BarChart3 className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Detailed Reports</h3>
              <p className="text-sm text-muted-foreground">
                Comprehensive attendance reports with location data and accuracy metrics
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="checkin" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="checkin" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Check-in
            </TabsTrigger>
            <TabsTrigger value="records" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Records
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="checkin" className="space-y-4">
            <div className="flex justify-center">
              <AttendanceForm onSubmitSuccess={handleSubmitSuccess} />
            </div>
          </TabsContent>
          
          <TabsContent value="records" className="space-y-4">
            <div className="max-w-4xl mx-auto">
              <AttendanceDashboard refreshTrigger={refreshTrigger} />
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="mt-16 text-center text-sm text-muted-foreground">
          <p className="mb-2">
            🔒 Your location data is secure and only used for attendance verification
          </p>
          <div className="flex items-center justify-center gap-4 text-xs">
            <span>✓ Real-time location tracking</span>
            <span>✓ Zone boundary verification</span>
            <span>✓ Accurate timestamp recording</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;