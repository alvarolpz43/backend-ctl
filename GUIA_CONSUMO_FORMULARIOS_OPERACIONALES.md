# Guía de Integración y Diligenciamiento de Formularios Operacionales (CTL)

Esta guía técnica explica paso a paso cómo la aplicación móvil (`movil_ctl`) o cualquier cliente externo debe **descargar (consultar)** las plantillas de formularios operacionales (**Harvester** y **Forwarder**) desde la API del backend, cómo resolver sus catálogos vinculados y cómo **estructurar y enviar el payload JSON** para registrar la información de campo diligenciada.

---

## 1. Arquitectura y Flujo de Comunicación

```
┌────────────────────────────────┐                 ┌─────────────────────────────────┐
│     App Móvil / Cliente        │                 │       Backend CTL API           │
│         (movil_ctl)            │                 │       (Puerto 3000 / 3001)      │
└───────────────┬────────────────┘                 └────────────────┬────────────────┘
                │                                                   │
                │ 1. POST /auth/users/login                         │
                ├──────────────────────────────────────────────────>│
                │ <─ Token JWT Bearer ──────────────────────────────┤
                │                                                   │
                │ 2. GET /ctl/listas/por-tipo/{Harvester|Forwarder} │
                ├──────────────────────────────────────────────────>│
                │ <─ Plantilla con 24 campos y árbol de componentes ┤
                │                                                   │
                │ 3. GET /ctl/{operadores|especies|turnos|fincas...}│
                ├──────────────────────────────────────────────────>│
                │ <─ Catálogos maestros para selects ───────────────┤
                │                                                   │
                │ [Operador diligencia datos en campo / offline]    │
                │ [Si parada es técnica, se elige componente]       │
                │                                                   │
                │ 4. POST /ctl/listas/{id}/responder                │
                ├──────────────────────────────────────────────────>│
                │ <─ 201 Created: Reporte operacional persistido ───┤
                │                                                   │
```

---

## 2. Autenticación y Cabeceras Obligatorias

Todas las peticiones a la API (a excepción del login) exigen el encabezado HTTP de autorización con **Bearer Token**:

| Cabecera | Valor | Obligatorio |
|---|---|---|
| `Content-Type` | `application/json` | Sí |
| `Authorization` | `Bearer <JWT_TOKEN>` | Sí |

### Paso 0: Obtener Token JWT (Login)
```bash
curl -X POST "http://localhost:3000/auth/users/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "operador@ctl.com",
    "password": "Password123*"
  }'
```
**Respuesta exitosa (`200 OK`):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "6701b2c45e89a421b01c3d11",
    "name": "Operador Juan Pérez",
    "email": "operador@ctl.com"
  }
}
```

---

## 3. Paso 1: Descargar las Plantillas de Formularios

El backend dispone de endpoints especializados para obtener las plantillas activas según el contexto de la máquina o el operador:

### 3.1. Descargar por Tipo de Equipo (Recomendado para app móvil)
Permite descargar la plantilla activa correspondiente al tipo de máquina:

- **Harvester**: `GET /ctl/listas/por-tipo/Harvester`
- **Forwarder**: `GET /ctl/listas/por-tipo/Forwarder`

#### Ejemplo cURL (Harvester):
```bash
curl -X GET "http://localhost:3000/ctl/listas/por-tipo/Harvester" \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

#### Ejemplo cURL (Forwarder):
```bash
curl -X GET "http://localhost:3000/ctl/listas/por-tipo/Forwarder" \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

### 3.2. Descargar por ID de Equipo Asignado
Si el operador ya tiene seleccionado un equipo específico por su ID de MongoDB:
```bash
curl -X GET "http://localhost:3000/ctl/listas/por-equipo/6701b2c45e89a421b01c3d55" \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

### 3.3. Estructura de la Respuesta de una Plantilla (`data[0]`)
Cada plantilla retorna una estructura completa con metadatos, secciones y sus 24 campos ordenados:

```json
{
  "success": true,
  "tipoEquipo": "Harvester",
  "total": 1,
  "data": [
    {
      "_id": "67041a999fa5a9478f7e2601",
      "titulo": "Reporte Operacional Harvester (HV)",
      "tipoEquipo": "Harvester",
      "version": 1,
      "activo": true,
      "secciones": [
        { "id": "sec-datos-trabajo", "titulo": "1. Datos del Trabajo", "orden": 0 },
        { "id": "sec-cuestionario-tecnico", "titulo": "2. Cuestionario Técnico y Operativo", "orden": 1 },
        { "id": "sec-paradas-adicionales", "titulo": "3. Registro de Paradas", "orden": 2 },
        { "id": "sec-info-adicional", "titulo": "4. Información Adicional y Terreno", "orden": 3 }
      ],
      "campos": [
        {
          "id": "equipoId",
          "seccionId": "sec-datos-trabajo",
          "label": "Equipo Asignado",
          "tipo": "equipo_select",
          "required": true,
          "orden": 0
        },
        {
          "id": "paradas",
          "seccionId": "sec-paradas-adicionales",
          "label": "Registro de Paradas",
          "tipo": "array_paradas",
          "required": false,
          "opciones": [
            "Falla mecánica",
            "En reparación",
            "Esperando reparación",
            "Mantenimiento menor",
            "Cambio de cadena",
            "Espera de transporte / camión",
            "Condición climática / lluvia",
            "Atasco de fuste",
            "Tanqueo / combustible",
            "Alimentación / refrigerio",
            "Otro motivo"
          ],
          "jerarquia": [
            {
              "nombre": "Cabezal Cosechador",
              "subcategorias": [
                {
                  "nombre": "Motores Hidráulicos",
                  "items": [
                    { "codigo": "CAB-MOT-01", "item": "Motor de alimentación izquierdo", "label": "[CAB-MOT-01] Motor de alimentación izquierdo" }
                  ]
                }
              ]
            }
          ],
          "orden": 20
        }
      ]
    }
  ]
}
```

---

## 4. Paso 2: Descargar Catálogos / Tablas de Referencia Maestras

Para los campos de tipo `tabla_referencia` y `equipo_select`, la app móvil debe consultar (o sincronizar en SQLite local) los siguientes catálogos:

| Campo Formulario | Tipo | Endpoint de Catálogo | Campo a Mostrar (Label) | Campo a Guardar (Value) |
|---|---|---|---|---|
| `equipoId` | `equipo_select` | `GET /ctl/equipos` | `nombreEquipo` (`serieEquipo`) | `_id` |
| `zona` | `tabla_referencia` | `GET /ctl/zonas` | `nombreZona` | `_id` o `nombreZona` |
| `nucleo` | `tabla_referencia` | `GET /ctl/nucleos` | `nombreNucleo` | `_id` o `nombreNucleo` |
| `finca` | `tabla_referencia` | `GET /ctl/fincas` | `nombreFinca` | `_id` o `nombreFinca` |
| `especie` | `tabla_referencia` | `GET /ctl/especies` | `nombreEspecie` | `_id` o `nombreEspecie` |
| `turno` | `tabla_referencia` | `GET /ctl/turnos` | `nombreTurno` | `_id` o `nombreTurno` |
| `operador` | `tabla_referencia` | `GET /ctl/operadores` | `nameOperador` (o `nombreOperador`) | `_id` o `nameOperador` |

---

## 5. Paso 3: Reglas de Diligenciamiento de Campos

### 5.1. Lista de Campos por Sección

#### Sección 1: Datos del Trabajo (`sec-datos-trabajo`)
Común a **Harvester** y **Forwarder**:
1. `equipoId` (`equipo_select`, Requerido): ID del equipo seleccionado.
2. `fecha` (`date`, Requerido): Formato ISO `YYYY-MM-DD`.
3. `zona` (`tabla_referencia`, Requerido): Zona geográfica.
4. `nucleo` (`tabla_referencia`, Requerido): Núcleo forestal.
5. `finca` (`tabla_referencia`, Requerido): Predio o finca.
6. `lote` (`text`, Requerido): Texto abierto (Ej: `"Lote 14B"`).
7. `especie` (`tabla_referencia`, Requerido): Especie cosechada (Ej: `"Eucalyptus grandis"`).
8. `turno` (`tabla_referencia`, Requerido): Turno asignado (Ej: `"Mañana 6:00 - 14:00"`).
9. `operador` (`tabla_referencia`, Requerido): Operador responsable.

---

#### Sección 2: Cuestionario Técnico y Operativo (`sec-cuestionario-tecnico`)

##### Para Harvester:
10. `estado_equipo` (`radio`, Requerido): `"Sí (En uso)"` | `"No (No operativo)"`.
11. `m3` (`number`, Opcional): Producción en metros cúbicos ($m^3$).
12. `diametro` (`number`, Opcional): Diámetro medio del fuste ($cm$).
13. `pendiente` (`number`, Opcional): Pendiente del terreno en grados ($^\circ$).
14. `fustes_total` (`number`, Opcional): N.º total de fustes cosechados.
15. `m3_hora` (`number`, Opcional): Productividad calculada ($m^3/h$).
16. `fustes_hora` (`number`, Opcional): Fustes por hora.
17. `tiempo_programado` (`number`, Requerido): Horas programadas (default: `8`).
18. `alistamiento` (`number`, Opcional): Minutos de inspección y alistamiento.
19. `tanqueo` (`number`, Opcional): Minutos de combustible.
20. `alimentacion` (`number`, Opcional): Minutos de alimentación/refrigerio.

##### Para Forwarder:
10. `estado_equipo` (`radio`, Requerido): `"Sí (En uso)"` | `"No (No operativo)"`.
11. `m3` (`number`, Opcional): Producción extraída ($m^3$).
12. `pendiente` (`number`, Opcional): Pendiente del terreno en grados ($^\circ$).
13. `n_cargas` (`number`, Opcional): N.º de cargas transportadas.
14. `peso_medio` (`number`, Opcional): Peso promedio por carga (toneladas).
15. `distancia` (`number`, Opcional): Distancia media recorrida por viaje (metros).
16. `tiempo_programado` (`number`, Requerido): Horas programadas (default: `8`).
17. `alistamiento` (`number`, Opcional): Minutos de inspección y alistamiento.
18. `tanqueo` (`number`, Opcional): Minutos de combustible.
19. `alimentacion` (`number`, Opcional): Minutos de alimentación.

---

#### Sección 3: Registro Dinámico de Paradas (`sec-paradas-adicionales`)
Ambos formularios contienen el campo dinámico:
- `id: "paradas"` (`tipo: "array_paradas"`)

Cada parada es un objeto con:
```typescript
interface IParadaItem {
  id: string;              // Identificador único de la parada
  tiempo: number | string; // Duración en minutos (Ej: 35)
  motivo: string;          // Motivo de la parada
  observacion?: string;    // Nota libre opcional
  componente?: string;     // Código del ítem / repuesto (OBLIGATORIO si es falla/reparación)
}
```

##### Regla de Activación Condicional del Componente:
Si `motivo` contiene alguno de estos 5 valores:
1. `Falla mecánica`
2. `En reparación`
3. `Esperando reparación`
4. `Mantenimiento menor`
5. `Cambio de cadena`

👉 **El campo `componente` es OBLIGATORIO** y debe seleccionarse del árbol jerárquico (`campo.jerarquia`):
- **Nivel 1:** Categoría (Ej: *"Cabezal Cosechador"*)
- **Nivel 2:** Subcategoría (Ej: *"Motores Hidráulicos"*)
- **Nivel 3:** Ítem / Código (Ej: *"CAB-MOT-01"*)

Si el motivo es operativo (p. ej. *"Tanqueo / combustible"*, *"Alimentación / refrigerio"*, *"Condición climática / lluvia"* o *"Espera de transporte / camión"*), el campo `componente` **no aplica** y no debe enviarse.

---

#### Sección 4: Información Adicional y Terreno (`sec-info-adicional`)

##### Para Harvester:
21. `winche` (`number`, Opcional): Horas de uso de winche ($h$).
22. `suelo` (`select`, Opcional): `"Humedo"` | `"Seco"`.
23. `novedad` (`textarea`, Opcional): Observaciones y notas del turno.

##### Para Forwarder:
20. `saturado` (`number`, Opcional): Horas de suelo saturado ($h$).
21. `winche` (`number`, Opcional): Horas de uso de winche ($h$).
22. `suelo` (`select`, Opcional): `"Humedo"` | `"Seco"`.
23. `novedad` (`textarea`, Opcional): Observaciones y notas del turno.

---

## 6. Paso 4: Enviar el Formulario Diligenciado (POST)

### Endpoint de Envío:
- **Método**: `POST`
- **Ruta**: `/ctl/listas/:id/responder` (o `/ctl/listas/:id/respuestas`)
- **Donde `:id`** es el `_id` de la plantilla de formulario obtenida en el Paso 1.

### 6.1. Ejemplo Completo: Diligenciamiento Harvester (HV)

```bash
curl -X POST "http://localhost:3000/ctl/listas/67041a999fa5a9478f7e2601/responder" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -d '{
    "formularioId": "67041a999fa5a9478f7e2601",
    "equipoId": "6701b2c45e89a421b01c3d55",
    "fecha": "2026-10-07T08:00:00.000Z",
    "respuestas": {
      "equipoId": "6701b2c45e89a421b01c3d55",
      "fecha": "2026-10-07",
      "zona": "Zona Norte",
      "nucleo": "Núcleo San Alberto",
      "finca": "La Primavera",
      "lote": "Lote 14B",
      "especie": "Eucalyptus grandis",
      "turno": "Turno Mañana (06:00 - 14:00)",
      "operador": "Juan Carlos Martínez",
      "estado_equipo": "Sí (En uso)",
      "m3": 142.5,
      "diametro": 24.8,
      "pendiente": 12,
      "fustes_total": 420,
      "m3_hora": 17.8,
      "fustes_hora": 52,
      "tiempo_programado": 8,
      "alistamiento": 25,
      "tanqueo": 15,
      "alimentacion": 30,
      "paradas": [
        {
          "id": "p_01",
          "tiempo": 45,
          "motivo": "Falla mecánica",
          "componente": "CAB-MOT-01",
          "observacion": "Fuga de aceite en acople rápido del motor de alimentación"
        },
        {
          "id": "p_02",
          "tiempo": 20,
          "motivo": "Cambio de cadena",
          "componente": "CAB-ESP-02",
          "observacion": "Dientes de corte desgastados por contacto con piedra"
        },
        {
          "id": "p_03",
          "tiempo": 30,
          "motivo": "Condición climática / lluvia",
          "observacion": "Lluvia torrencial que obligó a suspender operación temporalmente"
        }
      ],
      "winche": 1.5,
      "suelo": "Humedo",
      "novedad": "Turno completado sin incidentes graves. Se programó mantenimiento preventivo de mangueras para mañana."
    }
  }'
```

---

### 6.2. Ejemplo Completo: Diligenciamiento Forwarder (FW)

```bash
curl -X POST "http://localhost:3000/ctl/listas/67041a999fa5a9478f7e2602/responder" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -d '{
    "formularioId": "67041a999fa5a9478f7e2602",
    "equipoId": "6701b2c45e89a421b01c3d88",
    "fecha": "2026-10-07T08:00:00.000Z",
    "respuestas": {
      "equipoId": "6701b2c45e89a421b01c3d88",
      "fecha": "2026-10-07",
      "zona": "Zona Norte",
      "nucleo": "Núcleo San Alberto",
      "finca": "La Primavera",
      "lote": "Lote 14B",
      "especie": "Eucalyptus grandis",
      "turno": "Turno Mañana (06:00 - 14:00)",
      "operador": "Pedro Alonso Gómez",
      "estado_equipo": "Sí (En uso)",
      "m3": 138.0,
      "pendiente": 15,
      "n_cargas": 11,
      "peso_medio": 12.5,
      "distancia": 450,
      "tiempo_programado": 8,
      "alistamiento": 20,
      "tanqueo": 15,
      "alimentacion": 30,
      "paradas": [
        {
          "id": "p_fw_01",
          "tiempo": 35,
          "motivo": "En reparación",
          "componente": "CHAS-ROD-03",
          "observacion": "Ajuste de tensión de oruga izquierda por terreno con piedras"
        },
        {
          "id": "p_fw_02",
          "tiempo": 40,
          "motivo": "Espera de transporte / camión",
          "observacion": "Cancha de acopio llena esperando camiones de despacho"
        }
      ],
      "saturado": 2.5,
      "winche": 0,
      "suelo": "Humedo",
      "novedad": "Extracción fluida. Camino de saca con barro en la salida principal."
    }
  }'
```

---

## 7. Formatos Aceptados para `respuestas`

El backend procesa dos variantes de formato en el campo `respuestas`:

### Formato A: Diccionario Clave-Valor (Recomendado por simplicidad)
```json
{
  "respuestas": {
    "equipoId": "6701b2c45e89a421b01c3d55",
    "fecha": "2026-10-07",
    "m3": 140,
    "paradas": [ ... ]
  }
}
```

### Formato B: Arreglo de Respuestas con Metadatos
```json
{
  "respuestas": [
    { "campoId": "equipoId", "valor": "6701b2c45e89a421b01c3d55" },
    { "campoId": "fecha", "valor": "2026-10-07" },
    { "campoId": "m3", "valor": 140 },
    { "campoId": "paradas", "valor": [ ... ] }
  ]
}
```

Ambos formatos son automáticamente reconocidos y normalizados por el servicio del backend.

---

## 8. Respuestas del Servidor y Errores Comunes

### 8.1. Éxito (`201 Created`)
```json
{
  "success": true,
  "message": "Respuesta del formulario registrada exitosamente",
  "data": {
    "_id": "670438101a938c5b90f41c99",
    "formularioId": "67041a999fa5a9478f7e2601",
    "formularioTituloSnapshot": "Reporte Operacional Harvester (HV)",
    "tipoEquipoSnapshot": "Harvester",
    "equipoId": "6701b2c45e89a421b01c3d55",
    "fecha": "2026-10-07T08:00:00.000Z",
    "respuestas": [ ... ],
    "respuestasMap": { ... },
    "createdAt": "2026-10-07T21:40:00.000Z"
  }
}
```

### 8.2. Faltan Campos Obligatorios (`400 Bad Request`)
Si no se envían campos obligatorios como `equipoId`, `fecha` o `lote`:
```json
{
  "success": false,
  "message": "Faltan campos obligatorios: Equipo Asignado, Fecha del Reporte, Lote",
  "camposFaltantes": ["Equipo Asignado", "Fecha del Reporte", "Lote"]
}
```

### 8.3. Token Inválido o Ausente (`401 Unauthorized`)
```json
{
  "success": false,
  "message": "Acceso denegado: Token no proporcionado",
  "error": "Se requiere encabezado Authorization con Bearer Token"
}
```

### 8.4. Permisos Insuficientes (`403 Forbidden`)
Si el usuario autenticado no posee permiso `write` en el módulo `listas`:
```json
{
  "success": false,
  "message": "Acceso denegado: No tienes permisos para realizar esta acción",
  "error": "Permiso insuficiente para módulo 'listas' con acción 'write'"
}
```

---

## 9. Recomendaciones para Modo Offline en `movil_ctl`

1. **Al iniciar sesión con conectividad:**
   - Descargar la plantilla activa de Harvester y Forwarder (`GET /ctl/listas/por-tipo/...`).
   - Descargar los catálogos de apoyo (`/ctl/equipos`, `/ctl/operadores`, etc.).
   - Guardar todo en almacenamiento local (SQLite / WatermelonDB / AsyncStorage).
2. **Durante la jornada de trabajo (sin internet en el bosque):**
   - El operador abre el formulario desde el caché local.
   - Diligencia los 24 campos.
   - En el arreglo de `paradas`, si registra una parada mecánica, valida en la interfaz que seleccione el componente del árbol jerárquico.
   - Se guarda el reporte en la cola local de pendientes con estado `pendiente_sincronizacion`.
3. **Al recuperar conectividad:**
   - La app despacha cada reporte acumulado vía `POST /ctl/listas/:id/responder`.
   - Al recibir `201 Created`, marca el reporte como sincronizado.
