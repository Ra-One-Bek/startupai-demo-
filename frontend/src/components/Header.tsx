import { useState } from "react";
import { Router, useNavigate } from "react-router-dom";
import SearchModal from "./SearchModal";
import { AnimatePresence } from "framer-motion";


export default function Header(){
    const [isOpenModal, setIsOpenModal] = useState(false);

    const navigate = useNavigate();
    return(
        <header className="fixed w-full h-20 flex bottom-0 lg:top-0 bg-slate-900/90 lg:bg-purple-900/20 items-center justify-center">
            
            <ul className=" w-1/2 flex items-center justify-center gap-5 text-white">
                <li onClick={() => navigate("/jobs")} className="font-bold cursor-pointer">jobs</li>
                <li>
                    <div onClick={() => navigate("/")} className="w-15 h-15 bg-white rounded-full text-blue-900 flex items-center justify-center cursor-pointer">
                        <h1>Tabu.kz</h1>
                    </div>
                </li>
                <li onClick={() => setIsOpenModal(true)} className="font-bold cursor-pointer">search</li>
            </ul>

            <AnimatePresence>
                {isOpenModal && (
                    <SearchModal onClose={() => setIsOpenModal(false)} />
                )}
            </AnimatePresence>
        </header>
    );
}