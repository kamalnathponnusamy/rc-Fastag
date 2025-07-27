import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { History, Search, Download, FileText, Wallet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Transaction {
  id: number;
  vehicleNumber?: string;
  amount?: number;
  timestamp: string;
  cost?: number;
  type: 'rc_generation' | 'topup';
}

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();
  
  const itemsPerPage = 10;

  useEffect(() => {
    loadTransactions();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [transactions, searchTerm]);

  const loadTransactions = () => {
    const stored = localStorage.getItem('transactions');
    if (stored) {
      const parsed = JSON.parse(stored);
      setTransactions(parsed.reverse()); // Show latest first
    }
  };

  const filterTransactions = () => {
    let filtered = transactions;
    
    if (searchTerm) {
      filtered = transactions.filter(transaction => 
        transaction.vehicleNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredTransactions(filtered);
    setCurrentPage(1);
  };

  const formatDateTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return timestamp;
    }
  };

  const getTransactionIcon = (type: string) => {
    return type === 'rc_generation' ? <FileText className="h-4 w-4" /> : <Wallet className="h-4 w-4" />;
  };

  const getTransactionBadge = (type: string) => {
    return type === 'rc_generation' 
      ? <Badge variant="destructive" className="text-xs">RC Generated</Badge>
      : <Badge variant="default" className="text-xs bg-success text-success-foreground">Top-up</Badge>;
  };

  const exportTransactions = () => {
    try {
      const csvContent = [
        ['Date', 'Type', 'Vehicle Number', 'Amount', 'Cost'].join(','),
        ...filteredTransactions.map(t => [
          formatDateTime(t.timestamp),
          t.type,
          t.vehicleNumber || '-',
          t.amount || '-',
          t.cost || '-'
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: "Transaction history exported as CSV",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export transaction history",
        variant: "destructive",
      });
    }
  };

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);

  const stats = {
    totalTransactions: transactions.length,
    totalSpent: transactions.filter(t => t.type === 'rc_generation').reduce((sum, t) => sum + (t.cost || 0), 0),
    totalAdded: transactions.filter(t => t.type === 'topup').reduce((sum, t) => sum + (t.amount || 0), 0),
    rcGenerated: transactions.filter(t => t.type === 'rc_generation').length
  };

  return (
    <Card className="w-full shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          Transaction History
        </CardTitle>
        <CardDescription>
          Track your RC generations and balance top-ups
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-secondary/50 p-3 rounded-lg text-center">
            <div className="text-lg font-bold text-primary">{stats.totalTransactions}</div>
            <div className="text-xs text-muted-foreground">Total Transactions</div>
          </div>
          <div className="bg-secondary/50 p-3 rounded-lg text-center">
            <div className="text-lg font-bold text-destructive">₹{stats.totalSpent}</div>
            <div className="text-xs text-muted-foreground">Total Spent</div>
          </div>
          <div className="bg-secondary/50 p-3 rounded-lg text-center">
            <div className="text-lg font-bold text-success">₹{stats.totalAdded}</div>
            <div className="text-xs text-muted-foreground">Total Added</div>
          </div>
          <div className="bg-secondary/50 p-3 rounded-lg text-center">
            <div className="text-lg font-bold text-accent">{stats.rcGenerated}</div>
            <div className="text-xs text-muted-foreground">RCs Generated</div>
          </div>
        </div>

        {/* Search and Export */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by vehicle number or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button 
            variant="outline" 
            onClick={exportTransactions}
            disabled={filteredTransactions.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Transaction List */}
        <div className="space-y-2">
          {paginatedTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No transactions found</p>
              <p className="text-sm">Start by generating an RC or adding balance</p>
            </div>
          ) : (
            paginatedTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-secondary/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-secondary rounded-full">
                    {getTransactionIcon(transaction.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      {getTransactionBadge(transaction.type)}
                      {transaction.vehicleNumber && (
                        <span className="font-mono text-sm font-medium">{transaction.vehicleNumber}</span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDateTime(transaction.timestamp)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  {transaction.type === 'rc_generation' ? (
                    <div className="text-destructive font-medium">-₹{transaction.cost}</div>
                  ) : (
                    <div className="text-success font-medium">+₹{transaction.amount}</div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="px-4 py-2 text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionHistory;