# Cartfront

Front de la prueba tecnica: catalogo con busqueda y filtros, carrito, compra, historial y
administracion de productos, contra **CartAPI**.

Angular 22 - standalone - zoneless - signals - Tailwind v4 - Vitest

## Arquitectura

**Por funcionalidad, no por tipo tecnico.** Cada carpeta de `features/` es una pantalla o un flujo
completo, con su servicio de datos, sus modelos y sus componentes dentro:

```
src/app/
  core/              lo transversal: auth, http, modelos, layout
    auth/            sesion, interceptor del token, guards
    http/            traduccion de errores de la API a mensajes
    layout/shell/    cabecera y contenedor de las paginas
  features/
    auth/  products/  cart/  checkout/  orders/  admin/
      <x>-page/      la pagina enrutada
      ui/<y>/        sus componentes
      <x>.service.ts sus llamadas a la API
  shared/ui/         lo que repiten varias features (pager, paneles de estado)
```

Las lecturas usan `httpResource` (carga, error y recarga ya resueltos); las escrituras,
`HttpClient`. Los recursos se crean **en una funcion, no en un campo**: un campo dispararia la
peticion en cuanto cualquier pantalla inyectase el servicio.

## Levantar

Unico requisito: **Docker**. No necesitas Node, ni pnpm, ni `make`.

**CartAPI tiene que estar arriba antes**: el front se engancha a su red para hablar con ella.

```bash
# 1. en el repo de CartAPI
docker compose up -d --build

# 2. aqui
docker compose up -d --build            # con make:  make up
```

```
http://localhost:8081            el front
http://localhost:8080/swagger    la API
```

nginx sirve la aplicacion y reenvia `/api/` al contenedor de la API, asi que el navegador lo ve
todo en el mismo origen y no hay CORS de por medio.

### Parar

```bash
docker compose down                     # con make:  make down
```

### Configuracion

Todo tiene valor por defecto: el front arranca sin tocar nada. Para cambiar algo:

```bash
cp .env.example .env                    # con make:  make env
```

| Variable | Por defecto | Que es |
|---|---|---|
| `PORT` | `8081` | puerto en el que se publica el front |
| `API_NETWORK` | `cartapi_default` | red de Docker donde vive CartAPI |
| `API_UPSTREAM` | `http://api:8080` | a donde reenvia nginx las llamadas `/api/` |

### Si algo no arranca

| Sintoma | Causa |
|---|---|
| `network cartapi_default not found` | CartAPI no esta levantada. Arrancala primero. |
| El puerto 8081 esta ocupado | `PORT=9000` en el `.env` |
| La API tiene otro nombre de servicio | `API_UPSTREAM=http://otro:8080` |

## Usuarios de prueba

| Rol | Email | Contrasena |
|---|---|---|
| Admin | `admin@cartapi.local` | `Admin123!` |
| Cliente | `cliente@cartapi.local` | `Cliente123!` |

El cliente ve catalogo, carrito y sus compras. El admin ve ademas **Admin**, con el alta, la
edicion y la retirada de productos.

## Recorrido

1. **Ingresar** con el cliente.
2. **Productos** - busca, filtra por categoria, pasa de pagina.
3. **Anadir al carrito** y ajustar cantidades.
4. **Carrito** - pasa de 100,00 $ y aparece el 10 % de descuento. Con 100,00 exactos, no.
5. **Comprar** - el carrito queda vacio y la compra aparece en **Mis compras**.
6. **Salir** y entrar como admin: aparece **Admin** en el menu.

## Desarrollo

Sin Docker. Requiere Node 24 y pnpm 11, con la API corriendo en `http://localhost:8080`.

```bash
pnpm install                            # con make:  make install
pnpm start                              # con make:  make dev     http://localhost:4200
pnpm test                               # con make:  make test
pnpm build                              # con make:  make build
```

En desarrollo el navegador llama a la API directamente, asi que CartAPI debe permitir el origen
del front (`FRONTEND_ORIGIN=http://localhost:4200` en su `.env`, que ya es el valor por defecto).

## Apuntar a otra API

| Fichero | Se usa en | Valor |
|---|---|---|
| `src/environments/environment.development.ts` | `pnpm start` | `http://localhost:8080/api` |
| `src/environments/environment.ts` | `pnpm build` | `/api` |

En produccion es una ruta relativa **a proposito**. Angular compila a ficheros estaticos: lo que
este escrito en `environment.ts` queda dentro del bundle, y **ninguna variable de entorno puede
cambiarlo despues** - el `.env` de la API no tiene equivalente aqui. Dejando `/api`, quien decide a
que servidor se habla es nginx (`API_UPSTREAM`), en el arranque del contenedor y sin recompilar.

## Comandos

`make` a secas los lista. **Docker:** `env` - `up` - `down` - `logs` - `sh`.
**Local:** `install` - `dev` - `build` - `test` - `format`.

## Consideraciones

- **La sesion se guarda en `localStorage`** y un interceptor anade el token a cada llamada. Un
  `401` de la API cierra la sesion y lleva a la pantalla de ingreso.
- **El precio y el descuento que se muestran son los que calcula la API**, nunca recalculados en
  el navegador: lo que ve el usuario es lo que se le va a cobrar.
- **El catalogo se pinta en el orden en que llega** (la API ordena por nombre, con el id de
  desempate). Reordenar en cliente con `localeCompare` daria un orden distinto al del servidor y
  romperia la paginacion.
- **`/admin` esta detras de un `canMatch`**: sin el rol de admin ni siquiera se descarga el codigo
  de esa pantalla.
- **El codigo de un producto no se puede cambiar al editarlo.** Es su identidad, y las compras
  antiguas lo tienen congelado.
- **Retirar un producto no lo borra**: deja de venderse, pero las compras que lo referencian
  siguen integras.
