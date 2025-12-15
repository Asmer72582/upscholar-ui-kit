import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export const TestModeModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Show modal immediately on first load
    setIsOpen(true);

    // Set up interval to show modal every 10 seconds
    const interval = setInterval(() => {
      setIsOpen(true);
    }, 60000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="relative">
          <DialogTitle className="text-orange-600">
            ⚠️ Website Under Development
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        <DialogDescription className="space-y-3">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-orange-100 rounded-full p-3">
              <div className="bg-orange-500 rounded-full p-2">
                <span className="text-white text-xl">🚧</span>
              </div>
            </div>
          </div>
          <p className="text-center text-gray-700">
            This website is currently in <strong>test mode</strong>. Some features may not work as expected.
          </p>
          <p className="text-center text-sm text-gray-600">
            We're actively developing and improving the platform. Thank you for your patience!
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
            <p className="text-xs text-yellow-800 text-center">
              <strong>Note:</strong> This reminder will appear every 60 seconds during development.
            </p>
          </div>
        </DialogDescription>
        <DialogFooter className="sm:justify-center">
          <Button onClick={handleClose} className="bg-orange-500 hover:bg-orange-600">
            I Understand
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};