import os
import sys
import requests
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime
from sqlalchemy.orm import sessionmaker, declarative_base
from datetime import datetime
from dotenv import load_dotenv

# 1. Загружаем секреты
load_dotenv()
DB_URL = os.getenv("DATABASE_URL")

if not DB_URL:
    print("❌ Ошибка: Не найден DATABASE_URL в файле .env")
    sys.exit(1)

# 2. Настройка Базы Данных (SQLAlchemy)
Base = declarative_base()
engine = create_engine(DB_URL)
SessionLocal = sessionmaker(bind=engine)

# 3. Описание Таблицы (Модель)
class Vacancy(Base):
    __tablename__ = "vacancies"

    id = Column(Integer, primary_key=True) # Наш внутренний ID
    hh_id = Column(String, unique=True)    # ID вакансии на HH (чтобы не дублировать)
    title = Column(String)                 # Название должности
    salary_from = Column(Integer, nullable=True)
    salary_to = Column(Integer, nullable=True)
    url = Column(String)
    description = Column(Text, nullable=True) # Полный текст
    published_at = Column(DateTime, default=datetime.utcnow)

# 4. Функция Парсинга (упрощенная версия из прошлого урока)
def fetch_vacancies(keyword, count=10):
    url = "https://api.hh.ru/vacancies"
    params = {
        "text": keyword,
        "area": 40,           # Казахстан
        "per_page": count,    # Берем ровно столько, сколько просили
        "page": 0
    }
    headers = {"User-Agent": "CareerAI/1.0 (test@test.com)"}
    
    print(f"📡 Скачиваю {count} вакансий '{keyword}' с HH.kz...")
    resp = requests.get(url, params=params, headers=headers)
    
    if resp.status_code == 200:
        return resp.json().get("items", [])
    else:
        print(f"Ошибка HH: {resp.status_code}")
        return []

# 5. Главная функция ETL
def run_etl():
    # А. Создаем таблицу в БД (если её нет)
    Base.metadata.create_all(bind=engine)
    print("✅ Таблица 'vacancies' проверена/создана.")

    # Б. Получаем данные
    raw_vacancies = fetch_vacancies("Data Engineer", count=10)
    
    # В. Сохраняем в БД
    session = SessionLocal()
    saved_count = 0
    
    for item in raw_vacancies:
        # Проверяем, есть ли уже такая вакансия в базе
        exists = session.query(Vacancy).filter_by(hh_id=item['id']).first()
        if exists:
            print(f"⚠️ Вакансия {item['id']} уже есть, пропускаем.")
            continue

        # Обработка зарплаты
        sal = item.get('salary') or {}
        
        # Создаем объект
        new_vac = Vacancy(
            hh_id=item['id'],
            title=item['name'],
            salary_from=sal.get('from') if sal else None,
            salary_to=sal.get('to') if sal else None,
            url=item['alternate_url'],
            # Описание (snippet) пока берем короткое, полное описание надо грузить отдельным запросом
            description=item.get('snippet', {}).get('responsibility') 
        )
        
        session.add(new_vac)
        saved_count += 1
    
    session.commit()
    session.close()
    print(f"🎉 Готово! Сохранено новых вакансий: {saved_count}")

if __name__ == "__main__":
    run_etl()