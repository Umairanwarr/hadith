import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import CourseDetails from "@/pages/course-details";
import VideoPlayer from "@/pages/video-player";
import Exam from "@/pages/exam";
import Certificates from "@/pages/certificates";
import LevelsPage from "@/pages/levels";
import DiplomasPage from "@/pages/diplomas";
import Profile from "@/pages/profile";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminCreateCourse from "@/pages/admin-create-course";
import AdminCreateExam from "@/pages/admin-create-exam";
import AdminCourseDetails from "@/pages/admin-course-details";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/courses/:id" component={CourseDetails} />
          <Route path="/courses/:courseId/lessons/:lessonId" component={VideoPlayer} />
          <Route path="/courses/:courseId/exam" component={Exam} />
          <Route path="/certificates" component={Certificates} />
          <Route path="/levels" component={LevelsPage} />
          <Route path="/diplomas" component={DiplomasPage} />
          <Route path="/profile" component={Profile} />
          <Route path="/admin" component={AdminDashboard} />
          <Route path="/admin/create-course" component={AdminCreateCourse} />
          <Route path="/admin/create-exam" component={AdminCreateExam} />
          <Route path="/admin/courses/:id" component={AdminCourseDetails} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
