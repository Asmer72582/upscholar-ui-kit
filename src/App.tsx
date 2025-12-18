import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { RoleGuard } from "@/components/common/RoleGuard";
import { ModernDashboardLayout } from "@/components/layout/ModernDashboardLayout";

// Pages
import { Landing } from "./pages/Landing";
import { Auth } from "./pages/Auth";
import { StudentDashboard } from "./pages/student/StudentDashboard";
import { BrowseLectures } from "./pages/student/BrowseLectures";
import { CourseDetail } from "./pages/student/CourseDetail";
import { MyLectures } from "./pages/student/MyLectures";
import { StudentWallet } from "./pages/student/StudentWallet";
import { BuyUpCoins } from "./pages/student/BuyUpCoins";
import { LectureDetails } from "./pages/student/LectureDetails";
import { Support } from "./pages/student/Support";
import { TrainerDashboard } from "./pages/trainer/TrainerDashboard";
import { ScheduleLecture } from "./pages/trainer/ScheduleLecture";
import { ManageLectures } from "./pages/trainer/ManageLectures";
import { CreateCourse } from "./pages/trainer/CreateCourse";
import { ManageCourses } from "./pages/trainer/ManageCourses";
import { Earnings } from "./pages/trainer/Earnings";
import { Students } from "./pages/trainer/Students";
import { Settings as TrainerSettings } from "./pages/trainer/Settings";
import { EditLecture } from "./pages/trainer/EditLecture";
import { TrainerWallet } from "./pages/trainer/TrainerWallet";

import { TrainerWalletEarnings } from "./pages/trainer/TrainerWalletEarnings";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { ManageUsers } from "./pages/admin/ManageUsers";
import { ManageLectures as ManageLecturesAdmin } from "./pages/admin/ManageLectures";
import { ManageCourses as ManageCoursesAdmin } from "./pages/admin/ManageCourses";
import { Analytics } from "./pages/admin/Analytics";
import { AdminSupport } from "./pages/admin/AdminSupport";
import { WithdrawalRequests } from "./pages/admin/WithdrawalRequests";
import { LiveLecture } from "./pages/LiveLecture";
import { MeetingRoom } from "./pages/MeetingRoom";
import { TrainerApplicationSuccess } from "./pages/TrainerApplicationSuccess";
import { TrainerLectureDetails } from "./pages/trainer/LectureDetails";
import { ResetPassword } from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/trainer-application-success" element={<TrainerApplicationSuccess />} />

            {/* Student Routes */}
            <Route path="/student/*" element={
              <RoleGuard allowedRoles={['student']}>
                <ModernDashboardLayout />
              </RoleGuard>
            }>
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="browse-lectures" element={<BrowseLectures />} />
              <Route path="my-lectures" element={<MyLectures />} />
              <Route path="lecture/:id" element={<LectureDetails />} />
              <Route path="lecture/:id/details" element={<LectureDetails />} />
              <Route path="wallet" element={<StudentWallet />} />
              <Route path="buy-upcoins" element={<BuyUpCoins />} />
              <Route path="support" element={<Support />} />
            </Route>

            {/* Trainer Routes */}
            <Route path="/trainer/*" element={
              <RoleGuard allowedRoles={['trainer']}>
                <ModernDashboardLayout />
              </RoleGuard>
            }>
              <Route path="dashboard" element={<TrainerDashboard />} />
              <Route path="schedule-lecture" element={<ScheduleLecture />} />
              <Route path="manage-lectures" element={<ManageLectures />} />
              <Route path="lectures/:id/edit" element={<EditLecture />} />
              <Route path="lectures/:id/details" element={<TrainerLectureDetails />} />
              <Route path="students" element={<Students />} />
              <Route path="wallet" element={<TrainerWalletEarnings />} />
              <Route path="settings" element={<TrainerSettings />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin/*" element={
              <RoleGuard allowedRoles={['admin']}>
                <ModernDashboardLayout />
              </RoleGuard>
            }>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="manage-users" element={<ManageUsers />} />
              <Route path="manage-lectures" element={<ManageLecturesAdmin />} />
              <Route path="manage-courses" element={<ManageCoursesAdmin />} />
              <Route path="withdrawals" element={<WithdrawalRequests />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="support" element={<AdminSupport />} />
            </Route>

            {/* Live Lecture Route */}
            <Route path="/live/:lectureId" element={
              <RoleGuard allowedRoles={['student', 'trainer']}>
                <LiveLecture />
              </RoleGuard>
            } />

            {/* Meeting Room Route */}
            <Route path="/meeting/:lectureId" element={
              <RoleGuard allowedRoles={['student', 'trainer']}>
                <MeetingRoom />
              </RoleGuard>
            } />

            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
