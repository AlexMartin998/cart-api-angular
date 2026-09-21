# Cartfront

Front de la prueba técnica: catálogo con búsqueda y filtros, carrito, compra, historial y
administración de productos, contra **CartAPI**.

Angular 22 · standalone · zoneless · signals · Tailwind v4 · Vitest

## Arquitectura

**Por funcionalidad, no por tipo técnico.** Cada carpeta de `features/` es una pantalla o un flujo
completo, con su servicio de datos, sus modelos y sus componentes dentro:

```
src/app/
  core/              lo transversal: auth, http, modelos, layout
    auth/            sesión, interceptor del token, guards
    http/            traducción de errores de la API a mensajes
    layout/shell/    cabecera y contenedor de las páginas
  features/
    auth/  products/  cart/  checkout/  orders/  admin/
      <x>-page/      la página enrutada
      ui/<y>/        sus componentes
      <x>.service.ts sus llamadas a la API
  shared/ui/         lo que repiten varias features (pager, paneles de estado)
```

Las lecturas usan `httpResource` (carga, error y recarga ya resueltos); las escrituras,
`HttpClient`. Los recursos se crean **en una función, no en un campo**: un campo dispararía la
petición en cuanto cualquier pantalla inyectase el servicio.

## Levantar

Único requisito: **Docker**. No necesitas Node, ni pnpm, ni `make`.

**CartAPI tiene que estar arriba antes**: el front se engancha a su red para hablar con ella.

```bash
# 1. en el repo de CartAPI
docker compose up -d --build

# 2. aquí
docker compose up -d --build            # con make:  make up
```

```
http://localhost:8081            el front
http://localhost:8080/swagger    la API
```

nginx sirve la aplicación y reenvía `/api/` al contenedor de la API, así que el navegador lo ve
todo en el mismo origen y no hay CORS de por medio.

### Parar

```bash
docker compose down                     # con make:  make down
```

### Configuración

Todo tiene valor por defecto: el front arranca sin tocar nada. Para cambiar algo:

```bash
cp .env.example .env                    # con make:  make env
```

| Variable | Por defecto | Qué es |
|---|---|---|
| `PORT` | `8081` | puerto en el que se publica el front |
| `API_NETWORK` | `cartapi_default` | red de Docker donde vive CartAPI |
| `API_UPSTREAM` | `http://api:8080` | a dónde reenvía nginx las llamadas `/api/` |

### Si algo no arranca

| Síntoma | Causa |
|---|---|
| `network cartapi_default not found` | CartAPI no está levantada. Arráncala primero. |
| El puerto 8081 está ocupado | `PORT=9000` en el `.env` |
| La API tiene otro nombre de servicio | `API_UPSTREAM=http://otro:8080` |

## Usuarios de prueba

| Rol | Email | Contraseña |
|---|---|---|
| Admin | `admin@cartapi.local` | `Admin123!` |
| Cliente | `cliente@cartapi.local` | `Cliente123!` |

El cliente ve catálogo, carrito y sus compras. El admin ve además **Admin**, con el alta, la
edición y la retirada de productos.

## Recorrido

1. **Ingresar** con el cliente.
2. **Productos** — busca, filtra por categoría, pasa de página.
3. **Añadir al carrito** y ajustar cantidades.
4. **Carrito** — pasa de 100,00 $ y aparece el 10 % de descuento. Con 100,00 exactos, no.
5. **Comprar** — el carrito queda vacío y la compra aparece en **Mis compras**.
6. **Salir** y entrar como admin: aparece **Admin** en el menú.

## Desarrollo

Sin Docker. Requiere Node 24 y pnpm 11, con la API corriendo en `http://localhost:8080`.

```bash
pnpm install                            # con make:  make install
pnpm start                              # con make:  make dev     http://localhost:4200
pnpm test                               # con make:  make test
pnpm build                              # con make:  make build
```

En desarrollo el navegador llama a la API directamente, así que CartAPI debe permitir el origen
del front (`FRONTEND_ORIGIN=http://localhost:4200` en su `.env`, que ya es el valor por defecto).

## Apuntar a otra API

| Fichero | Se usa en | Valor |
|---|---|---|
| `src/environments/environment.development.ts` | `pnpm start` | `http://localhost:8080/api` |
| `src/environments/environment.ts` | `pnpm build` | `/api` |

En producción es una ruta relativa **a propósito**. Angular compila a ficheros estáticos: lo que
esté escrito en `environment.ts` queda dentro del bundle, y **ninguna variable de entorno puede
cambiarlo después** — el `.env` de la API no tiene equivalente aquí. Dejando `/api`, quien decide a
qué servidor se habla es nginx (`API_UPSTREAM`), en el arranque del contenedor y sin recompilar.

## Comandos

`make` a secas los lista. **Docker:** `env` · `up` · `down` · `logs` · `sh`.
**Local:** `install` · `dev` · `build` · `test` · `format`.

## Consideraciones

- **La sesión se guarda en `localStorage`** y un interceptor añade el token a cada llamada. Un
  `401` de la API cierra la sesión y lleva a la pantalla de ingreso.
- **El precio y el descuento que se muestran son los que calcula la API**, nunca recalculados en
  el navegador: lo que ve el usuario es lo que se le va a cobrar.
- **El catálogo se pinta en el orden en que llega** (la API ordena por nombre, con el id de
  desempate). Reordenar en cliente con `localeCompare` daría un orden distinto al del servidor y
  rompería la paginación.
- **`/admin` está detrás de un `canMatch`**: sin el rol de admin ni siquiera se descarga el código
  de esa pantalla.
- **El código de un producto no se puede cambiar al editarlo.** Es su identidad, y las compras
  antiguas lo tienen congelado.
- **Retirar un producto no lo borra**: deja de venderse, pero las compras que lo referencian
  siguen íntegras.
