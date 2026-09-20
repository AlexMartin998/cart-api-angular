# Cartfront

Frontend Angular de la prueba técnica: catálogo, carrito, compra e historial contra **CartAPI**.

## Requisitos

- Node 24
- pnpm 11
- CartAPI corriendo (por defecto en `http://localhost:8080`)

## Arrancar

```sh
pnpm install
pnpm start          # http://localhost:4200
```

## Apuntar a otra API

La URL vive en `src/environments/`:

| Fichero | Se usa en | Valor |
|---|---|---|
| `environment.development.ts` | `pnpm start` | `http://localhost:8080/api` |
| `environment.ts` | `pnpm build` | `/api` |

## Comandos

```sh
pnpm start    # servidor de desarrollo
pnpm build    # compilación de producción
pnpm test     # tests (Vitest)
```

## Estructura

```
src/app/
  core/       servicios transversales: sesión, HTTP, errores
  shared/     piezas reutilizables sin negocio
  features/   auth · products · cart · checkout · orders
```
