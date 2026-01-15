import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface CancelLectureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  lectureTitle: string;
}

export const CancelLectureModal: React.FC<CancelLectureModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  lectureTitle,
}) => {
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    if (!reason.trim()) {
      alert('Please provide a reason for cancellation');
      return;
    }
    onConfirm(reason.trim());
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
          <DialogTitle>Cancel Lecture</DialogTitle>
          <DialogDescription>
            You are about to cancel the lecture "<strong>{lectureTitle}</strong>".
            Please provide a reason for cancellation (required).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="cancellation-reason">Reason for Cancellation *</Label>
            <Textarea
              id="cancellation-reason"
              placeholder="Please explain why you need to cancel this lecture..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-2"
              rows={4}
              required
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Keep Lecture
          </Button>
          <Button variant="destructive" onClick={handleConfirm}>
            Cancel Lecture
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};