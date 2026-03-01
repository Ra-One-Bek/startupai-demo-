import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

type Grade = "junior" | "middle";

type SkillLevel = "basic" | "intermediate" | "advanced";

type Skill = {
  name: string;
  level: SkillLevel;
};

type Experience = {
  id: string;
  title: string;
  company: string;
  start: string; // YYYY-MM
  end: string; // YYYY-MM or ""
  bullets: string[];
};

type Project = {
  id: string;
  name: string;
  description: string;
  tech: string[];
  link: string;
};

type ProfileData = {
  fullName: string;
  email: string;
  city: string;
  targetRole: "Data Analyst";
  grade: Grade | "";
  skills: Skill[];
  experience: Experience[];
  projects: Project[];
  languages: { name: string; level: string }[];
};

const STORAGE_KEY = "profileData";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function normalizeTag(s: string) {
  return s.trim().replace(/\s+/g, " ");
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function isValidEmail(email: string) {
  if (!email.trim()) return true; // email сделаем необязательным
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export default function Resume() {
  const navigate = useNavigate();

  const [step, setStep] = useState<number>(0);

  const [data, setData] = useState<ProfileData>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved) as ProfileData;
      } catch {
        // ignore
      }
    }
    return {
      fullName: "",
      email: "",
      city: "",
      targetRole: "Data Analyst",
      grade: "",
      skills: [],
      experience: [],
      projects: [],
      languages: [{ name: "Русский", level: "родной" }],
    };
  });

  // --- Progress model (можешь легко подстроить веса) ---
  const progress = useMemo(() => {
    // 10 "пунктов" прогресса
    const total = 10;
    let done = 0;

    if (data.fullName.trim().length >= 2) done += 1;
    if (isValidEmail(data.email)) done += 1; // валидный или пустой
    if (data.grade === "junior" || data.grade === "middle") done += 2; // важнее
    if (data.skills.length >= 3) done += 2; // важнее
    if (data.skills.some((s) => s.level)) done += 1;
    if (data.experience.length >= 1 && data.experience.some((e) => e.title.trim().length >= 2)) done += 2;
    if (data.languages.length >= 1 && data.languages.some((l) => l.name.trim())) done += 1;

    const pct = Math.round((done / total) * 100);
    return clamp(pct, 0, 100);
  }, [data]);

  const steps = [
    { title: "Основное", subtitle: "Роль и грейд" },
    { title: "Навыки", subtitle: "Теги + уровень" },
    { title: "Опыт", subtitle: "Можно несколько" },
    { title: "Проекты", subtitle: "Можно пропустить" },
    { title: "Языки", subtitle: "Минимум 1" },
    { title: "Проверка", subtitle: "Готово к анализу" },
  ];

  function saveDraft(next: ProfileData) {
    setData(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  function nextStep() {
    setStep((s) => clamp(s + 1, 0, steps.length - 1));
  }

  function prevStep() {
    setStep((s) => clamp(s - 1, 0, steps.length - 1));
  }

  // --- Validation per step ---
  const stepError = useMemo(() => {
    if (step === 0) {
      if (data.fullName.trim().length < 2) return "Введите имя и фамилию.";
      if (!isValidEmail(data.email)) return "Введите корректный email (или оставьте пустым).";
      if (!data.grade) return "Выберите грейд (Junior/Middle).";
      return "";
    }
    if (step === 1) {
      if (data.skills.length < 3) return "Добавьте минимум 3 навыка.";
      return "";
    }
    if (step === 2) {
      // опыт обязателен (по твоему "да" для обязательных полей)
      if (data.experience.length < 1) return "Добавьте хотя бы 1 опыт (можно учебный/стажировку).";
      const bad = data.experience.some((e) => e.title.trim().length < 2 || !e.start);
      if (bad) return "В опыте заполните должность и дату начала.";
      return "";
    }
    if (step === 3) {
      // проекты могут быть пустыми -> без ошибок
      return "";
    }
    if (step === 4) {
      if (data.languages.length < 1) return "Добавьте хотя бы 1 язык.";
      const bad = data.languages.some((l) => !l.name.trim() || !l.level.trim());
      if (bad) return "Заполните язык и уровень.";
      return "";
    }
    return "";
  }, [data, step]);

  function handleFinish() {
    // финальная проверка (на всякий случай)
    if (data.fullName.trim().length < 2) return;
    if (!isValidEmail(data.email)) return;
    if (!data.grade) return;
    if (data.skills.length < 3) return;
    if (data.experience.length < 1) return;
    if (data.languages.length < 1) return;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    navigate("/result"); // позже поменяешь на реальный API
  }

  // --- UI helpers: TagInput ---
  function TagInput({
    value,
    onChange,
    placeholder = "Например: SQL",
  }: {
    value: string[];
    onChange: (next: string[]) => void;
    placeholder?: string;
  }) {
    const [input, setInput] = useState("");

    function addTag(raw: string) {
      const t = normalizeTag(raw);
      if (!t) return;
      if (value.some((x) => x.toLowerCase() === t.toLowerCase())) return;
      onChange([...value, t]);
      setInput("");
    }

    function removeTag(tag: string) {
      onChange(value.filter((t) => t !== tag));
    }

    return (
      <div className="w-full">
        <div className="flex flex-wrap gap-2 p-3 rounded-xl border border-white/10 bg-white/5">
          {value.map((t) => (
            <button
              type="button"
              key={t}
              onClick={() => removeTag(t)}
              className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/15 transition text-sm"
              title="Нажмите, чтобы удалить"
            >
              {t} ✕
            </button>
          ))}

          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                addTag(input);
              }
              if (e.key === "Backspace" && !input && value.length > 0) {
                onChange(value.slice(0, -1));
              }
            }}
            placeholder={placeholder}
            className="flex-1 min-w-[180px] bg-transparent outline-none text-white placeholder:text-gray-400"
          />
        </div>
        <p className="text-xs text-gray-400 mt-2">Enter или запятая — добавить тег. Клик по тегу — удалить.</p>
      </div>
    );
  }

  // --- Render Step Content ---
  const content = useMemo(() => {
    if (step === 0) {
      return (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Имя и фамилия *">
              <input
                value={data.fullName}
                onChange={(e) => saveDraft({ ...data, fullName: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none"
                placeholder="Например: Rauanbek ..."
              />
            </Field>

            <Field label="Email (опционально)">
              <input
                value={data.email}
                onChange={(e) => saveDraft({ ...data, email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none"
                placeholder="name@mail.com"
              />
              {!isValidEmail(data.email) && (
                <p className="text-xs text-red-300 mt-2">Email выглядит некорректно.</p>
              )}
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Город (опционально)">
              <input
                value={data.city}
                onChange={(e) => saveDraft({ ...data, city: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none"
                placeholder="Алматы"
              />
            </Field>

            <Field label="Целевая роль">
              <input
                value={data.targetRole}
                disabled
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none opacity-80"
              />
              <p className="text-xs text-gray-400 mt-2">В MVP фиксируем роль “Data Analyst”.</p>
            </Field>
          </div>

          <Field label="Грейд *">
            <div className="flex gap-3">
              <RadioButton
                active={data.grade === "junior"}
                onClick={() => saveDraft({ ...data, grade: "junior" })}
                title="Junior"
                subtitle="Начальный уровень"
              />
              <RadioButton
                active={data.grade === "middle"}
                onClick={() => saveDraft({ ...data, grade: "middle" })}
                title="Middle"
                subtitle="Уверенный уровень"
              />
            </div>
          </Field>
        </div>
      );
    }

    if (step === 1) {
      return (
        <div className="space-y-6">
          <Field label="Навыки (минимум 3) *">
            <TagInput
              value={data.skills.map((s) => s.name)}
              onChange={(names) => {
                // сохранить уровни где совпали
                const nextSkills: Skill[] = names.map((n) => {
                  const existing = data.skills.find((x) => x.name.toLowerCase() === n.toLowerCase());
                  return { name: n, level: existing?.level ?? "basic" };
                });
                saveDraft({ ...data, skills: nextSkills });
              }}
              placeholder="Например: SQL, Excel, Python"
            />
          </Field>

          {data.skills.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm text-gray-300">Уровень навыков</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {data.skills.map((sk) => (
                  <div
                    key={sk.name}
                    className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-3"
                  >
                    <div className="font-medium">{sk.name}</div>
                    <select
                      value={sk.level}
                      onChange={(e) => {
                        saveDraft({
                          ...data,
                          skills: data.skills.map((s) => (s.name === sk.name ? { ...s, level: e.target.value as SkillLevel } : s)),
                        });
                      }}
                      className="px-3 py-2 rounded-lg bg-black/30 border border-white/10 outline-none"
                    >
                      <option value="basic">Basic</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    if (step === 2) {
      const exps = data.experience;

      function addExp() {
        const next: Experience = { id: uid(), title: "", company: "", start: "", end: "", bullets: [""] };
        saveDraft({ ...data, experience: [...exps, next] });
      }

      function updateExp(id: string, patch: Partial<Experience>) {
        saveDraft({
          ...data,
          experience: exps.map((e) => (e.id === id ? { ...e, ...patch } : e)),
        });
      }

      function removeExp(id: string) {
        saveDraft({ ...data, experience: exps.filter((e) => e.id !== id) });
      }

      return (
        <div className="space-y-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-gray-300">Добавь опыт (можно учебный проект/стажировку) *</p>
            <button
              type="button"
              onClick={addExp}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 transition font-semibold"
            >
              + Добавить
            </button>
          </div>

          {exps.length === 0 ? (
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-gray-300">
              Пока нет опыта. Нажми “Добавить”.
            </div>
          ) : (
            <div className="space-y-4">
              {exps.map((e, idx) => (
                <div key={e.id} className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-semibold">Опыт #{idx + 1}</div>
                    <button
                      type="button"
                      onClick={() => removeExp(e.id)}
                      className="text-sm text-red-200 hover:text-red-100"
                    >
                      Удалить
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Должность *">
                      <input
                        value={e.title}
                        onChange={(ev) => updateExp(e.id, { title: ev.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 outline-none"
                        placeholder="Junior Data Analyst"
                      />
                    </Field>

                    <Field label="Компания / Проект (опционально)">
                      <input
                        value={e.company}
                        onChange={(ev) => updateExp(e.id, { company: ev.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 outline-none"
                        placeholder="Company / Pet-project"
                      />
                    </Field>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Начало *">
                      <input
                        type="month"
                        value={e.start}
                        onChange={(ev) => updateExp(e.id, { start: ev.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 outline-none"
                      />
                    </Field>

                    <Field label="Конец (опционально)">
                      <input
                        type="month"
                        value={e.end}
                        onChange={(ev) => updateExp(e.id, { end: ev.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 outline-none"
                      />
                    </Field>
                  </div>

                  <Field label="Что делал (буллеты)">
                    <div className="space-y-3">
                      {e.bullets.map((b, i) => (
                        <div key={i} className="flex gap-2">
                          <input
                            value={b}
                            onChange={(ev) => {
                              const nextBullets = [...e.bullets];
                              nextBullets[i] = ev.target.value;
                              updateExp(e.id, { bullets: nextBullets });
                            }}
                            className="flex-1 px-4 py-3 rounded-xl bg-black/20 border border-white/10 outline-none"
                            placeholder="Например: строил отчёты в PowerBI"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const nextBullets = e.bullets.filter((_, j) => j !== i);
                              updateExp(e.id, { bullets: nextBullets.length ? nextBullets : [""] });
                            }}
                            className="px-3 rounded-xl bg-white/10 hover:bg-white/15 transition"
                            title="Удалить"
                          >
                            ✕
                          </button>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => updateExp(e.id, { bullets: [...e.bullets, ""] })}
                        className="text-sm text-purple-200 hover:text-purple-100"
                      >
                        + Добавить пункт
                      </button>
                    </div>
                  </Field>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (step === 3) {
      const projects = data.projects;

      function addProject() {
        const next: Project = { id: uid(), name: "", description: "", tech: [], link: "" };
        saveDraft({ ...data, projects: [...projects, next] });
      }

      function updateProject(id: string, patch: Partial<Project>) {
        saveDraft({
          ...data,
          projects: projects.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        });
      }

      function removeProject(id: string) {
        saveDraft({ ...data, projects: projects.filter((p) => p.id !== id) });
      }

      return (
        <div className="space-y-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-gray-300">Проекты (можно пропустить)</p>
              <p className="text-xs text-gray-400 mt-1">Для Junior проекты очень помогают ИИ понять твой уровень.</p>
            </div>

            <button
              type="button"
              onClick={addProject}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 transition font-semibold"
            >
              + Добавить
            </button>
          </div>

          {projects.length === 0 ? (
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-gray-300">
              Проектов пока нет. Можно добавить или пропустить этот шаг.
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map((p, idx) => (
                <div key={p.id} className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">Проект #{idx + 1}</div>
                    <button
                      type="button"
                      onClick={() => removeProject(p.id)}
                      className="text-sm text-red-200 hover:text-red-100"
                    >
                      Удалить
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Название">
                      <input
                        value={p.name}
                        onChange={(e) => updateProject(p.id, { name: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 outline-none"
                        placeholder="EDA / Dashboard / Pet-project"
                      />
                    </Field>

                    <Field label="Ссылка (опционально)">
                      <input
                        value={p.link}
                        onChange={(e) => updateProject(p.id, { link: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 outline-none"
                        placeholder="https://github.com/..."
                      />
                    </Field>
                  </div>

                  <Field label="Описание">
                    <textarea
                      value={p.description}
                      onChange={(e) => updateProject(p.id, { description: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 outline-none min-h-[100px]"
                      placeholder="1–3 предложения: что сделал и какой результат."
                    />
                  </Field>

                  <Field label="Технологии (теги)">
                    <TagInput
                      value={p.tech}
                      onChange={(tech) => updateProject(p.id, { tech })}
                      placeholder="Например: SQL, PowerBI"
                    />
                  </Field>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => nextStep()}
              className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 transition"
            >
              Пропустить шаг →
            </button>
          </div>
        </div>
      );
    }

    if (step === 4) {
      const langs = data.languages;

      function addLang() {
        saveDraft({ ...data, languages: [...langs, { name: "", level: "" }] });
      }

      function updateLang(i: number, patch: Partial<{ name: string; level: string }>) {
        saveDraft({
          ...data,
          languages: langs.map((l, idx) => (idx === i ? { ...l, ...patch } : l)),
        });
      }

      function removeLang(i: number) {
        const next = langs.filter((_, idx) => idx !== i);
        saveDraft({ ...data, languages: next.length ? next : [{ name: "", level: "" }] });
      }

      return (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <p className="text-gray-300">Языки *</p>
            <button
              type="button"
              onClick={addLang}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 transition font-semibold"
            >
              + Добавить
            </button>
          </div>

          <div className="space-y-3">
            {langs.map((l, i) => (
              <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Язык *">
                    <input
                      value={l.name}
                      onChange={(e) => updateLang(i, { name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 outline-none"
                      placeholder="Русский"
                    />
                  </Field>

                  <Field label="Уровень *">
                    <input
                      value={l.level}
                      onChange={(e) => updateLang(i, { level: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 outline-none"
                      placeholder="A2 / B1 / C1 / родной"
                    />
                  </Field>
                </div>

                <div className="flex justify-end mt-3">
                  <button
                    type="button"
                    onClick={() => removeLang(i)}
                    className="text-sm text-red-200 hover:text-red-100"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // step 5 review
    return (
      <div className="space-y-5">
        <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
          <div className="text-gray-300">
            <div className="text-xl font-semibold text-white">{data.fullName}</div>
            <div className="text-sm text-gray-400 mt-1">
              {data.targetRole} • {data.grade ? data.grade.toUpperCase() : "—"} {data.city ? `• ${data.city}` : ""}
            </div>
            {data.email && <div className="text-sm text-gray-400 mt-1">{data.email}</div>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card title="Навыки">
            <div className="flex flex-wrap gap-2">
              {data.skills.map((s) => (
                <span key={s.name} className="px-3 py-1 rounded-full bg-white/10 text-sm">
                  {s.name} <span className="text-gray-300">({s.level})</span>
                </span>
              ))}
            </div>
          </Card>

          <Card title="Языки">
            <ul className="space-y-2 text-sm text-gray-200">
              {data.languages.map((l, i) => (
                <li key={i} className="flex justify-between gap-3">
                  <span>{l.name}</span>
                  <span className="text-gray-400">{l.level}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <Card title="Опыт">
          <div className="space-y-4">
            {data.experience.map((e) => (
              <div key={e.id} className="p-4 rounded-xl bg-black/20 border border-white/10">
                <div className="font-semibold">{e.title}</div>
                <div className="text-sm text-gray-400">
                  {e.company ? `${e.company} • ` : ""}
                  {e.start} {e.end ? `— ${e.end}` : "— настоящее время"}
                </div>
                {e.bullets.filter(Boolean).length > 0 && (
                  <ul className="list-disc pl-5 mt-2 text-sm text-gray-200 space-y-1">
                    {e.bullets.filter(Boolean).map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </Card>

        <Card title="Проекты (опционально)">
          {data.projects.length === 0 ? (
            <div className="text-sm text-gray-400">Проекты не добавлены.</div>
          ) : (
            <div className="space-y-4">
              {data.projects.map((p) => (
                <div key={p.id} className="p-4 rounded-xl bg-black/20 border border-white/10">
                  <div className="font-semibold">{p.name || "Без названия"}</div>
                  {p.link && (
                    <a className="text-sm text-purple-200 hover:text-purple-100" href={p.link} target="_blank" rel="noreferrer">
                      Открыть ссылку
                    </a>
                  )}
                  {p.description && <div className="text-sm text-gray-200 mt-2">{p.description}</div>}
                  {p.tech.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {p.tech.map((t) => (
                        <span key={t} className="px-3 py-1 rounded-full bg-white/10 text-sm">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setStep(0)}
            className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/15 transition"
          >
            Редактировать
          </button>
          <button
            type="button"
            onClick={handleFinish}
            className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 transition font-semibold"
          >
            Построить трек
          </button>
        </div>
        <div className="w-full h-20">

        </div>
      </div>
      
    );
  }, [data, step]);

  const canGoNext = stepError === "" && step < steps.length - 1;

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white">
      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Header + Progress */}
        <div className="flex flex-col gap-3 mb-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Резюме (шаблон)</h1>
              <p className="text-gray-400 mt-1">
                Шаг {step + 1} из {steps.length}: <span className="text-gray-200">{steps[step].title}</span>
              </p>
            </div>

            <div className="text-right">
              <div className="text-sm text-gray-400">Заполнено</div>
              <div className="text-2xl font-bold">{progress}%</div>
            </div>
          </div>

          <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full bg-purple-600" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Stepper */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2 mb-8">
          {steps.map((s, i) => (
            <button
              key={s.title}
              type="button"
              onClick={() => setStep(i)}
              className={[
                "px-3 py-2 rounded-xl border transition text-left",
                i === step ? "bg-white/10 border-white/20" : "bg-transparent border-white/10 hover:bg-white/5",
              ].join(" ")}
            >
              <div className="text-sm font-semibold">{i + 1}. {s.title}</div>
              <div className="text-xs text-gray-400">{s.subtitle}</div>
            </button>
          ))}
        </div>

        {/* Content Card */}
        <div className="p-7 rounded-2xl bg-white/5 border border-white/10 shadow-xl">
          {content}

          {stepError && step !== 5 && (
            <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-100">
              {stepError}
            </div>
          )}

          {/* Navigation */}
          {step !== 5 && (
            <div className="flex items-center justify-between gap-3 mt-8">
              <button
                type="button"
                onClick={prevStep}
                disabled={step === 0}
                className={[
                  "px-5 py-3 rounded-xl transition",
                  step === 0 ? "bg-white/5 text-gray-500 cursor-not-allowed" : "bg-white/10 hover:bg-white/15",
                ].join(" ")}
              >
                ← Назад
              </button>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    // сохранить и выйти на профиль (если нужно)
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
                    navigate("/profile");
                  }}
                  className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 transition"
                >
                  Сохранить и выйти
                </button>

                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!canGoNext && step !== 3} // step 3 можно пропустить отдельной кнопкой внутри
                  className={[
                    "px-5 py-3 rounded-xl transition font-semibold",
                    canGoNext ? "bg-purple-600 hover:bg-purple-700" : "bg-purple-600/40 cursor-not-allowed",
                  ].join(" ")}
                >
                  Далее →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="text-sm text-gray-300">{label}</div>
      {children}
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
      <div className="font-semibold mb-3">{title}</div>
      {children}
    </div>
  );
}

function RadioButton({
  active,
  onClick,
  title,
  subtitle,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  subtitle: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex-1 p-4 rounded-2xl border text-left transition",
        active ? "bg-purple-600/20 border-purple-500/50" : "bg-white/5 border-white/10 hover:bg-white/10",
      ].join(" ")}
    >
      <div className="text-lg font-semibold">{title}</div>
      <div className="text-sm text-gray-300 mt-1">{subtitle}</div>
    </button>
  );
}