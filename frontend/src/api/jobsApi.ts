// src/api/jobsApi.ts

export type FeedItem = {
  id: number;
  title: string;
  salary?: string;
  url?: string;
  match_percent?: number;
  skills?: string[];
};

export type Job = {
  id: number;
  title: string;
  description: string;
  img: string;
};

const FEED_URL = "https://nonappellate-materialistically-iliana.ngrok-free.dev/feed";

export async function fetchJobs(): Promise<Job[]> {
  const res = await fetch(FEED_URL, {
    // иногда нужно для ngrok, если появляется warning-страница
    headers: { "ngrok-skip-browser-warning": "true" },
  });

  if (!res.ok) throw new Error(`API error: HTTP ${res.status}`);

  const data: FeedItem[] = await res.json();

  // адаптируем данные API под твой Job (title/description/img)
  return (Array.isArray(data) ? data : []).map((x) => {
    const parts: string[] = [];
    if (x.salary) parts.push(`💰 ${x.salary}`);
    if (typeof x.match_percent === "number") parts.push(`✅ Match: ${x.match_percent}%`);
    if (x.skills?.length) parts.push(`🧩 Skills: ${x.skills.join(", ")}`);
    if (x.url) parts.push(`🔗 ${x.url}`);

    return {
      id: x.id,
      title: x.title,
      description: parts.join("\n") || "—",
      img: "",
    };
  });
}