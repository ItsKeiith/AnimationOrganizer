Recordar que el proyecto se corre con:
desde el backend uvicorn main:app --reload
desde el front npm start

Aqui esta el modelo Er del la base de datos 
https://drive.google.com/file/d/1ekLW32YefGeZByezGg7kNa9VP85Rusyi/view?usp=sharing


Todavia no hice algo en la capa de servicio para agregar un usuario, cuando agreguen un usuario desde postman
usen https://bcrypt-generator.com
y en las env deje el secret subi las avriables de entorno para que no haya problema ya leugo guardamos el repo sin las env 
al agreagr el password recuerden que se va a desencriptar cuando hagan un login

03/11/2026 Corregir German en la tarde 
hay que regenerar la base de datos y hacer pruebas con el pipeline 
tambien hay que hacer la interfaz de manejo de proyectos en el front 
usamos tailwind 

Se abrio una carpeta para hacer manejos de proyectos en el front
de esta pasamos al proyecto 

Hay que reaser la parte de roles en la base de datos para que estan asignadas a el proyecto por usuario y luego regeneramos 