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
import { LectureDetails } from "./pages/student/LectureDetails";
import { Support } from "./pages/student/Support";
import { TrainerDashboard } from "./pages/trainer/TrainerDashboard";
import { ScheduleLecture } from "./pages/trainer/ScheduleLecture";
import { ManageLectures } from "./pages/trainer/ManageLectures";
import { CreateCourse } from "./pages/trainer/CreateCourse";
import { ManageCourses } from "./pages/trainer/ManageCourses";
import { Earnings } from "./pages/trainer/Earnings";
import { Students } from "./pages/trainer/Students";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { ManageUsers } from "./pages/admin/ManageUsers";
import { ManageLectures as ManageLecturesAdmin } from "./pages/admin/ManageLectures";
import { ManageCourses as ManageCoursesAdmin } from "./pages/admin/ManageCourses";
import { Analytics } from "./pages/admin/Analytics";
import { AdminSupport } from "./pages/admin/AdminSupport";
import { LiveLecture } from "./pages/LiveLecture";
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
              <Route path="lecture/:id" element={<LectureDetails />} />
              <Route path="lecture/:id/details" element={<LectureDetails />} />
              <Route path="wallet" element={<StudentWallet />} />
              <Route path="support" element={<Support />} />
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
              <Route path="create-course" element={<CreateCourse />} />
              <Route path="manage-courses" element={<ManageCourses />} />
              <Route path="students" element={<Students />} />
              <Route path="earnings" element={<Earnings />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin/*" element={
              <RoleGuard allowedRoles={['admin']}>
                <DashboardLayout />
              </RoleGuard>
            }>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="manage-users" element={<ManageUsers />} />
              <Route path="manage-lectures" element={<ManageLecturesAdmin />} />
              <Route path="manage-courses" element={<ManageCoursesAdmin />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="support" element={<AdminSupport />} />
            </Route>

            {/* Live Lecture Route */}
            <Route path="/live/:lectureId" element={
              <RoleGuard allowedRoles={['student', 'trainer']}>
                <LiveLecture />
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
