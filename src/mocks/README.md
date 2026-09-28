# `mocks/` — Datos y adaptadores temporales

Esta carpeta contiene únicamente sustitutos locales del backend para desarrollo
de interfaz. Ninguna página, componente o hook debe importar estos módulos de
forma directa.

- `clients.mock-data.ts`: valores de demostración, códigos y latencia simulada.
- `clients.mock-service.ts`: implementación en memoria del contrato `ClientsService`.

El único punto que activa el mock es `src/services/clients.service.ts`. Cuando
esté disponible la API, se reemplaza allí por el adaptador HTTP y se conserva el
mismo contrato para el resto de la aplicación.
