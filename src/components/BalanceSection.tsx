import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, Plus, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BalanceSectionProps {
  balance: number;
  onBalanceUpdate: (newBalance: number) => void;
}

const BalanceSection = ({ balance, onBalanceUpdate }: BalanceSectionProps) => {
  const [topupAmount, setTopupAmount] = useState("");
  const { toast } = useToast();

  const handleTopup = () => {
    const amount = parseInt(topupAmount);
    
    if (!amount || amount < 1) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than ₹0",
        variant: "destructive",
      });
      return;
    }

    if (amount > 10000) {
      toast({
        title: "Amount Too Large",
        description: "Maximum top-up amount is ₹10,000",
        variant: "destructive",
      });
      return;
    }

    const newBalance = balance + amount;
    onBalanceUpdate(newBalance);
    localStorage.setItem('balance', newBalance.toString());

    // Store transaction
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    const transaction = {
      id: Date.now(),
      amount,
      timestamp: new Date().toISOString(),
      type: 'topup'
    };
    transactions.push(transaction);
    localStorage.setItem('transactions', JSON.stringify(transactions));

    toast({
      title: "Balance Added",
      description: `₹${amount} added successfully. New balance: ₹${newBalance}`,
      variant: "default",
    });

    setTopupAmount("");
  };

  const quickTopupAmounts = [100, 500, 1000, 2000];

  return (
    <Card className="w-full max-w-md mx-auto shadow-[var(--shadow-elegant)] bg-[image:var(--gradient-card)] border-0 animate-scale-in">
      <CardHeader className="text-center pb-6">
        <CardTitle className="flex items-center justify-center gap-3 text-2xl">
          <Wallet className="h-6 w-6 text-accent" />
          <span className="bg-[image:var(--gradient-primary)] bg-clip-text text-transparent">Wallet Balance</span>
        </CardTitle>
        <CardDescription className="text-base">
          Manage your account balance for RC generation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center mb-6">
          <div className="text-5xl font-bold bg-[image:var(--gradient-accent)] bg-clip-text text-transparent flex items-center justify-center gap-2 mb-2">
            <span>₹</span>
            <span>{balance}</span>
          </div>
          <p className="text-muted-foreground font-medium">Available Balance</p>
        </div>

        <div className="bg-[image:var(--gradient-primary)] text-white p-4 rounded-xl shadow-[var(--shadow-card)] mb-6">
          <div className="font-medium flex items-center gap-2">
            <span>💡</span>
            <span>RC Generation Cost: ₹5 per vehicle</span>
          </div>
        </div>

        <div className="space-y-3">
          <Label htmlFor="topup-amount">Add Money</Label>
          <div className="flex gap-2">
            <Input
              id="topup-amount"
              type="number"
              placeholder="Enter amount"
              value={topupAmount}
              onChange={(e) => setTopupAmount(e.target.value)}
              min="1"
              max="10000"
              className="flex-1"
            />
            <Button 
              onClick={handleTopup}
              disabled={!topupAmount}
              className="bg-[image:var(--gradient-accent)] hover:shadow-[var(--shadow-glow)] transition-all duration-300 transform hover:scale-105 text-white border-0"
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm">Quick Add</Label>
          <div className="grid grid-cols-2 gap-2">
            {quickTopupAmounts.map((amount) => (
              <Button
                key={amount}
                variant="outline"
                size="sm"
                onClick={() => setTopupAmount(amount.toString())}
                className="text-xs"
              >
                ₹{amount}
              </Button>
            ))}
          </div>
        </div>

        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          <p>• Minimum top-up: ₹1</p>
          <p>• Maximum top-up: ₹10,000</p>
          <p>• Balance never expires</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default BalanceSection;