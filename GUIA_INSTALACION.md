# Guía de Instalación y Ejecución Local (Proyecto Semilla)

Sigue estos sencillos pasos para levantar el entorno de desarrollo de esta aplicación Next.js y Prisma en tu propia computadora.

## 1. Requisitos Previos
Asegúrate de tener instalados universalmente:
- **Node.js** (Se recomienda la versión 18 o superior)
- **Git** (Para clonar el repositorio)

## 2. Descargar el Proyecto
Abre tu terminal y clona el proyecto (reemplaza la URL resaltada por el enlace real a tu repositorio de GitHub o descarga el .zip):
```bash
git clone https://github.com/j03l1725/Proyecto-Semilla.git
cd Proyecto-Semilla
```

## 3. Instalar Dependencias
Instala los paquetes necesarios definidos en el `package.json` (Next.js, Tailwind, Recharts, Prisma, etc.):
```bash
npm install
```

## 4. Configurar Variables de Entorno
Crea un archivo llamado `.env.local` en la misma carpeta raíz en la que te encuentras. Debe contener estrictamente las credenciales de tu base de datos (PostgreSQL como Supabase, Neon o Render). 

Añade esto dentro de tu `.env.local`:
```env
# Ejemplo conectando a Supabase o tu DB
DATABASE_URL="postgres://usuario:tupassword@host:5432/postgres?pgbouncer=true"
DIRECT_URL="postgres://usuario:tupassword@host:5432/postgres"
```

## 5. Configurar y Llenar la Base de Datos (Prisma)
Una vez guardadas las variables de entorno, es momento de sincronizar el ORM (Prisma) con tu base de datos remota para crear las tablas y rellenarlas. Sigue este orden de comandos de arriba a abajo:

Generar el cliente interno de base de datos:
```bash
npx prisma generate
```

Sincronizar la estructura (tablas de Compañías, Encuestas, Opciones, etc.) con la base de datos real:
```bash
npx prisma db push
```

Poblar el catálogo de la plataforma con las preguntas y dimensiones oficiales (El Seed):
```bash
npx prisma db seed
```

## 6. Levantar el Servidor de Desarrollo
Finalmente, arranca la aplicación de Next.js en tu máquina local:
```bash
npm run dev
```

Abra su navegador en [http://localhost:3000](http://localhost:3000) para ver y navegar por la aplicación corriendo de modo interactivo.

---

### Comandos Extra Útiles
- Explorar y ver los datos (como respuestas de clientes) visualmente a través del navegador:  
  `npx prisma studio`
- Compilar el proyecto a producción (ideal para cerciorarse de que no existan errores antes de subir a Vercel):  
  `npm run build`
