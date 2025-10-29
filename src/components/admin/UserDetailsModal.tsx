import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { User, Mail, Calendar, Shield, FileText, Video, Award, Clock, Download, ExternalLink } from 'lucide-react';
import { User as UserType } from '@/types';

interface UserDetailsModalProps {
  user: UserType | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove?: (userId: string) => void;
  onReject?: (userId: string, reason?: string) => void;
  onSuspend?: (userId: string) => void;
  onActivate?: (userId: string) => void;
}

export const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  user,
  isOpen,
  onClose,
  onApprove,
  onReject,
  onSuspend,
  onActivate,
}) => {
  if (!user) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case 'suspended':
        return <Badge className="bg-orange-100 text-orange-800">Suspended</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'student':
        return <Badge variant="outline">Student</Badge>;
      case 'trainer':
        return <Badge className="bg-blue-100 text-blue-800">Trainer</Badge>;
      case 'admin':
        return <Badge className="bg-purple-100 text-purple-800">Admin</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={user.avatar} />
              <AvatarFallback>
                {user.firstName[0]}{user.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-semibold">{user.firstName} {user.lastName}</h3>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </DialogTitle>
          <DialogDescription>
            User details and management options
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h4 className="font-semibold flex items-center gap-2">
              <User className="w-4 h-4" />
              Basic Information
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Role</label>
                <div className="mt-1">{getRoleBadge(user.role)}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <div className="mt-1">{getStatusBadge(user.status)}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Join Date</label>
                <p className="text-sm">{new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Approved</label>
                <p className="text-sm">{user.isApproved ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </div>

          {/* Trainer-specific information */}
          {user.role === 'trainer' && (
            <>
              <Separator />
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Trainer Information
                </h4>
                
                {user.bio && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Bio</label>
                    <p className="text-sm mt-1 p-3 bg-gray-50 rounded-md">{user.bio}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {user.experience !== undefined && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Experience
                      </label>
                      <p className="text-sm">{user.experience} years</p>
                    </div>
                  )}

                  {user.demoVideoUrl && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                        <Video className="w-3 h-3" />
                        Demo Video
                      </label>
                      <a 
                        href={user.demoVideoUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        View Video
                      </a>
                    </div>
                  )}
                </div>

                {user.expertise && user.expertise.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      Areas of Expertise
                    </label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {user.expertise.map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {user.resume && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-1 mb-2">
                      <FileText className="w-3 h-3" />
                      Resume/CV
                    </label>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`http://localhost:3000${user.resume}`, '_blank')}
                      >
                        <ExternalLink className="w-3 h-3 mr-2" />
                        View Resume
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <a
                          href={`http://localhost:3000${user.resume}`}
                          download
                          className="flex items-center gap-2"
                        >
                          <Download className="w-3 h-3" />
                          Download
                        </a>
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {user.resume.split('/').pop()}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Action Buttons */}
          <Separator />
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm">
              <Mail className="w-4 h-4 mr-2" />
              Send Email
            </Button>

            {user.role === 'trainer' && user.status === 'pending' && (
              <>
                {onApprove && (
                  <Button 
                    size="sm" 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => onApprove(user.id)}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                )}
                {onReject && (
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => onReject(user.id)}
                  >
                    Reject
                  </Button>
                )}
              </>
            )}

            {user.status === 'approved' && onSuspend && (
              <Button 
                size="sm" 
                variant="destructive"
                onClick={() => onSuspend(user.id)}
              >
                Suspend
              </Button>
            )}

            {(user.status === 'suspended' || user.status === 'rejected') && onActivate && (
              <Button 
                size="sm" 
                className="bg-green-600 hover:bg-green-700"
                onClick={() => onActivate(user.id)}
              >
                Activate
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};