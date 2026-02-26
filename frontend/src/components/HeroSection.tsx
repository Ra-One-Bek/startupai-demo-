import { section } from "framer-motion/client";
import { div } from "framer-motion/m";
import { useState } from "react";
import Language, {} from "../components/provider/Language" 
import BackgroundHero from "./backgrounds/BackgroundHero";

export default function HeroSection(){
    return(
        <section className="w-screen h-screen bg-gradient-to-t from-white to-[#407BA7] flex flex-col items-center justify-center p-2">
            <BackgroundHero />
            <div className="w-full h-1/2 flex flex-col items-center justify-center gap-3">
                <h1 className="text-3xl font-black text-slate-300">Tabu</h1>
                <div className="w-60 lg:w-100">
                    <p className="font-light text-center text-gray-300">{Language.RU.HeroDescriptionText}</p>
                </div>
            </div>
        </section>
    );
}