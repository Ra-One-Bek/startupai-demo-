SELECT 
    v.id,
    v.name,
    v.url,
    a.name AS area_name,
    hpc.name as category_name,
    r.name AS role_name,
    e.name AS exp_name,
    s.name AS schedule_name,
    v.salary_from,
    v.salary_to,
    v.salary_currency
FROM hh_vacancies v
LEFT JOIN hh_areas a ON v.area_id = a.id
LEFT JOIN hh_prof_roles r ON v.role_id = r.id
LEFT JOIN hh_exps e ON v.exp_id = e.id
LEFT JOIN hh_schedules s ON v.schedule_id = s.id
left join hh_prof_categories hpc  on hpc.id = r.category_id 
