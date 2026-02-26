import { BrowserRouter, Route, Routes } from "react-router-dom"
import Header from "./components/Header"
import JobsSection from "./components/JobsSection"
import HeroSection from "./components/HeroSection";
import LandingSection from "./components/LandingSection";
import LoginPage from "./components/Autorization/LoginPage";



function App() {

  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<LandingSection />}/>
        <Route path="/login" element={<LoginPage />}/>
        <Route path="/Hero" element={<HeroSection />}/>
        <Route path="/jobs" element={<JobsSection />} />
      </Routes>
    </ BrowserRouter>
  );
}

export default App
