import time
import requests
import psycopg2
import os
from dotenv import load_dotenv

HEADERS = {"User-Agent": "CareerAI/1.0 (test@test.com)"}

# params
AREA_ID = 160
ROLE_IDS = range(1, 175)

load_dotenv()

# DB connection
HOST = os.getenv("DB_HOST")
DBNAME = os.getenv("DB_NAME")
USER = os.getenv("DB_USER")
PASSWORD = os.getenv("DB_PASSWORD")
PORT = os.getenv("DB_PORT")

TARGET_TABLE = "hh_vacancies"


def get_connection():
    return psycopg2.connect(
        host=HOST,
        dbname=DBNAME,
        user=USER,
        password=PASSWORD,
        port=PORT
    )


def fetch_vacancies(role_id, page=0, per_page=100):
    
    # generate url
    url = f"https://api.hh.ru/vacancies?area={AREA_ID}&professional_role={role_id}&page={page}&per_page={per_page}"

    r = requests.get(url, headers=HEADERS, timeout=15)

    if r.status_code == 200:
        print(f"Fetching: {r.url}")
        return r.json()

    elif r.status_code == 429:
        print("Rate limit reached, sleeping 5s...")
        time.sleep(5)
        return fetch_vacancies(role_id, page, per_page)

    else:
        print(f"HH error {r.status_code} role={role_id}")
        return None


def extract_fields(item):

    salary = item.get("salary") or {}
    area = item.get("area") or {}

    professional_roles = item.get("professional_roles") or []
    role_id = professional_roles[0].get("id") if professional_roles else None

    work_schedule = item.get("work_schedule_by_days") or []
    schedule_id = work_schedule[0].get("id") if work_schedule else None

    return (
        item.get("id"),
        item.get("name"),
        item.get("alternate_url"),
        salary.get("from"),
        salary.get("to"),
        salary.get("currency"),
        int(area.get("id")) if area.get("id") else None,
        int(role_id) if role_id else None,
        item.get("experience", {}).get("id"),
        schedule_id
    )


def insert_batch(conn, batch):

    sql = f"""
    INSERT INTO {TARGET_TABLE}
    (
        id,
        name,
        url,
        salary_from,
        salary_to,
        salary_currency,
        area_id,
        role_id,
        exp_id,
        schedule_id
    )
    VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
    ON CONFLICT (id) DO NOTHING
    """

    cur = conn.cursor()
    cur.executemany(sql, batch)
    conn.commit()
    cur.close()


def run_parser():

    conn = get_connection()

    for role_id in ROLE_IDS:

        print(f"\nProcessing role {role_id}")

        page = 0

        while True:

            data = fetch_vacancies(role_id, page)

            if not data:
                break

            items = data.get("items", [])

            if not items:
                break

            batch = [extract_fields(item) for item in items]

            insert_batch(conn, batch)

            print(f"Inserted {len(batch)} rows (role={role_id}, page={page})")

            if page >= data.get("pages", 0) - 1:
                break

            page += 1

            time.sleep(0.5)

    conn.close()

    print("\nDONE.")


if __name__ == "__main__":
    run_parser()