# Reporting Dashboard — Prueba Técnica

Dashboard de reporting para e-commerce. Cruza datos de Meta Ads, Google Ads y tiendas para calcular métricas reales de negocio: profit, ROAS, CPM, ticket promedio, etc.

---

## Requisitos previos

- **Node.js** >= 18
- **PostgreSQL** corriendo localmente

## Pre-instalado

- **Next.js** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui** (listo para usar — agregá componentes con `npx shadcn@latest add [componente]`)

---

## 1. Configurar la base de datos

Se debe abrir pgadmin, conectarse al usuario y crear una base de datos.

Ejecutar el seed contra tu instancia de PostgreSQL. El script crea las tablas y carga 30 días de datos de prueba para 2 organizaciones:

```bash
psql -U USUARIO -d NOMBRE_DB -f database/seed.sql
```

Tablas que se crean: `organization`, `meta_ads_data`, `google_ads_data`, `store_data`.

---

## 2. Variables de entorno

Crear el archivo `.env.local` en la raíz del proyecto:

```env
DATABASE_URL=postgresql://postgres:<password>@localhost:5432/escalify
```

---

## 3. Instalar dependencias y levantar la app

```bash
npm install
npm run dev
```

La app estará disponible en `http://localhost:3000`.

## 4. Consumir la API de reporting

```
GET /api/reporting?orgId=1&startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&metrics=revenue,profit,roas
```

### Métricas disponibles

`meta_spend` · `meta_impressions` · `google_spend` · `google_impressions` · `revenue` · `orders` · `fees` · `meta_cpm` · `google_cpm` · `average_order_value` · `total_spend` · `profit` · `roas`

---

## Arquitectura y decisiones técnicas

La aplicación fue diseñada siguiendo un enfoque simple basado en separación de responsabilidades (Separation of Concerns) y una arquitectura por capas.
Cada módulo tiene una responsabilidad clara y evita mezclar lógica de negocio, acceso a datos y capa HTTP.

```
API Layer
↓
Reporting Service
↓
Data Access
↓
Database
```

--

Dentro del sistema de reporting, los módulos están organizados de la siguiente manera:

```
lib/
├── db.ts → conexión a PostgreSQL
└── reporting/
├── types.ts → tipos de datos
├── query.ts → recuperación de datos
├── metrics.ts → lógica de métricas de negocio
└── index.ts → orquestación del sistema de reporting
```

Esta organización sigue el principio Single Responsibility Principle (SRP) donde cada archivo tiene una responsabilidad única.

### Función de reporting independiente

La función `getReport()` actúa como el orquestador del sistema de reporting.
Esta función es independiente de la capa HTTP y no tiene conocimiento del endpoint.

Esto permite reutilizar la lógica de reporting en distintos contextos, por ejemplo:

- endpoints de API
- Server Components
- jobs programados (cron)
- tests automatizados

El endpoint `/api/reporting` simplemente actúa como una capa de transporte que recibe los parámetros HTTP y delega el cálculo del reporte a `getReport()`.

---

## Decisiones clave

### Separación entre datos crudos y métricas de negocio

La query SQL (query.ts) se encarga únicamente de recuperar datos agregados por día desde las distintas fuentes.
Las métricas derivadas se calculan en metrics.ts.

Separar estas responsabilidades permite:

- mantener las queries SQL simples
- centralizar la lógica de negocio
- agregar nuevas métricas sin modificar el SQL

Por ejemplo, agregar una métrica nueva solo requiere modificar metrics.ts, siempre que los datos crudos necesarios ya estén presentes.

### Uso de SQL directo en lugar de ORM

Se utilizó SQL directo con pg en lugar de un ORM.

Dado que el dataset y las consultas de reporting están claramente definidos, un ORM hubiera agregado complejidad innecesaria sin aportar beneficios claros para este caso.

SQL explícito permite mantener el control sobre las agregaciones y simplifica el desarrollo para este tipo de consultas analíticas.

### Enfoque en simplicidad

El objetivo fue mantener una solución simple, clara y mantenible, evitando sobre-ingeniería.

Dado que se trata de un sistema de reporting relativamente pequeño, prioricé:

- claridad del flujo de datos
- modularidad
- facilidad para extender métricas
