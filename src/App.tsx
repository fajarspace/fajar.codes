import { lazy } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useParams,
} from "react-router-dom";
import { ThemeProvider } from "@/hooks/useTheme";
import { ToastProvider } from "@/hooks/useToast";
import { AuthProvider } from "@/hooks/useAuth";
import { CommandPaletteProvider } from "@/hooks/useCommandPalette";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { RequireAdmin } from "@/components/admin/RequireAdmin";
import { Toaster } from "@/components/common/Toaster";

// Route-based code splitting: every page is its own chunk.
const HomePage = lazy(() => import("@/pages/public/HomePage"));
const WorkPage = lazy(() => import("@/pages/public/WorkPage"));
const ProjectDetailPage = lazy(
  () => import("@/pages/public/ProjectDetailPage"),
);
const NotesPage = lazy(() => import("@/pages/public/NotesPage"));
const NoteDetailPage = lazy(() => import("@/pages/public/NoteDetailPage"));
const PhotosPage = lazy(() => import("@/pages/public/PhotosPage"));
const NotFoundPage = lazy(() => import("@/pages/public/NotFoundPage"));

const LoginPage = lazy(() => import("@/pages/admin/LoginPage"));
const DashboardPage = lazy(() => import("@/pages/admin/DashboardPage"));
const ProjectsAdminPage = lazy(() => import("@/pages/admin/ProjectsAdminPage"));
const ProjectEditorPage = lazy(() => import("@/pages/admin/ProjectEditorPage"));
const NotesAdminPage = lazy(() => import("@/pages/admin/NotesAdminPage"));
const NoteEditorPage = lazy(() => import("@/pages/admin/NoteEditorPage"));
const PhotosAdminPage = lazy(() => import("@/pages/admin/PhotosAdminPage"));
const NowAdminPage = lazy(() => import("@/pages/admin/NowAdminPage"));
const ProfileAdminPage = lazy(() => import("@/pages/admin/ProfileAdminPage"));

/** Old links used /notes/:slug — send them to the new address. */
function LegacyNoteRedirect() {
  const { slug = "" } = useParams();
  return <Navigate to={`/${slug}`} replace />;
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <CommandPaletteProvider>
              <Routes>
                <Route element={<PublicLayout />}>
                  <Route index element={<HomePage />} />
                  <Route path="work" element={<WorkPage />} />
                  <Route path="work/:slug" element={<ProjectDetailPage />} />
                  <Route path="notes" element={<NotesPage />} />
                  <Route path="notes/:slug" element={<LegacyNoteRedirect />} />
                  <Route path="photos" element={<PhotosPage />} />
                  {/* Notes live at the root: /:slug (static routes above win over the param). */}
                  <Route path=":slug" element={<NoteDetailPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Route>

                <Route path="admin/login" element={<LoginPage />} />
                <Route
                  path="admin"
                  element={
                    <RequireAdmin>
                      <AdminLayout />
                    </RequireAdmin>
                  }
                >
                  <Route index element={<DashboardPage />} />
                  <Route path="projects" element={<ProjectsAdminPage />} />
                  <Route path="projects/new" element={<ProjectEditorPage />} />
                  <Route path="projects/:id" element={<ProjectEditorPage />} />
                  <Route path="notes" element={<NotesAdminPage />} />
                  <Route path="notes/new" element={<NoteEditorPage />} />
                  <Route path="notes/:id" element={<NoteEditorPage />} />
                  <Route path="photos" element={<PhotosAdminPage />} />
                  <Route path="now" element={<NowAdminPage />} />
                  <Route path="profile" element={<ProfileAdminPage />} />
                  <Route path="*" element={<Navigate to="/admin" replace />} />
                </Route>
              </Routes>
              <Toaster />
            </CommandPaletteProvider>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
