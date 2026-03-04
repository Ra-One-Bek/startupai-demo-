import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useState } from "react";

import Header from "./components/Header";
import JobsSection from "./components/JobsSection";
import HeroSection from "./components/HeroSection";
import LandingSection from "./components/LandingSection";
import LoginPage from "./components/Autorization/LoginPage";
import ProfileSection from "./components/ProfileSection";
import Resume from "./components/ResumeAnalyze/Resume";
import Result from "./components/ResumeAnalyze/Result";

import PreLoader from "./components/PreLoader";

function App() {
  const [loading, setLoading] = useState(true);

  if (loading) {
    return (
      <PreLoader
        durationMs={3200}
        onComplete={() => setLoading(false)}
      />
    );
  }

  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<LandingSection />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/Hero" element={<HeroSection />} />
        <Route path="/jobs" element={<JobsSection />} />
        <Route path="/profile" element={<ProfileSection />} />
        <Route path="/resume" element={<Resume />} />
        <Route path="/result" element={<Result />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;