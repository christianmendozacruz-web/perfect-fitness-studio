# The Perfect Fitness Studio — sitio web

Sitio estático de **The Perfect Fitness Studio** (Tecámac y Pachuca). Dominio: **theperfectfit.mx**

## Estructura

```
index.html          Página principal (Tecámac + general)
pachuca/index.html  Página de la sucursal Pachuca
assets/app.js       Menú, carrusel, calendario de clases, reservas por WhatsApp y preguntas frecuentes
assets/img/         Imágenes del sitio
robots.txt, sitemap.xml
```

No necesita compilación: son archivos HTML, CSS y JavaScript listos para publicar.

## Publicar en Cloudflare (Workers & Pages)

1. Entra a **dash.cloudflare.com → Workers & Pages → Create → Pages → Connect to Git**.
2. Autoriza GitHub y elige el repositorio `christianmendozacruz-web/perfect-fitness-studio`.
3. Configuración de compilación:
   - **Framework preset:** None
   - **Build command:** (vacío)
   - **Build output directory:** `/`
   - **Production branch:** `main`
4. **Save and Deploy.** Cloudflare publica el sitio en una dirección `*.pages.dev`.
5. Cada vez que se suba un cambio a `main`, Cloudflare vuelve a publicar automáticamente.

## Conectar el dominio theperfectfit.mx (GoDaddy)

1. En Cloudflare: **Add a domain → theperfectfit.mx → plan Free**. Cloudflare te da **2 nameservers**.
2. En GoDaddy: **Mis productos → theperfectfit.mx → DNS → Nameservers → Cambiar → Usar mis propios nameservers** y pega los 2 de Cloudflare. Guarda.
3. Espera a que Cloudflare marque el dominio como **Active** (de minutos a 24 h).
4. En Cloudflare: **Workers & Pages → perfect-fitness-studio → Custom domains → Set up a custom domain** y agrega `theperfectfit.mx` y `www.theperfectfit.mx`.
5. Listo: el sitio queda en https://theperfectfit.mx con certificado SSL automático.

## Datos pendientes

- Requisitos de inscripción, condiciones de la clase muestra e inscripción del Plan Boxeo (preguntas frecuentes).
- Aviso de privacidad.
- Fotos de la sucursal Pachuca y confirmación de sus precios.
