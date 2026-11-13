-- Insercion de Roles 
INSERT INTO "role" (
    role_name, 
    role_description,
    is_active

) 
VALUES (
    'admin', 
    'Administrador de producciones', 
    true
);

INSERT INTO "role" (
    role_name, 
    role_description,
    is_active

) 
VALUES (
    'user', 
    'Animador', 
    true
);