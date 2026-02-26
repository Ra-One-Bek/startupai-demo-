export default function LoginPage(){

    return(
        <section className="w-full h-screen bg-gradient-to-t from-[#C6D6F4] to-[#407BA7] flex items-center justify-center">
            <div className="relative w-2/3 h-2/3 bg-[radial-gradient(circle,_#407BA7_0%,_#ffffff_100%)] rounded-full flex items-center justify-center">
                <div className="w-1/2 h-full flex flex-col items-center justify-center">
                    <h1 className="text-8xl font-bold bg-gradient-to-t from-slate-500 to-slate-900 bg-clip-text text-transparent">WAI</h1>
                    <h1 className="text-xl text-gray-600">HR navigator application</h1>
                </div>
                <div className="w-1/2 h-full flex flex-col items-center justify-center gap-2">
                    <input type="login" className="w-85 h-15 bg-white rounded-full p-6 border-1 border-gray-400"/>
                    <input type="password" className="w-85 h-15 bg-white rounded-full p-6 border-1 border-gray-400"/>

                    <div className="w-full flex justify-end">
                        <button className="px-8 py-2 bg-white text-slate-800 rounded-full mr-[150px] mt-[100px]">registration</button>
                    </div>
                </div>
                
            </div>
        </section>
    );
}