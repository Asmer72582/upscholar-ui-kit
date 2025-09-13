import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface RejectTrainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  trainerName: string;
}

export const RejectTrainerModal: React.FC<RejectTrainerModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  trainerName,
}) => {
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    onConfirm(reason);
    setReason('');
    onClose();
  };

  const handleClose = () => {
    setReason('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject Trainer Application</DialogTitle>
          <DialogDescription>
            You are about to reject the trainer application for <strong>{trainerName}</strong>.
            Please provide a reason for rejection (optional).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="reason">Reason for Rejection (Optional)</Label>
            <Textarea
              id="reason"
              placeholder="Please provide feedback to help the applicant improve their application..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-2"
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm}>
            Reject Application
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};