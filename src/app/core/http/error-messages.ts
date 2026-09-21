import { ApiError } from './api-error';


const MESSAGE_BY_CODE: Readonly<Record<string, string>> = {
  network: 'No hay conexión con el servidor. Revisa tu conexión e inténtalo de nuevo.',
  invalid_credentials: 'Correo o contraseña incorrectos.',
  unauthorized: 'Tu sesión expiró. Vuelve a ingresar.',
  forbidden: 'No tienes permiso para hacer esto.',
  validation_error: 'Revisa los campos marcados.',
  insufficient_stock: 'No hay suficientes unidades disponibles.',
  cart_empty: 'Tu carrito está vacío.',
  cart_item_not_found: 'Ese producto ya no está en tu carrito.',
  product_not_found: 'El producto ya no está disponible.',
  order_not_found: 'No encontramos ese pedido.',
  not_found: 'No encontramos lo que buscas.',
  conflict: 'La información cambió mientras trabajabas. Vuelve a intentarlo.',
  internal_error: 'Algo salió mal de nuestro lado. Inténtalo de nuevo.',
};

const FALLBACK = 'No pudimos completar la operación. Inténtalo de nuevo.';

export function errorMessage(error: ApiError): string {
  return MESSAGE_BY_CODE[error.code] ?? FALLBACK;
}


export function fieldMessages(error: ApiError): Record<string, string> {
  return Object.fromEntries(
    Object.entries(error.fieldErrors).map(([field, messages]) => [field, messages[0]]),
  );
}
