import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import SearchModal from "./SearchModal";
import { Heart, Home, Layers, Search, User } from "lucide-react";

export default function Header() {
    const [isOpenModal, setIsOpenModal] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const isLanding = location.pathname === "/";
    const isLogin = location.pathname === "/login";

    return (
        <>
            {/* TOP TITLE */}
            <div className="fixed top-6 w-full flex justify-center z-50">
                <h1 onClick={() => navigate("/")} className="text-3xl font-light text-white tracking-widest cursor-pointer">
                    WAI
                </h1>
            </div>

            {/* BOTTOM BAR */}
            <header className="fixed bottom-6 w-full flex justify-center z-50">
                <div className="w-[90%] max-w-md h-16 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg">

                    {isLanding ? (
                        // ✅ If Landing page → show login button
                        <button
                            onClick={() => navigate("/login")}
                            className="w-full h-full text-slate-900 rounded-full font-semibold hover:bg-blue-200 hover:scale-105 transition"
                        >
                            Go to login
                        </button>
                    ) : isLogin ? (
                        <button
                            onClick={() => navigate("/hero")}
                            className="w-full h-full text-slate-900 rounded-full font-semibold hover:bg-blue-200/20 transition"
                        >
                            Далее
                        </button>
                    ) : (
                        // ✅ Normal navigation icons
                        <ul className="w-full flex items-center justify-around text-black">
                            <li onClick={() => navigate("/hero")} className="cursor-pointer"><Home /></li>
                            <li onClick={() => navigate("/favorites")} className="cursor-pointer"><Heart /></li>
                            <li onClick={() => navigate("/jobs")} className="cursor-pointer"><Layers /></li>
                            <li onClick={() => setIsOpenModal(true)} className="cursor-pointer"><Search /></li>
                            <li onClick={() => navigate("/profile")} className="cursor-pointer"><User /></li>
                        </ul>
                    )}
                </div>
            </header>

            <AnimatePresence>
                {isOpenModal && (
                    <SearchModal onClose={() => setIsOpenModal(false)} />
                )}
            </AnimatePresence>
        </>
    );
}