import requests
import json
import time
import os

# Создаем папку data, если её нет
os.makedirs("data", exist_ok=True)

# Константы
HH_API_URL = "https://api.hh.ru/vacancies"
USER_AGENT = "CareerNavigatorApp/1.0 (my_email@gmail.com)"

def get_vacancies(keyword, area=40):
    """
    Скачивает вакансии с HH.kz
    area=40 (Казахстан), 160 (Алматы), 159 (Астана)
    """
    params = {
        "text": keyword,
        "area": area,
        "per_page": 20,
        "page": 0,
        "responses_count_enabled": True,
        "only_with_salary": False
    }

    headers = {
        "User-Agent": USER_AGENT
    }

    print(f"📡 Ищу вакансии: '{keyword}'...")

    try:
        response = requests.get(HH_API_URL, params=params, headers=headers)
        response.raise_for_status()
        
        data = response.json()
        items = data.get("items", [])
        
        print(f"✅ Найдено на странице: {len(items)}")
        print(f"🌍 Всего на сайте: {data.get('found')}")
        
        return items

    except Exception as e:
        print(f"❌ Ошибка: {e}")
        return []

def save_to_json(vacancies, filename="data/raw_vacancies.json"):
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(vacancies, f, ensure_ascii=False, indent=4)
    print(f"💾 Сохранено в: {filename}")

if __name__ == "__main__":
    vacs = get_vacancies("Data Analyst")
    if vacs:
        save_to_json(vacs)