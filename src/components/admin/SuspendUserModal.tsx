import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertCircle, Ban } from 'lucide-react';

interface SuspendUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  userName: string;
  userEmail: string;
}

export const SuspendUserModal: React.FC<SuspendUserModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  userName,
  userEmail,
}) => {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm(reason);
      setReason('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setReason('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Ban className="w-5 h-5" />
            Suspend User Account
          </DialogTitle>
          <DialogDescription>
            You are about to suspend the account for <strong>{userName}</strong> ({userEmail}).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-800 dark:text-red-200">
              <p className="font-semibold mb-1">This action will:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Immediately suspend the user's account</li>
                <li>Prevent them from logging in</li>
                <li>Send an email notification to the user</li>
                <li>Can be reversed by activating the account later</li>
              </ul>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">
              Reason for Suspension <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="reason"
              placeholder="Please provide a detailed reason for suspending this user account. This will be included in the email notification sent to the user."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={5}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              This reason will be sent to the user via email.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={!reason.trim() || isSubmitting}
          >
            <Ban className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Suspending...' : 'Suspend User'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
