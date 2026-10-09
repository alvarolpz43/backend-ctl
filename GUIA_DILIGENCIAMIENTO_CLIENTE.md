# Manual Integral de Diligenciamiento y Sincronización de Formularios Operacionales (CTL)

Documento técnico oficial para clientes móviles, web y aplicaciones de campo sobre cómo interactuar con el backend de **CTL (Control Total de Líneas)**: desde la autenticación y la **sincronización atómica por empresa** hasta las reglas de captura en campo, la estructura de los 24 campos de cada formulario, el registro dinámico de paradas y el envío de reportes hacia el servidor.

---

## 1. Arquitectura de Integración (Offline-First)

El sistema opera bajo un enfoque **Offline-First**. Las faenas forestales suelen desarrollarse en predios sin cobertura celular, por lo que el cliente debe estar preparado para trabajar 100% desconectado tras realizar una sincronización inicial en base.

```
┌──────────────────────────────────────┐                   ┌────────────────────────────────────────┐
│     Cliente Móvil / Tableta / Web    │                   │            Backend CTL API             │
│        (PWA / App Capacitor / etc.)  │                   │      (Node.js + Express + MongoDB)     │
└──────────────────┬───────────────────┘                   └───────────────────┬────────────────────┘
                   │                                                           │
                   │ 1. POST /auth/users/login (con credenciales de usuario)   │
                   ├──────────────────────────────────────────────────────────>│
                   │ <─ 200 OK: Token JWT + Perfil con Empresa(s) ─────────────┤
                   │                                                           │
                   │ 2. GET /ctl/listas/sync-empresa                           │
                   │    (Descarga atómica de todo lo vinculado a su empresa)   │
                   ├──────────────────────────────────────────────────────────>│
                   │ <─ 200 OK: Forms, Equipos, Fincas, Líneas, Jerarquía ────┤
                   │                                                           │
                   │ [Guardado en Almacenamiento Local: SQLite / IndexedDB]    │
                   │                                                           │
                   │ === ZONA BOSCOSA: MODO DESCONECTADO (OFFLINE) =========== │
                   │  - Operador selecciona Finca (autocompleta Zona y Núcleo) │
                   │  - Selecciona Línea (filtra Equipos y Fincas de trabajo)  │
                   │  - Registra Fecha y Hora (datetime-local YYYY-MM-DDTHH:mm)│
                   │  - Si equipo operativo: ingresa m³, fustes, pendientes... │
                   │  - Si hay paradas: selecciona motivo y componente técnico │
                   │  - Guarda en Cola Local (Outbox / Reportes Pendientes)    │
                   │ ========================================================= │
                   │                                                           │
                   │ 3. POST /ctl/listas/:id/responder (al recuperar señal)    │
                   ├──────────────────────────────────────────────────────────>│
                   │ <─ 201 Created: Reporte persistido en MongoDB             │
                   │    (m³ del FW completan la meta mensual de la línea)      │
                   │                                                           │
```

---

## 2. Autenticación y Encabezados Requeridos

Todas las peticiones a los endpoints protegidos requieren enviar el token JWT en el encabezado `Authorization`.

| Encabezado | Valor Requerido | Descripción |
|---|---|---|
| `Content-Type` | `application/json` | Formato del cuerpo de la solicitud |
| `Authorization` | `Bearer <JWT_TOKEN>` | Token emitido en el login |

### 2.1. Iniciar Sesión (`POST /auth/users/login`)

```bash
curl -X POST "http://localhost:3000/auth/users/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "supervisor@ctl.com",
    "password": "Password123*"
  }'
```

**Respuesta Exitosa (`200 OK`):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2N2VjMGM1NmQ3ZjAyZmE1MjFmZDA1NWQi...",
  "user": {
    "_id": "67ec0c56d7f02fa521fd055d",
    "name": "Paola",
    "email": "supervisor@ctl.com",
    "todosLosContratistas": true,
    "contratistas": []
  }
}
```

---

## 3. Endpoint Unificado de Sincronización por Empresa

### `GET /ctl/listas/sync-empresa`

Este endpoint entrega en **una única petición atómica** todo lo que el cliente necesita en base a la empresa (contratista) del usuario autenticado:
1. Las plantillas activas de formularios operacionales (**Harvester** y **Forwarder**) con sus 24 campos ordenados, secciones y condiciones.
2. Los equipos que pertenecen a la empresa del usuario.
3. Las líneas de producción activas de su empresa (con sus Harvesters, Forwarders y fincas asignadas).
4. El catálogo de fincas enriquecido con su **núcleo** y **zona** correspondiente.
5. Los operadores asignados a los equipos de la empresa.
6. Los turnos de trabajo laborales.
7. Las especies forestales disponibles.
8. El árbol jerárquico de 3 niveles para el **Registro de Paradas** (`Categoría > Subcategoría > Componente con código`).
9. Lista estandarizada de motivos de parada.
10. Metadatos de versión y timestamp del servidor.

### 3.1. Parámetros de Consulta (Query Params)

| Parámetro | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `contratistaId` | `string` (ObjectId) | Opcional | Si el usuario tiene acceso global (`todosLosContratistas: true`), permite forzar la sincronización de una empresa específica. Si se omite, se utiliza su contratista asignada por defecto. |

#### Ejemplo de Petición cURL:
```bash
curl -X GET "http://localhost:3000/ctl/listas/sync-empresa" \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

### 3.2. Estructura de la Respuesta (`200 OK`)

```json
{
  "success": true,
  "data": {
    "empresa": {
      "_id": "67f003c333115ad677129932",
      "nombre": "EFAGRAM",
      "estado": true
    },
    "empresasDisponibles": [
      { "_id": "67f003c333115ad677129932", "nombre": "EFAGRAM" },
      { "_id": "67fd6945f41643234f10a76c", "nombre": "AMBAR" }
    ],
    "formularios": [
      {
        "_id": "68e73429fa21000100000001",
        "titulo": "Reporte Operacional Harvester (HV)",
        "tipoEquipo": "Harvester",
        "version": 1,
        "activo": true,
        "secciones": [
          { "id": "sec-datos-trabajo", "titulo": "1. Datos del Trabajo", "orden": 0 },
          { "id": "sec-cuestionario-tecnico", "titulo": "2. Cuestionario Técnico y Operativo", "orden": 1 },
          { "id": "sec-info-adicional", "titulo": "3. Información Adicional y Terreno", "orden": 2 }
        ],
        "campos": [
          {
            "id": "fecha",
            "seccionId": "sec-datos-trabajo",
            "label": "Fecha y Hora",
            "tipo": "datetime-local",
            "required": true,
            "orden": 1
          },
          {
            "id": "estado_equipo",
            "seccionId": "sec-cuestionario-tecnico",
            "label": "¿El equipo está en funcionamiento?",
            "tipo": "radio",
            "opciones": ["Sí", "No"],
            "required": true,
            "condicion": null,
            "orden": 10
          },
          {
            "id": "m3",
            "seccionId": "sec-cuestionario-tecnico",
            "label": "¿Producción en metros cúbicos (m³)?",
            "tipo": "number",
            "required": false,
            "condicion": { "campoId": "estado_equipo", "operador": "equals", "valor": "Sí" },
            "orden": 11
          },
          {
            "id": "array_paradas",
            "seccionId": "sec-cuestionario-tecnico",
            "label": "Registro de Paradas",
            "tipo": "array_paradas",
            "required": false,
            "condicion": null,
            "orden": 20
          }
        ]
      },
      {
        "_id": "68e73429fa21000100000002",
        "titulo": "Reporte Operacional Forwarder (FW)",
        "tipoEquipo": "Forwarder",
        "version": 1,
        "activo": true,
        "secciones": [ /* ... Secciones Forwarder ... */ ],
        "campos": [ /* ... 24 campos Forwarder ... */ ]
      }
    ],
    "lineas": [
      {
        "_id": "6701a111e42a9b31d0541011",
        "nombre": "Línea Alfa 1",
        "contratistaId": "67f003c333115ad677129932",
        "harvesters": [
          {
            "_id": "68239ecb7a9b099092ed78ab",
            "nombreEquipo": "HVJD-1",
            "serieEquipo": "1WJ1270GTNC005483",
            "tipoEquipo": "Harvester"
          }
        ],
        "forwarders": [
          {
            "_id": "6823a67d7415031f80ead887",
            "nombreEquipo": "FWJD-4",
            "serieEquipo": "1WJ1910EENC003026",
            "tipoEquipo": "Forwarder"
          }
        ],
        "fincasDefault": [
          {
            "_id": "6823c9806adc4f62df5299ca",
            "nombreFinca": "Alegrias",
            "codeFinca": "11ALEGR"
          }
        ],
        "metaMinimaDefecto": 5000,
        "horasProgramadasDefecto": 160
      }
    ],
    "equipos": [
      {
        "_id": "68239ecb7a9b099092ed78ab",
        "nombreEquipo": "HVJD-1",
        "serieEquipo": "1WJ1270GTNC005483",
        "tipoEquipo": "Harvester",
        "contratistaId": "67f003c333115ad677129932"
      },
      {
        "_id": "6823a67d7415031f80ead887",
        "nombreEquipo": "FWJD-4",
        "serieEquipo": "1WJ1910EENC003026",
        "tipoEquipo": "Forwarder",
        "contratistaId": "67f003c333115ad677129932"
      }
    ],
    "operadores": [
      {
        "_id": "67ec0c01e8f90c585bfdde80",
        "nameOperador": "Carlos Ruiz",
        "numCedula": "1094883211",
        "equipoId": "68239ecb7a9b099092ed78ab"
      }
    ],
    "turnos": [
      {
        "_id": "67ec0bf3e8f90c585bfdde65",
        "nombreTurno": "Turno Mañana",
        "horaInicio": "06:00",
        "horaFin": "14:00"
      }
    ],
    "fincas": [
      {
        "_id": "6823c9806adc4f62df5299ca",
        "nombreFinca": "Alegrias",
        "codeFinca": "11ALEGR",
        "nucleoId": "67ec0bede8f90c585bfdde49",
        "nombreNucleo": "Quindio",
        "zonaId": "67ec03b11f9125af1c754311",
        "nombreZona": "Norte",
        "asignadaALinea": true
      }
    ],
    "nucleos": [
      {
        "_id": "67ec0bede8f90c585bfdde49",
        "nombreNucleo": "Quindio",
        "codeNucleo": "QUI",
        "zonaId": "67ec03b11f9125af1c754311"
      }
    ],
    "zonas": [
      {
        "_id": "67ec03b11f9125af1c754311",
        "nombreZona": "Norte"
      }
    ],
    "especies": [
      {
        "_id": "67ec0bfae8f90c585bfdde71",
        "nombreEspecie": "Pino Radiata"
      },
      {
        "_id": "67ec0bfae8f90c585bfdde72",
        "nombreEspecie": "Eucalyptus Nitens"
      }
    ],
    "jerarquiaComponentes": [
      {
        "nombre": "Cabezal Cosechador",
        "subcategorias": [
          {
            "nombre": "Motores Hidráulicos",
            "items": [
              {
                "codigo": "CAB-MOT-01",
                "item": "Motor de alimentación izquierdo",
                "label": "[CAB-MOT-01] Motor de alimentación izquierdo",
                "value": "CAB-MOT-01"
              }
            ]
          }
        ]
      }
    ],
    "motivosParadas": [
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
    "metadata": {
      "timestamp": "2026-10-09T05:20:00.000Z",
      "serverVersion": "1.1.2",
      "totalEquipos": 12,
      "totalLineas": 1,
      "totalOperadores": 36,
      "totalFormularios": 2
    }
  }
}
```

---

## 4. Relación y Cascada entre Colecciones

Para ofrecer una experiencia de usuario fluida e intuitiva en la app móvil o cliente web, utilice las relaciones embebidas en el paquete de sincronización:

### 4.1. Cascada Geográfica: Finca $\rightarrow$ Núcleo $\rightarrow$ Zona
Cada objeto dentro de `data.fincas` contiene directamente `nucleoId`, `nombreNucleo`, `zonaId` y `nombreZona`.
- **Comportamiento recomendado en la interfaz:**
  1. Cuando el operador selecciona una **Finca** en el desplegable, la aplicación debe autocompletar inmediatamente los campos **Núcleo** y **Zona**.
  2. Si el usuario prefiere filtrar primero por Zona:
     - Selecciona `zonaId` $\rightarrow$ filtra `data.nucleos` que tengan ese `zonaId`.
     - Selecciona `nucleoId` $\rightarrow$ filtra `data.fincas` que tengan ese `nucleoId`.

### 4.2. Cascada de Operaciones: Línea $\rightarrow$ Equipos y Fincas de Trabajo
Cada línea de producción (`data.lineas`) agrupa:
- `harvesters`: IDs y nombres de las máquinas de corte asignadas a esa línea.
- `forwarders`: IDs y nombres de las máquinas de extracción asignadas a esa línea.
- `fincasDefault`: Predios habituales de operación de esa línea.
- **Comportamiento recomendado en la interfaz:**
  - Si el operador elige su **Línea de Producción** al inicio de la jornada, restrinja la lista de equipos disponibles en el formulario únicamente a los asignados a esa línea.

### 4.3. Cascada Máquina $\rightarrow$ Operador
Cada operador dentro de `data.operadores` contiene el campo `equipoId`.
- Cuando el operador selecciona la máquina en el formulario (`equipoId`), la aplicación puede preseleccionar por defecto al maquinista habitual asociado a dicho equipo.

---

## 5. Especificación de los Formularios y Reglas de Captura

El sistema cuenta con 2 formularios oficiales con **24 campos cada uno**:
1. **Harvester (HV)**: Para operaciones de volteo, apeo y trozado de fustes en bosque.
2. **Forwarder (FW)**: Para operaciones de autocargue, extracción y apilado en cancha / borde de vía.

Ambos formularios se estructuran en 3 secciones funcionales:

```
┌────────────────────────────────────────────────────────┐
│  SECCIÓN 1: DATOS DEL TRABAJO (sec-datos-trabajo)      │
│  - Equipo, Fecha y Hora, Zona, Núcleo, Finca, Lote,    │
│    Especie, Turno, Operador                            │
└──────────────────────────┬─────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│  SECCIÓN 2: CUESTIONARIO TÉCNICO (sec-cuestionario...) │
│  - ¿El equipo está en funcionamiento? (Sí / No)        │
│    ├─ Si Sí: m³, mediciones, tiempos de apoyo...       │
│    └─ Si No: solo tiempo_programado                    │
│  - Registro dinámico de Paradas (array_paradas)        │
└──────────────────────────┬─────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│  SECCIÓN 3: INFORMACIÓN ADICIONAL (sec-info-adicional) │
│  - Winche, suelo (Húmedo/Seco), novedad                │
│  - Solo FW: horas de suelo saturado                    │
└────────────────────────────────────────────────────────┘
```

---

### 5.1. Formulario 1: Datos del Trabajo (Común a HV y FW)

| # | Campo ID | Label en Pantalla | Tipo de Campo | Origen de Datos / Formato | Requerido |
|---|---|---|---|---|---|
| 1 | `equipoId` | Equipo Asignado | `equipo_select` | `data.equipos` (`_id`) | **Sí** |
| 2 | `fecha` | Fecha y Hora | `datetime-local` | Formato ISO `YYYY-MM-DDTHH:mm` (Ej: `2026-10-15T07:30`) | **Sí** |
| 3 | `zona` | Zona | `tabla_referencia` | `data.zonas` (`nombreZona`) | **Sí** |
| 4 | `nucleo` | Núcleo | `tabla_referencia` | `data.nucleos` (`nombreNucleo`) | **Sí** |
| 5 | `finca` | Finca | `tabla_referencia` | `data.fincas` (`_id` o `nombreFinca`) | **Sí** |
| 6 | `lote` | Lote | `text` | Texto libre ingresado por el usuario (Ej: `"Lote 14-B"`) | **Sí** |
| 7 | `especie` | Especie | `tabla_referencia` | `data.especies` (`nombreEspecie`) | **Sí** |
| 8 | `turno` | Turno | `tabla_referencia` | `data.turnos` (`nombreTurno`) | **Sí** |
| 9 | `operador` | Operador | `tabla_referencia` | `data.operadores` (`_id` o `nameOperador`) | **Sí** |

> [!IMPORTANT]
> **Formato de Fecha y Hora**: El campo `fecha` es estrictamente `datetime-local`. Debe enviarse como cadena con año, mes, día, `T`, horas y minutos (ejemplo: `"2026-10-15T08:30"`). Esto permite registrar el inicio exacto del turno operativo.

---

### 5.2. Formulario 2: Cuestionario Técnico y Operativo

#### Campo Gatillo (Estado del Equipo)
- **`estado_equipo`** (`radio`, Requerido): `"Sí"` o `"No"`.
  - Si `"Sí"`: El equipo trabajó. Se evalúan y despliegan las preguntas operativas de producción.
  - Si `"No"`: El equipo estuvo inoperativo. Se ocultan todas las preguntas de producción y solo se diligencia `tiempo_programado` y las paradas mecánicas o adicionales.

#### Preguntas Operativas - Harvester (HV)
*Visibles y aplicables cuando `estado_equipo === "Sí"`*:

| # | Campo ID | Pregunta / Label | Tipo | Unidad / Formato |
|---|---|---|---|---|
| 11 | `m3` | ¿Producción en metros cúbicos (m³)? | `number` | $m^3$ (número decimal o entero) |
| 12 | `diametro` | ¿Diámetro medio del fuste (cm)? | `number` | $cm$ |
| 13 | `pendiente` | ¿Pendiente del terreno (en grados°)? | `number` | Grados ($^\circ$) |
| 14 | `fustes_total` | ¿N.º total de fustes? | `number` | Cantidad total |
| 15 | `m3_hora` | ¿Productividad (m³/hora)? | `number` | $m^3/h$ |
| 16 | `fustes_hora` | ¿Cantidad de fustes por hora? | `number` | Fustes/hora |
| 17 | `tiempo_programado` | ¿Tiempo programado (h)? | `number` | Horas (default: `8`) |
| 18 | `alistamiento` | ¿Tiempo en alistamiento (minutos)? | `number` | Minutos |
| 19 | `tanqueo` | ¿Tiempo de tanqueo (minutos)? | `number` | Minutos |
| 20 | `alimentacion` | ¿Tiempo de alimentación (minutos)? | `number` | Minutos |

#### Preguntas Operativas - Forwarder (FW)
*Visibles y aplicables cuando `estado_equipo === "Sí"`*:

| # | Campo ID | Pregunta / Label | Tipo | Unidad / Formato |
|---|---|---|---|---|
| 11 | `m3` | ¿Producción en metros cúbicos (m³)? | `number` | $m^3$ extraídos (**Suma a la meta mensual**) |
| 12 | `pendiente` | ¿Pendiente del terreno (en grados°)? | `number` | Grados ($^\circ$) |
| 13 | `n_cargas` | ¿N.º de cargas extraídas del lote? | `number` | Cantidad de viajes / viajes extraídos |
| 14 | `peso_medio` | ¿Peso medio por carga (toneladas)? | `number` | Toneladas ($t$) |
| 15 | `distancia` | ¿Distancia promedio por carga recorrida (metros)? | `number` | Metros ($m$) |
| 16 | `tiempo_programado` | ¿Tiempo programado (h)? | `number` | Horas (default: `8`) |
| 17 | `alistamiento` | ¿Tiempo en alistamiento (minutos)? | `number` | Minutos |
| 18 | `tanqueo` | ¿Tiempo de tanqueo (minutos)? | `number` | Minutos |
| 19 | `alimentacion` | ¿Tiempo de alimentación (minutos)? | `number` | Minutos |

---

### 5.3. Registro Dinámico de Paradas (`array_paradas`)

El campo con ID `array_paradas` permite registrar múltiples paradas operativas y mecánicas de la jornada.

> [!NOTE]
> **Eliminación de campos quemados**: Ya **NO** existen preguntas fijas redundantes como `paradas_mecanicas`, `tEspecificado` o `repuesto`. Toda detención del equipo se registra dentro de esta lista dinámica.

Cada elemento del array de paradas debe contener los siguientes atributos:
```json
{
  "id": "p_1728450123_abc1",
  "tiempo": 45,
  "motivo": "Falla mecánica",
  "observacion": "Fuga de aceite en acople rápido del cabezal",
  "componente": {
    "codigo": "CAB-MOT-01",
    "item": "Motor de alimentación izquierdo",
    "categoria": "Cabezal Cosechador",
    "subcategoria": "Motores Hidráulicos"
  }
}
```

- `tiempo`: Tiempo de la detención en **minutos** (número).
- `motivo`: Motivo seleccionado de la lista `data.motivosParadas` (ej: `"Falla mecánica"`, `"Mantenimiento menor"`, `"Cambio de cadena"`, etc.).
- `observacion`: Texto libre explicando el síntoma o la labor realizada.
- `componente`: Objeto seleccionado del árbol `data.jerarquiaComponentes` (especialmente cuando el motivo es mecánico o de mantenimiento).

---

### 5.4. Formulario 3: Información Adicional y Terreno

| # | Campo ID | Formulario | Pregunta / Label | Tipo | Opciones / Formato |
|---|---|---|---|---|---|
| 21 | `winche` | Ambos | ¿Tiempo uso del winche (h)? | `number` | Horas (Ej: `1.5`) |
| 22 | `novedad` | Ambos | Novedades | `textarea` / `text` | Texto libre con novedades del lote, clima o terreno |
| 23 | `suelo` | Ambos | Suelo | `select` | `"Humedo"` o `"Seco"` |
| 24 | `saturado` | **Solo Forwarder** | ¿Horas Suelo Saturado? | `number` | Horas trabajadas en suelo saturado de agua |

---

## 6. Regla Operacional en la Planeación Mensual

> [!IMPORTANT]
> **El Forwarder es el que cumple la meta mensual**:
> - En las faenas CTL, el **Harvester** tala y troza los fustes dentro del bosque, registrando la producción de corte base (`produccionCosechaHarvester`).
> - El **Forwarder** es la máquina que carga y transporta la madera fuera del bosque hacia la cancha o borde de vía transitada por camiones.
> - Por tanto, el valor reportado en el campo **`m3` del Forwarder** es el que **suma directamente a las toneladas reales extraídas (`produccionRealToneladas`) y define el `% de Cumplimiento` de la meta mensual** de la línea en `/admin/planeacion`.

---

## 7. Estructura Exacta del Payload JSON de Envío

Para registrar un formulario diligenciado, el cliente envía una petición HTTP `POST` a:
- `POST /ctl/listas/:id/responder` (donde `:id` es el `_id` de la plantilla de formulario), o
- `POST /ctl/listas/respuestas`

### 7.1. Estructura General del Body

El cuerpo de la petición puede enviarse en dos formatos válidos:
- **Formato Map (Recomendado)**: Enviar un objeto `respuestas` donde cada clave es el `campoId`.
- **Formato Array**: Enviar `respuestas: [{ campoId: "...", valor: "..." }]`.

El backend normaliza ambos formatos automáticamente.

---

### 7.2. Ejemplo Completo: Reporte Harvester (HV)

```bash
curl -X POST "http://localhost:3000/ctl/listas/68e73429fa21000100000001/responder" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -d '{
    "formularioId": "68e73429fa21000100000001",
    "equipoId": "68239ecb7a9b099092ed78ab",
    "fincaId": "6823c9806adc4f62df5299ca",
    "operadorId": "67ec0c01e8f90c585bfdde80",
    "fecha": "2026-10-15T07:30",
    "respuestas": {
      "equipoId": "68239ecb7a9b099092ed78ab",
      "fecha": "2026-10-15T07:30",
      "zona": "Norte",
      "nucleo": "Quindio",
      "finca": "6823c9806adc4f62df5299ca",
      "lote": "Lote 12-C",
      "especie": "Pino Radiata",
      "turno": "Turno Mañana",
      "operador": "67ec0c01e8f90c585bfdde80",
      "estado_equipo": "Sí",
      "m3": 480.5,
      "diametro": 26.4,
      "pendiente": 18,
      "fustes_total": 620,
      "m3_hora": 60.1,
      "fustes_hora": 77.5,
      "tiempo_programado": 8,
      "alistamiento": 20,
      "tanqueo": 15,
      "alimentacion": 30,
      "array_paradas": [
        {
          "id": "p_hv_01",
          "tiempo": 25,
          "motivo": "Falla mecánica",
          "observacion": "Cambio de manguera de alta presión en rodillo",
          "componente": {
            "codigo": "CAB-MOT-01",
            "item": "Motor de alimentación izquierdo",
            "categoria": "Cabezal Cosechador",
            "subcategoria": "Motores Hidráulicos"
          }
        }
      ],
      "winche": 0,
      "novedad": "Sin novedades operativas. Terreno con firmeza regular.",
      "suelo": "Seco"
    }
  }'
```

---

### 7.3. Ejemplo Completo: Reporte Forwarder (FW)

```bash
curl -X POST "http://localhost:3000/ctl/listas/68e73429fa21000100000002/responder" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -d '{
    "formularioId": "68e73429fa21000100000002",
    "equipoId": "6823a67d7415031f80ead887",
    "fincaId": "6823c9806adc4f62df5299ca",
    "operadorId": "67ec0c01e8f90c585bfdde80",
    "fecha": "2026-10-15T08:00",
    "respuestas": {
      "equipoId": "6823a67d7415031f80ead887",
      "fecha": "2026-10-15T08:00",
      "zona": "Norte",
      "nucleo": "Quindio",
      "finca": "6823c9806adc4f62df5299ca",
      "lote": "Lote 12-C",
      "especie": "Pino Radiata",
      "turno": "Turno Mañana",
      "operador": "67ec0c01e8f90c585bfdde80",
      "estado_equipo": "Sí",
      "m3": 310.2,
      "pendiente": 14,
      "n_cargas": 18,
      "peso_medio": 17.2,
      "distancia": 240,
      "tiempo_programado": 8,
      "alistamiento": 15,
      "tanqueo": 10,
      "alimentacion": 30,
      "array_paradas": [
        {
          "id": "p_fw_01",
          "tiempo": 40,
          "motivo": "Espera de transporte / camión",
          "observacion": "Cancha llena, esperando despacho de tractomulas",
          "componente": ""
        }
      ],
      "saturado": 0,
      "winche": 1.0,
      "novedad": "Pendiente pronunciada en el cuadrante sur del lote.",
      "suelo": "Humedo"
    }
  }'
```

---

### 7.4. Ejemplo: Reporte de Máquina No Operativa (`estado_equipo: "No"`)

Si la máquina sufrió una avería previa o no pudo trabajar en el turno:
```json
{
  "formularioId": "68e73429fa21000100000001",
  "equipoId": "68239ecb7a9b099092ed78ab",
  "fincaId": "6823c9806adc4f62df5299ca",
  "operadorId": "67ec0c01e8f90c585bfdde80",
  "fecha": "2026-10-15T06:00",
  "respuestas": {
    "equipoId": "68239ecb7a9b099092ed78ab",
    "fecha": "2026-10-15T06:00",
    "zona": "Norte",
    "nucleo": "Quindio",
    "finca": "6823c9806adc4f62df5299ca",
    "lote": "Lote 12-C",
    "especie": "Pino Radiata",
    "turno": "Turno Mañana",
    "operador": "67ec0c01e8f90c585bfdde80",
    "estado_equipo": "No",
    "tiempo_programado": 8,
    "array_paradas": [
      {
        "id": "p_no_op_01",
        "tiempo": 480,
        "motivo": "En reparación",
        "observacion": "Falla en convertidor de torque. Esperando repuesto mayor.",
        "componente": {
          "codigo": "CAB-TRA-01",
          "item": "Transmisión y Convertidor",
          "categoria": "Tren de Potencia",
          "subcategoria": "Transmisión"
        }
      }
    ],
    "winche": 0,
    "novedad": "Equipo inoperativo durante todo el turno.",
    "suelo": "Seco"
  }
}
```

---

### 7.5. Respuesta del Servidor

**Éxito (`201 Created`):**
```json
{
  "success": true,
  "message": "Respuesta del formulario registrada exitosamente",
  "data": {
    "_id": "6704a2995e89a421b01c3d99",
    "formularioId": "68e73429fa21000100000002",
    "formularioTituloSnapshot": "Reporte Operacional Forwarder (FW)",
    "tipoEquipoSnapshot": "Forwarder",
    "equipoId": "6823a67d7415031f80ead887",
    "fincaId": "6823c9806adc4f62df5299ca",
    "operadorId": "67ec0c01e8f90c585bfdde80",
    "fecha": "2026-10-15T08:00:00.000Z",
    "produccionToneladas": 310.2,
    "respuestasMap": {
      "m3": 310.2,
      "n_cargas": 18
    },
    "createdAt": "2026-10-09T05:25:00.000Z"
  }
}
```

---

## 8. Estrategia de Almacenamiento Offline y Sincronización en Diferido

Para garantizar que ningún reporte de producción se pierda cuando la cuadrilla está fuera de cobertura:

1. **Almacenamiento Local de Catálogos (Caché)**:
   - Almacenar el objeto retornado por `GET /ctl/listas/sync-empresa` en `localStorage` o base de datos local SQLite bajo la clave `ctl_cache_catalogos` y `ctl_cache_formularios`.
2. **Cola de Envío Local (`Outbox`)**:
   - Cuando el operador hace clic en "Finalizar y Guardar Reporte":
     - Si `navigator.onLine === true`: Intentar enviar inmediatamente a `POST /ctl/listas/:id/responder`.
     - Si no hay conexión o la petición falla con error de red (status 0, timeout o sin internet): Guardar el reporte en la cola local con un ID único (`rep_1728450123_abc`).
3. **Escuchador de Conectividad**:
   - Escuchar los eventos `window.addEventListener("online", reintentarCola)`.
   - Al recuperar señal, iterar los reportes encolados y enviarlos en orden cronológico.
   - Tras recibir `201 Created`, eliminar el reporte de la cola local.
4. **Idempotencia**:
   - Conservar el timestamp original `fecha` en el cuerpo del reporte para asegurar que la fecha imputada a la planeación corresponda al momento exacto en que se realizó el trabajo en el bosque y no al momento de la reconexión.
