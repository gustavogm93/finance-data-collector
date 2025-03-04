# Finance Data Collector

Esta aplicación recopila y almacena datos financieros de empresas de EE.UU., Argentina y Europa utilizando Docker, PostgreSQL y Node.js.

## Características

- Recopila información de empresas de mercados de EE.UU. (NYSE, NASDAQ)
- Recopila información de empresas de Argentina (BCBA)
- Recopila información de las 600 mejores empresas europeas
- Almacena datos en PostgreSQL con esquema relacional
- Tablas normalizadas para países, sectores y mercados
- Ejecución programada diaria para mantener datos actualizados
- Volumen persistente para datos de PostgreSQL
- API REST básica para verificar estado y desencadenar recopilación de datos manualmente

## Requisitos

- Docker
- Docker Compose
- Una clave API para algún servicio de datos financieros (como Financial Modeling Prep, Alpha Vantage, etc.)

## Estructura del Proyecto

```
.
├── app
│   ├── index.js                # Punto de entrada principal
│   ├── data-collectors.js      # Módulos para recopilar datos de distintas fuentes
│   ├── db-operations.js        # Operaciones de base de datos
│   ├── logger.js               # Configuración de registro
│   └── package.json            # Dependencias de Node.js
├── docker-compose.yml          # Configuración de servicios Docker
├── Dockerfile                  # Construcción de la imagen de la aplicación
├── init-db.sql                 # Inicialización del esquema de base de datos
└── README.md                   # Este archivo
```

## Instalación y Ejecución

1. Clone este repositorio:

   ```
   git clone https://github.com/tuusuario/finance-data-collector.git
   cd finance-data-collector
   ```

2. Cree un directorio para la aplicación:

   ```
   mkdir -p app/logs
   ```

3. Configure su clave API editando el archivo `docker-compose.yml` y cambiando `your_finance_api_key_here` por su clave API real.

4. Inicie los servicios:

   ```
   docker-compose up -d
   ```

5. Verifique que todo funcione correctamente:
   ```
   docker-compose logs -f app
   ```

## Puntos Finales API

- `GET /`: Comprueba si el servicio está en funcionamiento
- `GET /collect`: Activa manualmente el proceso de recopilación de datos

## Datos Almacenados

La aplicación almacena los siguientes datos para cada empresa:

- Nombre de la empresa
- Símbolo/ticker
- País (código ISO de dos letras)
- Sector (financiero, tecnología, etc.)
- Mercado (NYSE, NASDAQ, BCBA, etc.)

Los sectores, países y mercados se almacenan en tablas separadas para normalización.

## Personalización

Puede modificar los archivos para ajustar:

- La frecuencia de recopilación de datos (en `index.js`, modificando la programación cron)
- Las fuentes de datos financieros (en `data-collectors.js`)
- El esquema de la base de datos (en `init-db.sql`)

## Notas importantes

- Asegúrese de que su clave API tenga acceso a los datos necesarios
- La aplicación realiza una recopilación inicial al arrancar
- Los datos se actualizan automáticamente todos los días a la 1:00 AM
# finance-data-collector
