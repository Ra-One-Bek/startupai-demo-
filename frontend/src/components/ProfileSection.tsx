import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type ProfileData = {
  targetGrade?: "junior" | "middle";
  skills?: string[];
};

export default function ProfileSection() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("profileData");
    if (saved) {
      setProfile(JSON.parse(saved));
    }
  }, []);

  const handleAddResume = () => {
    navigate("/resume");
  };

  const handleBuildTrack = () => {
    navigate("/result");
  };

  return (
    <section className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-black to-gray-900 text-white px-6">
      
      <div className="max-w-xl w-full bg-white/5 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-white/10">
        
        <h2 className="text-3xl font-bold mb-6 text-center">
          Ваш профиль
        </h2>

        {!profile ? (
          <div className="text-center space-y-6">
            <p className="text-gray-300">
              У вас пока нет заполненного резюме.
            </p>

            <button
              onClick={handleAddResume}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-xl transition duration-300 font-semibold"
            >
              Добавить резюме
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            
            <div className="bg-white/10 p-4 rounded-xl">
              <p className="text-sm text-gray-400">Грейд</p>
              <p className="text-lg font-semibold capitalize">
                {profile.targetGrade}
              </p>
            </div>

            <div className="bg-white/10 p-4 rounded-xl">
              <p className="text-sm text-gray-400">Навыки</p>
              <p className="text-lg">
                {profile.skills?.slice(0, 5).join(", ")}
                {profile.skills && profile.skills.length > 5 && "..."}
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleAddResume}
                className="w-1/2 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl transition duration-300"
              >
                Редактировать
              </button>

              <button
                onClick={handleBuildTrack}
                className="w-1/2 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl transition duration-300 font-semibold"
              >
                Построить трек
              </button>
            </div>

          </div>
        )}
      </div>
    </section>
  );
}