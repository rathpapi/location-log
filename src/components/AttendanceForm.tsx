import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { MapPin, Users, Clock } from 'lucide-react';
// import { supabase } from '@/integrations/supabase/client';

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

interface AttendanceFormProps {
  onSubmitSuccess?: () => void;
}

const AttendanceForm: React.FC<AttendanceFormProps> = ({ onSubmitSuccess }) => {
  const [name, setName] = useState('');
  const [result, setResult] = useState('');
  const [location, setLocation] = useState<LocationData | null>(null);
  const [locationStatus, setLocationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inZone, setInZone] = useState<boolean | null>(null);

  // Define allowed zone (example coordinates - adjust as needed)
  const ALLOWED_ZONE = {
    center: { lat: 40.7128, lng: -74.0060 }, // Example: New York City
    radius: 1000 // meters
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    setLocationStatus('loading');
    
    if (!navigator.geolocation) {
      setLocationStatus('error');
      toast({
        title: "Location not supported",
        description: "Your browser doesn't support geolocation.",
        variant: "destructive",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const locationData: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: Date.now(),
        };
        
        setLocation(locationData);
        setLocationStatus('success');
        
        // Check if user is in allowed zone
        const distance = calculateDistance(
          locationData.latitude,
          locationData.longitude,
          ALLOWED_ZONE.center.lat,
          ALLOWED_ZONE.center.lng
        );
        
        const isInZone = distance <= ALLOWED_ZONE.radius;
        setInZone(isInZone);
        
        if (!isInZone) {
          toast({
            title: "Outside allowed zone",
            description: `You are ${Math.round(distance)}m from the attendance zone.`,
            variant: "destructive",
          });
        }
      },
      (error) => {
        setLocationStatus('error');
        console.error('Geolocation error:', error);
        toast({
          title: "Location access denied",
          description: "Please enable location access to submit attendance.",
          variant: "destructive",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !result.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in both name and result fields.",
        variant: "destructive",
      });
      return;
    }

    if (!location) {
      toast({
        title: "Location required",
        description: "Location data is required for attendance submission.",
        variant: "destructive",
      });
      return;
    }

    if (inZone === false) {
      toast({
        title: "Outside attendance zone",
        description: "You must be within the designated area to submit attendance.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Store attendance record locally for now
      const attendanceRecord = {
        id: Date.now().toString(),
        name: name.trim(),
        result: result.trim(),
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
        submitted_at: new Date().toISOString(),
        in_zone: inZone,
      };
      
      // Save to localStorage temporarily
      const existingRecords = JSON.parse(localStorage.getItem('attendanceRecords') || '[]');
      existingRecords.push(attendanceRecord);
      localStorage.setItem('attendanceRecords', JSON.stringify(existingRecords));

      toast({
        title: "Attendance submitted!",
        description: "Your attendance has been recorded successfully.",
      });

      // Reset form
      setName('');
      setResult('');
      onSubmitSuccess?.();
      
    } catch (error) {
      console.error('Error submitting attendance:', error);
      toast({
        title: "Submission failed",
        description: "Failed to submit attendance. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getLocationBadgeVariant = () => {
    if (locationStatus === 'loading') return 'secondary';
    if (locationStatus === 'error') return 'destructive';
    return inZone ? 'default' : 'destructive';
  };

  const getLocationBadgeText = () => {
    if (locationStatus === 'loading') return 'Getting location...';
    if (locationStatus === 'error') return 'Location unavailable';
    return inZone ? 'In attendance zone' : 'Outside zone';
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Attendance Check-in
        </CardTitle>
        <CardDescription>
          Submit your attendance with location verification
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="result">Result/Notes</Label>
            <Textarea
              id="result"
              placeholder="Enter your result or notes"
              value={result}
              onChange={(e) => setResult(e.target.value)}
              required
              rows={3}
            />
          </div>

          <div className="space-y-3 p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-location" />
                <span className="text-sm font-medium">Location Status</span>
              </div>
              <Badge variant={getLocationBadgeVariant()}>
                {getLocationBadgeText()}
              </Badge>
            </div>
            
            {location && (
              <div className="text-xs text-muted-foreground space-y-1">
                <div>Lat: {location.latitude.toFixed(6)}</div>
                <div>Lng: {location.longitude.toFixed(6)}</div>
                <div>Accuracy: ±{Math.round(location.accuracy)}m</div>
              </div>
            )}
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={getCurrentLocation}
              disabled={locationStatus === 'loading'}
            >
              <MapPin className="w-3 h-3 mr-1" />
              Refresh Location
            </Button>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>Timestamp: {new Date().toLocaleString()}</span>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || locationStatus === 'error' || inZone === false}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Attendance'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AttendanceForm;