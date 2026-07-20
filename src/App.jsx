import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Lenis from 'lenis';
import LandingPage from './pages/LandingPage';
import SubjectSelectionPage from './pages/SubjectSelectionPage';
import ChapterSelectionPage from './pages/ChapterSelectionPage';
import ChapterMarksView from './pages/ChapterMarksView';
import ChapterNotes from './pages/ChapterNotes';
import PhysicsDerivationsPage from './pages/PhysicsDerivationsPage';
import PhysicsGraphsPage from './pages/PhysicsGraphsPage';
import EnglishDashboard from './pages/EnglishDashboard';
import UnseenPassageInstructions from './pages/UnseenPassageInstructions';
import UnseenPassageViewer from './pages/UnseenPassageViewer';
import WritingSkillsDashboard from './pages/WritingSkillsDashboard';
import WritingSkillRenderer from './pages/WritingSkillRenderer';
import WritingSkillsInstructions from './pages/WritingSkillsInstructions';
import { MocksPage, MockTestPage, MockResultsPage } from './pages/mock';
import CreatorPage from './pages/CreatorPage';
import QuestionsPracticePage from './pages/QuestionsPracticePage';
import './index.css';

import { ThemeProvider } from './context/ThemeContext';
import ScrollToTop from './components/ScrollToTop';
import SearchModal from './components/SearchModal';
import Navbar from './components/Navbar';

function App() {
  // Smooth scrolling via Lenis
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.09,
      duration: 1.2,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => lenis.destroy();
  }, []);

  return (
    <ThemeProvider>
      <Router>
        <ScrollToTop />
        <SearchModal />
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/subjects" element={<SubjectSelectionPage />} />
          <Route path="/subjects/:subjectId/chapters" element={<ChapterSelectionPage />} />
          <Route path="/subjects/:subjectId/literature" element={<ChapterSelectionPage />} />
          <Route path="/subjects/english/dashboard" element={<EnglishDashboard />} />
          <Route path="/subjects/english/unseen" element={<UnseenPassageInstructions />} />
          <Route path="/subjects/english/unseen/passage/:passageId" element={<UnseenPassageViewer />} />
          <Route path="/subjects/english/writing" element={<WritingSkillsDashboard />} />
          <Route path="/subjects/english/writing/instructions" element={<WritingSkillsInstructions />} />
          <Route path="/subjects/english/writing/:skillId" element={<WritingSkillRenderer />} />
          {/* Chapter Marks View - Static exam-focused layout */}
          <Route path="/subjects/:subjectId/chapters/:chapterId" element={<ChapterMarksView />} />
          {/* Chapter Notes - Dynamic JSON-loaded notes with LaTeX */}
          <Route path="/subjects/:subjectId/chapters/:chapterId/notes" element={<ChapterNotes />} />
          {/* Work in Progress: Physics Derivations */}
          <Route path="/subjects/physics/chapters/:chapterId/derivations" element={<PhysicsDerivationsPage />} />
          {/* Physics Graph Analysis & Variations */}
          <Route path="/subjects/physics/chapters/:chapterId/graphs" element={<PhysicsGraphsPage />} />
          {/* Physics Questions Practice Room */}
          <Route path="/subjects/:subjectId/chapters/:chapterId/practice" element={<QuestionsPracticePage />} />
          {/* Mock Test Routes */}
          <Route path="/mocks" element={<MocksPage />} />
          <Route path="/mock/:id" element={<MockTestPage />} />
          <Route path="/mock/:id/results" element={<MockResultsPage />} />
          {/* Creator Profile */}
          <Route path="/creator" element={<CreatorPage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
