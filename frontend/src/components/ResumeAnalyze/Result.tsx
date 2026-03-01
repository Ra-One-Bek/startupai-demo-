import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

type Grade = "junior" | "middle";
type SkillLevel = "basic" | "intermediate" | "advanced";

type Skill = {
  name: string;
  level: SkillLevel;
};

type ProfileData = {
  fullName: string;
  email: string;
  city: string;
  targetRole: "Data Analyst";
  grade: Grade | "";
  skills: Skill[];
  experience: any[];
  projects: any[];
  languages: { name: string; level: string }[];
};

const STORAGE_KEY = "profileData";

// Мок требований рынка (позже заменишь на API/DB)
const MARKET_SKILLS: Record<Grade, string[]> = {
  junior: ["SQL", "Excel", "Power BI", "Python", "Statistics", "Data Cleaning", "Visualization"],
  middle: ["SQL", "Python", "Power BI", "A/B Testing", "ETL", "Data Modeling", "Statistics", "Dashboards", "Git"],
};

function normalize(s: string) {
  return s.trim().toLowerCase();
}

function uniq(arr: string[]) {
  return Array.from(new Set(arr));
}

function titleCase(s: string) {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function Result() {
  const navigate = useNavigate();

  const profile: ProfileData | null = useMemo(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    try {
      return JSON.parse(saved) as ProfileData;
    } catch {
      return null;
    }
  }, []);

  const grade = (profile?.grade || "junior") as Grade;

  const userSkills = useMemo(() => {
    if (!profile) return [];
    return uniq(profile.skills.map((s) => s.name));
  }, [profile]);

  const marketSkills = useMemo(() => {
    return MARKET_SKILLS[grade];
  }, [grade]);

  const gapSkills = useMemo(() => {
    const userSet = new Set(userSkills.map(normalize));
    return marketSkills.filter((s) => !userSet.has(normalize(s)));
  }, [userSkills, marketSkills]);

  const matchPercent = useMemo(() => {
    const total = marketSkills.length || 1;
    const have = total - gapSkills.length;
    return Math.round((have / total) * 100);
  }, [marketSkills.length, gapSkills.length]);

  const plan = useMemo(() => {
    // Простой план на 4 недели: берём gap и распределяем
    const gaps = gapSkills.length ? gapSkills : ["Portfolio polish", "Interview prep"];
    const weeks = 4;

    const chunks: string[][] = Array.from({ length: weeks }, () => []);
    gaps.forEach((skill, idx) => chunks[idx % weeks].push(skill));

    return [
      {
        week: 1,
        focus: chunks[0],
        tasks: [
          "Разобрать базовые понятия и терминологию",
          "Сделать 1 мини-задачу/упражнение и записать выводы",
          "Добавить 1 пункт в резюме/проект (если применимо)",
        ],
      },
      {
        week: 2,
        focus: chunks[1],
        tasks: [
          "Углубить практику: 2–3 задачи",
          "Собрать короткий конспект/шпаргалку",
          "Обновить портфолио (README/описание проекта)",
        ],
      },
      {
        week: 3,
        focus: chunks[2],
        tasks: [
          "Сделать мини-проект или улучшить существующий",
          "Добавить метрики/результаты (цифры) в описание",
          "Потренировать 5 вопросов для собеседования",
        ],
      },
      {
        week: 4,
        focus: chunks[3],
        tasks: [
          "Повторить все темы + закрыть пробелы",
          "Собрать итоговый проект/кейсы в портфолио",
          "Сделать пробное интервью (сам/с другом)",
        ],
      },
    ];
  }, [gapSkills]);

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white flex items-center justify-center px-6">
        <div className="max-w-lg w-full p-8 rounded-2xl bg-white/5 border border-white/10">
          <h1 className="text-2xl font-bold">Нет данных профиля</h1>
          <p className="text-gray-300 mt-3">
            Похоже, резюме ещё не заполнено. Перейдите на страницу резюме и заполните шаблон.
          </p>
          <button
            onClick={() => navigate("/resume")}
            className="mt-6 w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 transition font-semibold"
          >
            Перейти к резюме
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white">
      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Результат анализа</h1>
            <p className="text-gray-400 mt-2">
              {profile.fullName} • {profile.targetRole} • {grade.toUpperCase()}
              {profile.city ? ` • ${profile.city}` : ""}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 w-full md:w-auto">
            <div className="text-sm text-gray-400">Совпадение с рынком</div>
            <div className="text-3xl font-bold">{matchPercent}%</div>
            <div className="text-xs text-gray-400 mt-1">
              (мок: сравнение с базовыми требованиями)
            </div>
          </div>
        </div>

        {/* Blocks */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Block title="Твои навыки">
            <Tags items={userSkills} emptyText="Навыки не указаны." />
          </Block>

          <Block title="Требования рынка">
            <Tags items={marketSkills} />
          </Block>

          <Block title="Skill Gap (что добавить)">
            <Tags items={gapSkills} emptyText="Пробелов не найдено — отлично!" />
          </Block>
        </div>

        {/* Plan */}
        <div className="mt-8 p-7 rounded-2xl bg-white/5 border border-white/10">
          <h2 className="text-2xl font-bold">План обучения (4 недели)</h2>
          <p className="text-gray-400 mt-2">
            Сфокусируйся на пробелах. Цель — закрыть основные навыки рынка и улучшить портфолио.
          </p>

          <div className="mt-6 space-y-4">
            {plan.map((w) => (
              <div key={w.week} className="p-5 rounded-2xl bg-black/20 border border-white/10">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div className="text-lg font-semibold">Неделя {w.week}</div>
                  <div className="text-sm text-gray-300">
                    Фокус:{" "}
                    {w.focus.length ? w.focus.map(titleCase).join(", ") : "Повторение и закрепление"}
                  </div>
                </div>

                <ul className="list-disc pl-6 mt-3 text-gray-200 space-y-1">
                  {w.tasks.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate("/resume")}
            className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/15 transition"
          >
            Редактировать резюме
          </button>
          <button
            onClick={() => navigate("/profile")}
            className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 transition font-semibold"
          >
            На профиль
          </button>
        </div>
        <div className="w-full h-20">

        </div>
      </div>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
      <div className="font-semibold mb-3">{title}</div>
      {children}
    </div>
  );
}

function Tags({ items, emptyText }: { items: string[]; emptyText?: string }) {
  if (!items || items.length === 0) {
    return <div className="text-sm text-gray-400">{emptyText ?? "Пусто."}</div>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((t) => (
        <span key={t} className="px-3 py-1 rounded-full bg-white/10 text-sm">
          {t}
        </span>
      ))}
    </div>
    
  );
}