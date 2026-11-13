-- Insercion de usarios de prueba
--admin
INSERT INTO "user" (
    user_name, 
    user_email, 
    user_password, 
    user_status, 
    user_created_at, 
    user_updated_at, 
    is_active, 
    role_pk
) 
VALUES (
    'admin', 
    'geciobri@gmail.com', 
    '$2a$12$J2ycKsi5P/jkTOozXpai0OZFHtZMb5cEo05o3dmoMA/ekNzJYBdFG', -- Hash de la contraseña 'admin' la contraseña es 'password'
    'activo', 
    '2026-11-12', 
    '2026-11-12', 
    true, 
    1
);

--user
INSERT INTO "user" (
    user_name, 
    user_email, 
    user_password, 
    user_status, 
    user_created_at, 
    user_updated_at, 
    is_active, 
    role_pk
) 
VALUES (
    'user', 
    'geciodron@gmail.com', 
    '$2a$12$J2ycKsi5P/jkTOozXpai0OZFHtZMb5cEo05o3dmoMA/ekNzJYBdFG', -- Hash de la contraseña 'user' la contraseña es 'password'
    'activo', 
    '2026-11-12', 
    '2026-11-12', 
    true, 
    2
);