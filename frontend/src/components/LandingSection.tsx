export default function LandingSection() {
    
    const infoCard = [
        { id: 1, title: "AI analyze", translateX: "300px", translateY: "-150px" },
        { id: 2, title: "Vacancy", translateX: "330px", translateY: "-80px" },
        { id: 3, title: "Courses", translateX: "360px", translateY: "-10px" },
        { id: 4, title: "AI help", translateX: "-330px", translateY: "100px" },
        { id: 5, title: "AI recommendation", translateX: "-290px", translateY: "170px" },
    ];

    return (
        <section className="relative w-full h-screen bg-gradient-to-t from-white to-[#407BA7] flex flex-col items-center justify-center">
            
            <div className="w-80 h-100 bg-white rounded-full">
                {/* head AI 3D */}
            </div>

            {infoCard.map((item) => (
                <div
                    key={item.id}
                    className="absolute px-15 py-3 bg-white rounded-xl shadow-md"
                    style={{
                        transform: `translate(${item.translateX}, ${item.translateY})`
                    }}
                >
                    <p>{item.title}</p>
                </div>
            ))}
        </section>
    );
}