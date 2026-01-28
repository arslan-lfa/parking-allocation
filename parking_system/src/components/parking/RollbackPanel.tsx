import { useState } from 'react';
import { useParkingSystem } from '@/contexts/ParkingContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { RotateCcw, History, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { formatDateTime } from '@/lib/parking/utils';

export function RollbackPanel() {
  const { rollbackCount, recentOperations, rollback } = useParkingSystem();
  const [rollbackSteps, setRollbackSteps] = useState('1');
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleRollback = () => {
    const k = parseInt(rollbackSteps, 10);
    if (isNaN(k) || k <= 0) {
      toast.error('Please enter a valid number of steps');
      return;
    }

    if (k > rollbackCount) {
      toast.error(`Only ${rollbackCount} operations available for rollback`);
      return;
    }

    const result = rollback(k);
    if (result.success) {
      toast.success(`Rolled back ${result.operationsRolledBack} operations`);
      setDialogOpen(false);
      setRollbackSteps('1');
    } else {
      toast.error('Rollback failed');
    }
  };

  return (
    <div className="space-y-4">
      {/* Rollback Action */}
      <Card className="neu-flat border-0">
        <CardHeader>
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-primary" />
            Rollback Manager
          </CardTitle>
          <CardDescription>
            Undo the last k allocation operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="text-sm text-muted-foreground mb-1">
                Operations available: <span className="font-medium text-foreground">{rollbackCount}</span>
              </div>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="neu-button"
                  disabled={rollbackCount === 0}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Rollback
                </Button>
              </DialogTrigger>
              <DialogContent className="neu-flat">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <RotateCcw className="w-5 h-5 text-primary" />
                    Rollback Operations
                  </DialogTitle>
                  <DialogDescription>
                    This will undo allocation operations and restore previous states.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Label htmlFor="steps">Number of operations to rollback</Label>
                  <Input
                    id="steps"
                    type="number"
                    min="1"
                    max={rollbackCount}
                    value={rollbackSteps}
                    onChange={(e) => setRollbackSteps(e.target.value)}
                    className="neu-pressed mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Max: {rollbackCount} operations
                  </p>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleRollback} variant="destructive">
                    Confirm Rollback
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Operation History */}
      <Card className="neu-flat border-0">
        <CardHeader>
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <History className="w-4 h-4 text-primary" />
            Recent Operations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentOperations.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No operations recorded yet
            </p>
          ) : (
            <div className="space-y-2">
              {recentOperations.slice(0, 5).map((op, index) => (
                <div
                  key={op.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-muted/50 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-5">
                      #{recentOperations.length - index}
                    </span>
                    <span className={`font-medium ${
                      op.operationType === 'ALLOCATE' ? 'text-green-600' :
                      op.operationType === 'OCCUPY' ? 'text-yellow-600' :
                      op.operationType === 'RELEASE' ? 'text-blue-600' :
                      'text-red-600'
                    }`}>
                      {op.operationType}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDateTime(op.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function TestRunner() {
  const { runTests } = useParkingSystem();
  const [results, setResults] = useState<{ name: string; passed: boolean; message: string }[] | null>(null);
  const [running, setRunning] = useState(false);

  const handleRunTests = () => {
    setRunning(true);
    setTimeout(() => {
      const testResults = runTests();
      setResults(testResults);
      setRunning(false);
      
      const passed = testResults.filter(r => r.passed).length;
      const total = testResults.length;
      if (passed === total) {
        toast.success(`All ${total} tests passed!`);
      } else {
        toast.warning(`${passed}/${total} tests passed`);
      }
    }, 500);
  };

  return (
    <Card className="neu-flat border-0">
      <CardHeader>
        <CardTitle className="text-base font-medium text-black">Test Runner</CardTitle>
        <CardDescription>
          Execute system test cases to verify functionality
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={handleRunTests} 
          disabled={running}
          className="w-full neu-button mb-4 text-black"
        >
          {running ? 'Running...' : 'Run Test Cases'}
        </Button>

        {results && (
          <div className="space-y-2">
            {results.map((result, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  result.passed ? 'bg-green-50' : 'bg-red-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  {result.passed ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span className="font-medium text-sm">{result.name}</span>
                </div>
                <span className="text-xs text-muted-foreground max-w-[200px] truncate">
                  {result.message}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
