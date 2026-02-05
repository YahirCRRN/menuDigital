# Menu Magic

Aplicación web para gestión de menú y pedidos con carrito de compras.

## 🚀 Características

- Visualización de menú por categorías
- Carrito de compras interactivo
- Formulario de cliente con opciones de recogida y entrega
- Integración con Supabase para el backend
- Diseño responsivo

## 🛠️ Configuración del entorno

1. Clona el repositorio:
   ```sh
   git clone https://github.com/tu-usuario/menu-magic.git
   cd menu-magic
   ```

2. Instala las dependencias:
   ```sh
   npm install
   ```

3. Configura las variables de entorno:
   - Copia el archivo `.env.example` a `.env`
   - Completa las variables con tus credenciales de Supabase

4. Inicia el servidor de desarrollo:
   ```sh
   npm run dev
   ```

5. Abre tu navegador en [http://localhost:5173](http://localhost:5173)

## 🔒 Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
```

## 📁 Estructura del Proyecto

```
├── src/
│   ├── components/     # Componentes reutilizables
│   ├── lib/           # Utilidades y configuraciones
│   ├── pages/         # Páginas de la aplicación
│   ├── App.tsx        # Componente principal
│   └── main.tsx       # Punto de entrada
├── public/            # Archivos estáticos
└── index.html         # Plantilla HTML principal
```

## 🧪 Ejecutar tests

```sh
npm run test
```

## 🏗️ Construir para producción

```sh
npm run build
```

## 🤝 Contribuir

1. Haz un Fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Haz commit de tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Haz push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Distribuido bajo la licencia MIT. Ver `LICENSE` para más información.

## ✉️ Contacto

Tu Nombre - [@tuusuario](https://twitter.com/tuusuario)

Enlace del proyecto: [https://github.com/tu-usuario/menu-magic](https://github.com/tu-usuario/menu-magic)
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
