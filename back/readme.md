# backend de la app

- verificar la version de (node -v) - use siempre la version LTS long time support
- instalar paquetes basicos / npm i express nodemon cors mysql2
nodemon : actualice el servidor ante los cambios
express : hacer las rutas de los metodos http (get,put,post,delete)
cors (Cross-Origin Resource Sharing) : administrar la seguridad de las ips 
mysql : capa para conectar con la bd mysql

-se va a trabajar con ES6 por tanto hay que habilitar modulos en el package.json / "type": "module"

- se instala el paquete dotenv que nos permite manejar variables globales del proyecto


-Se crea la api ciudadanos con:
  -Listartodos
  -buscarxid
  -crear