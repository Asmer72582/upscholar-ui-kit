import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { RoleGuard } from "@/components/common/RoleGuard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

// Pages
import { Landing } from "./pages/Landing";
import { Auth } from "./pages/Auth";
import { StudentDashboard } from "./pages/student/StudentDashboard";
import { BrowseLectures } from "./pages/student/BrowseLectures";
import { MyLectures } from "./pages/student/MyLectures";
import { StudentWallet } from "./pages/student/StudentWallet";
import { TrainerDashboard } from "./pages/trainer/TrainerDashboard";
import { ScheduleLecture } from "./pages/trainer/ScheduleLecture";
import { ManageLectures } from "./pages/trainer/ManageLectures";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
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

            {/* Student Routes */}
            <Route path="/student/*" element={
              <RoleGuard allowedRoles={['student']}>
                <DashboardLayout />
              </RoleGuard>
            }>
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="browse-lectures" element={<BrowseLectures />} />
              <Route path="my-lectures" element={<MyLectures />} />
              <Route path="wallet" element={<StudentWallet />} />
              <Route path="support" element={<div className="p-8 text-center">Support - Coming Soon</div>} />
            </Route>

            {/* Trainer Routes */}
            <Route path="/trainer/*" element={
              <RoleGuard allowedRoles={['trainer']}>
                <DashboardLayout />
              </RoleGuard>
            }>
              <Route path="dashboard" element={<TrainerDashboard />} />
              <Route path="schedule-lecture" element={<ScheduleLecture />} />
              <Route path="manage-lectures" element={<ManageLectures />} />
              <Route path="create-course" element={<div className="p-8 text-center">Create Course - Coming Soon</div>} />
              <Route path="manage-courses" element={<div className="p-8 text-center">Manage Courses - Coming Soon</div>} />
              <Route path="students" element={<div className="p-8 text-center">Students - Coming Soon</div>} />
              <Route path="earnings" element={<div className="p-8 text-center">Earnings - Coming Soon</div>} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin/*" element={
              <RoleGuard allowedRoles={['admin']}>
                <DashboardLayout />
              </RoleGuard>
            }>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="manage-users" element={<div className="p-8 text-center">Manage Users - Coming Soon</div>} />
              <Route path="manage-lectures" element={<div className="p-8 text-center">Manage Lectures - Coming Soon</div>} />
              <Route path="manage-courses" element={<div className="p-8 text-center">Manage Courses - Coming Soon</div>} />
              <Route path="analytics" element={<div className="p-8 text-center">Analytics - Coming Soon</div>} />
              <Route path="support" element={<div className="p-8 text-center">Support - Coming Soon</div>} />
              <Route path="settings" element={<div className="p-8 text-center">Settings - Coming Soon</div>} />
            </Route>

            {/* Live Lecture Route */}
            <Route path="/live/:lectureId" element={<div className="p-8 text-center">Live Lecture - Coming Soon</div>} />

            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
