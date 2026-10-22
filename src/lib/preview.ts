/**
 * Indica si el sitio se esta sirviendo como vista previa (GitHub Pages).
 *
 * La vista previa es un demo estatico: no hay servidor, ni API, ni base de
 * datos. Los formularios (contacto, newsletter) y el checkout no pueden
 * funcionar, asi que en lugar de dejar que la peticion falle con un error
 * tecnico, se avisa al usuario con un mensaje claro.
 */
export const VISTA_PREVIA = import.meta.env.PUBLIC_PREVIEW === '1';

/** Mensaje que se muestra cuando un formulario no puede enviarse. */
export const MENSAJE_VISTA_PREVIA =
  'Esta es una vista previa del sitio: el formulario no está activo. Escríbenos por WhatsApp o correo.';
