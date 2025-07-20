import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { ThemeProvider } from "@/contexts/ThemeContext";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import CourseDetails from "@/pages/course-details";
import VideoPlayer from "@/pages/video-player";
import Exam from "@/pages/exam";
import Certificates from "@/pages/certificates";
import LevelsPage from "@/pages/levels";
import DiplomasPage from "@/pages/diplomas";
import IjazasPage from "@/pages/ijazas";
import DiplomaSamples from "@/pages/diploma-samples";
import Teachers from "@/pages/teachers";
import Profile from "@/pages/profile";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminCreateCourse from "@/pages/admin-create-course";
import AdminCreateExam from "@/pages/admin-create-exam";
import AdminCourseDetails from "@/pages/admin-course-details";
import { DiplomaPreparatoryPage } from "@/pages/diploma-preparatory";
import { DiplomaIntermediatePage } from "@/pages/diploma-intermediate";
import { DiplomaCertificatePage } from "@/pages/diploma-certificate";
import { DiplomaBachelorPage } from "@/pages/diploma-bachelor";
import { DiplomaMasterPage } from "@/pages/diploma-master";
import { DiplomaDoctoratePage } from "@/pages/diploma-doctorate";
import { TeacherGuidePage } from "@/pages/teacher-guide";
import { QuickAddPage } from "@/pages/quick-add";
import { LiveSessionsPage } from "@/pages/live-sessions";
import { AdminLiveSessionsPage } from "@/pages/admin-live-sessions";
import { TestRemindersPage } from "@/pages/test-reminders";
import { ManageLiveSessionsPage } from "@/pages/manage-live-sessions";
import { DiplomaManagementPage } from "@/pages/diploma-management";
import { CertificateGeneratorPage } from "@/pages/certificate-generator";
import { SampleCertificatesPage } from "@/pages/sample-certificates";
import { CourseManagementPage } from "@/pages/course-management";
import AboutUniversity from "@/pages/about-university";
import ThemeSettings from "@/pages/theme-settings";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-amiri">جارٍ التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/course/:id" component={CourseDetails} />
          <Route path="/course/:courseId/lessons/:lessonId" component={VideoPlayer} />
          <Route path="/course/:courseId/exam" component={Exam} />
          <Route path="/certificates" component={Certificates} />
          <Route path="/levels" component={LevelsPage} />
          <Route path="/diplomas" component={DiplomasPage} />
          <Route path="/ijazas" component={IjazasPage} />
          <Route path="/diploma-samples" component={DiplomaSamples} />
          <Route path="/teachers" component={Teachers} />
          <Route path="/profile" component={Profile} />
          <Route path="/diploma/preparatory" component={DiplomaPreparatoryPage} />
          <Route path="/diploma/intermediate" component={DiplomaIntermediatePage} />
          <Route path="/diploma/certificate" component={DiplomaCertificatePage} />
          <Route path="/diploma/bachelor" component={DiplomaBachelorPage} />
          <Route path="/diploma/master" component={DiplomaMasterPage} />
          <Route path="/diploma/doctorate" component={DiplomaDoctoratePage} />
          <Route path="/admin" component={AdminDashboard} />
          <Route path="/admin/create-course" component={AdminCreateCourse} />
          <Route path="/admin/create-exam" component={AdminCreateExam} />
          <Route path="/admin/courses/:id" component={AdminCourseDetails} />
          <Route path="/teacher-guide" component={TeacherGuidePage} />
          <Route path="/quick-add" component={QuickAddPage} />
          <Route path="/live-sessions" component={LiveSessionsPage} />
          <Route path="/admin/live-sessions" component={AdminLiveSessionsPage} />
          <Route path="/test-reminders" component={TestRemindersPage} />
          <Route path="/manage-live-sessions" component={ManageLiveSessionsPage} />
          <Route path="/diploma-management" component={DiplomaManagementPage} />
          <Route path="/certificates" component={CertificateGeneratorPage} />
          <Route path="/sample-certificates" component={SampleCertificatesPage} />
          <Route path="/course-management" component={CourseManagementPage} />
          <Route path="/theme-settings" component={ThemeSettings} />
        </>
      )}
      <Route path="/about-university" component={AboutUniversity} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
