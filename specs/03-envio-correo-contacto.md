# Spec 03 — Envío de correo en formulario de contacto

**Estado:** aprobado  
**Depende de:** Spec 02  
**Fecha:** 2026-10-25  
**Objetivo:** Conectar el formulario de contacto de la pantalla About a Resend para enviar correos reales a maxicomputer72@gmail.com.

---

## Alcance

### Dentro

- Instalar el paquete `resend`
- Crear `app/api/contact/route.ts` — endpoint POST que recibe `{ name, email, msg }` y usa Resend para enviar el correo a `maxicomputer72@gmail.com`
- Actualizar `components/About.tsx` — añadir estados `loading` y `error`; `onSubmit` hace fetch al API route; botón muestra `▶ ENVIANDO…` y se deshabilita durante el envío; error inline en magenta si falla
- Añadir clase `.form-error` a `app/globals.css` para el mensaje de error
- Documentar `RESEND_API_KEY` en `.env.local` (no se sube al repo)

### Fuera

- Verificar dominio propio en Resend (se usa `onboarding@resend.dev` como `from`)
- Rate limiting o anti-spam en el API route
- Adjuntos o plantillas HTML elaboradas en el correo
- Almacenar los mensajes enviados en base de datos o localStorage
- Cambios visuales al formulario más allá de los estados loading/error

---

## Modelo de datos

No se introducen nuevas interfaces en `data.ts`. El body del POST es una estructura ad-hoc:

```ts
// request body (JSON)
{ name: string; email: string; msg: string }

// response body en éxito (HTTP 200)
{ ok: true }

// response body en error (HTTP 400 / 500)
{ ok: false; message: string }
```

Variable de entorno requerida en `.env.local`:

```
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
```

---

## Plan de implementación

1. **Instalar dependencia**
   ```
   npm install resend
   ```

2. **`.env.local`** — añadir la variable (paso manual; el desarrollador pega su clave de Resend):
   ```
   RESEND_API_KEY=re_XXXXXXXXXXXXXXXXXXXXXXX
   ```

3. **`app/api/contact/route.ts`** — crear el directorio `app/api/contact/` y el archivo:
   - Importar `Resend` de `"resend"` y leer `process.env.RESEND_API_KEY`
   - Si falta la clave, devolver `500 { ok: false, message: "Configuración incompleta" }`
   - Parsear el body JSON; validar que `name`, `email` y `msg` no estén vacíos (guardia server-side)
   - Llamar `resend.emails.send({ from: "onboarding@resend.dev", to: "maxicomputer72@gmail.com", subject: ..., text: ... })`
   - En éxito: devolver `200 { ok: true }`
   - En error de Resend: devolver `500 { ok: false, message: error.message }`

4. **`components/About.tsx`** — actualizar el estado y el submit:
   - Añadir `const [loading, setLoading] = useState(false)` y `const [error, setError] = useState<string | null>(null)`
   - `onSubmit` se convierte en `async`; hace `fetch("/api/contact", { method: "POST", body: JSON.stringify(form) })`
   - Mientras espera: `setLoading(true)`; al terminar: `setLoading(false)`
   - Si `ok: true` → `setSent(form.name.trim())`
   - Si `ok: false` → `setError(data.message)`
   - Botón: `disabled={loading}` + texto condicional `loading ? "▶ ENVIANDO…" : "▶  ENVIAR MENSAJE"`
   - Debajo del botón: `{error && <p className="form-error">{error}</p>}`
   - Limpiar `error` al iniciar un nuevo envío

5. **`app/globals.css`** — añadir al final:
   ```css
   .form-error {
     color: var(--magenta);
     font-family: var(--mono);
     font-size: 0.75rem;
     margin-top: 0.5rem;
   }
   ```

---

## Criterios de aceptación

- [ ] Al enviar el formulario con datos válidos, el botón muestra `▶ ENVIANDO…` y queda deshabilitado
- [ ] Tras el envío exitoso, aparece el terminal de éxito con el nombre del usuario
- [ ] El correo llega a maxicomputer72@gmail.com con nombre, email y mensaje del remitente
- [ ] Si Resend devuelve error, aparece un mensaje de error inline en magenta sin borrar los campos
- [ ] El botón "ENVIAR OTRO MENSAJE" limpia el estado de error junto con el formulario
- [ ] Sin `RESEND_API_KEY`, el API route devuelve 500 y el formulario muestra el error inline
- [ ] `tsc --noEmit` pasa sin errores
- [ ] Las demás pantallas (Home, Library, GameDetail, GamePlayer, Auth, HallOfFame) no tienen regresiones

---

## Decisiones tomadas

- **`onboarding@resend.dev` como from**: evita requerir un dominio verificado para desarrollo; Resend permite enviar a cualquier destinatario desde esta dirección en el plan gratuito.
- **Validación también en el server**: el cliente ya valida antes de hacer fetch, pero el API route repite la guardia para no depender del cliente.
- **Error inline en magenta, sin modal**: coherente con el estilo de error del formulario de auth existente en el proyecto.
- **No se guarda el mensaje en localStorage**: el objetivo es solo transmitirlo; no hay valor en persistirlo localmente.

---

## Riesgos

- **Resend plan gratuito**: límite de 100 emails/día; suficiente para desarrollo pero recordarlo en producción.
- **`onboarding@resend.dev` en producción**: este dominio es solo para pruebas; en producción se deberá verificar un dominio propio y actualizar el `from`.
- **CORS / Next.js middleware**: el API route está en el mismo origen que el cliente; no hay CORS que configurar, pero si en el futuro se separa el frontend del backend hay que revisarlo.
