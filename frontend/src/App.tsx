import { BrowserRouter, Route, Routes } from "react-router-dom"
import Header from "./components/Header"
import JobsSection from "./components/JobsSection"
import HeroSection from "./components/HeroSection";



function App() {

  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<HeroSection />}/>
        <Route path="/jobs" element={<JobsSection />} />
      </Routes>
    </ BrowserRouter>
  );
}

export default App
