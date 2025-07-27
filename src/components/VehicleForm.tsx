import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Loader2, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VehicleFormProps {
  onRCGenerated: (rcData: any) => void;
  balance: number;
  onBalanceUpdate: (newBalance: number) => void;
}

const VehicleForm = ({ onRCGenerated, balance, onBalanceUpdate }: VehicleFormProps) => {
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const formatVehicleNumber = (value: string) => {
    // Remove any non-alphanumeric characters and convert to uppercase
    const cleaned = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    
    // Format as TN01AB1234 pattern
    if (cleaned.length <= 2) return cleaned;
    if (cleaned.length <= 4) return cleaned.slice(0, 2) + ' ' + cleaned.slice(2);
    if (cleaned.length <= 6) return cleaned.slice(0, 2) + ' ' + cleaned.slice(2, 4) + ' ' + cleaned.slice(4);
    return cleaned.slice(0, 2) + ' ' + cleaned.slice(2, 4) + ' ' + cleaned.slice(4, 6) + ' ' + cleaned.slice(6, 10);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatVehicleNumber(e.target.value);
    setVehicleNumber(formatted);
  };

  const validateVehicleNumber = (vrn: string) => {
    const cleanVRN = vrn.replace(/\s/g, '');
    // Indian vehicle number pattern: 2 letters + 2 digits + 2 letters + 4 digits
    const pattern = /^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$/;
    return pattern.test(cleanVRN);
  };

  const handleGetRC = async () => {
    if (!vehicleNumber.trim()) {
      toast({
        title: "Error",
        description: "Please enter a vehicle number",
        variant: "destructive",
      });
      return;
    }

    const cleanVRN = vehicleNumber.replace(/\s/g, '');
    
    if (!validateVehicleNumber(cleanVRN)) {
      toast({
        title: "Invalid Format",
        description: "Please enter a valid vehicle number (e.g., TN01AB1234)",
        variant: "destructive",
      });
      return;
    }

    if (balance < 5) {
      toast({
        title: "Insufficient Balance",
        description: "Please top up your balance. Each RC generation costs ₹5",
        variant: "destructive",
      });
      return;
    }

    // Check local storage first
    const cachedRC = localStorage.getItem(`rc_${cleanVRN}`);
    if (cachedRC) {
      const rcData = JSON.parse(cachedRC);
      onRCGenerated(rcData);
      toast({
        title: "RC Retrieved",
        description: "RC found in local storage (no charge applied)",
        variant: "default",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('https://api.apnirc.xyz/api/b2b/get-rc', {
        method: 'POST',
        headers: {
          'Authorization': '17530789240GxPl0JFkQVoG1CF2OBpiwhzEye5leHLkl5feXRaw9b3gYfoAhNainjQAIF09jnirEcG6GmPoutBIDya',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ vrn: cleanVRN }),
      });

      const data = await response.json();

      if (response.ok && data) {
        // Store in local storage
        localStorage.setItem(`rc_${cleanVRN}`, JSON.stringify(data));
        
        // Update balance
        const newBalance = balance - 5;
        onBalanceUpdate(newBalance);
        localStorage.setItem('balance', newBalance.toString());

        // Store transaction
        const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        const transaction = {
          id: Date.now(),
          vehicleNumber: cleanVRN,
          timestamp: new Date().toISOString(),
          cost: 5,
          type: 'rc_generation'
        };
        transactions.push(transaction);
        localStorage.setItem('transactions', JSON.stringify(transactions));

        onRCGenerated(data);
        toast({
          title: "RC Generated Successfully",
          description: `₹5 deducted from your balance. Remaining: ₹${newBalance}`,
          variant: "default",
        });
      } else {
        throw new Error(data.message || 'Failed to fetch RC data');
      }
    } catch (error) {
      console.error('Error fetching RC:', error);
      toast({
        title: "Error",
        description: "Failed to fetch RC data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSampleRC = () => {
    const sampleData = {
      vehicleNumber: "TN01AB1234",
      ownerName: "RAJESH KUMAR",
      vehicleClass: "MCWG (Motor Cycle With Gear)",
      fuelType: "PETROL",
      chassisNumber: "ME4JF48DXJK123456",
      engineNumber: "JF48DFH123456",
      manufacturer: "BAJAJ AUTO LTD",
      model: "PULSAR 150",
      registrationDate: "2023-01-15",
      insuranceValidTill: "2024-12-31",
      rtoOffice: "RTO CHENNAI CENTRAL",
      ownerAddress: "No.45, Gandhi Street, T.Nagar, Chennai - 600017, Tamil Nadu"
    };
    
    onRCGenerated(sampleData);
    toast({
      title: "Sample RC Loaded",
      description: "Preview sample RC document - no charges applied",
      variant: "default",
    });
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-[var(--shadow-elegant)] bg-[image:var(--gradient-card)] border-0 animate-scale-in">
      <CardHeader className="text-center pb-6">
        <CardTitle className="text-2xl font-bold bg-[image:var(--gradient-primary)] bg-clip-text text-transparent mb-2">
          Vehicle RC Generator
        </CardTitle>
        <CardDescription className="text-base text-muted-foreground">
          Enter your vehicle number to generate RC document instantly
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="vehicle-number">Vehicle Number</Label>
          <Input
            id="vehicle-number"
            type="text"
            placeholder="TN 01 AB 1234"
            value={vehicleNumber}
            onChange={handleInputChange}
            maxLength={13}
            className="text-center font-mono text-lg tracking-wider"
          />
          <p className="text-xs text-muted-foreground text-center">
            Format: State Code + District + Series + Number
          </p>
        </div>
        
        <div className="bg-[image:var(--gradient-accent)] p-4 rounded-xl text-white shadow-[var(--shadow-card)]">
          <div className="flex justify-between items-center">
            <span className="font-medium">Current Balance:</span>
            <span className="font-bold text-xl">₹{balance}</span>
          </div>
          <div className="text-sm opacity-90 mt-2 flex items-center gap-2">
            <span>💳</span>
            <span>Each RC generation costs ₹5</span>
          </div>
        </div>

        <div className="space-y-3">
          <Button 
            onClick={handleGetRC} 
            disabled={loading || balance < 5}
            className="w-full bg-[image:var(--gradient-primary)] hover:shadow-[var(--shadow-glow)] transition-all duration-300 transform hover:scale-105 text-white border-0 h-12 text-base font-semibold"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Generating RC...
              </>
            ) : (
              <>
                <Search className="mr-2 h-5 w-5" />
                Get RC Document
              </>
            )}
          </Button>
          
          <Button 
            onClick={handleSampleRC}
            variant="outline"
            className="w-full border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all duration-300"
          >
            <FileText className="mr-2 h-4 w-4" />
            View Sample RC
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default VehicleForm;