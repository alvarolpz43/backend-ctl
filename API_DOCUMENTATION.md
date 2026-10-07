# Documentación Técnica Integral de la API - CTL Forestal

Documento de referencia técnica del sistema **CTL (Corte y Transporte Longitudinal)**. Contiene la especificación exhaustiva de todos los módulos, endpoints, métodos HTTP, encabezados requeridos, parámetros de URL y consulta, esquemas de cuerpos de solicitud (`Request Bodies`), respuestas exitosas (`Responses 200/201`), códigos de error y comandos `cURL` listos para ejecución.

---

## Índice General

1. [Arquitectura y Configuración Base](#1-arquitectura-y-configuración-base)
2. [Autenticación, Seguridad y Matriz de Permisos (RBAC)](#2-autenticación-seguridad-y-matriz-de-permisos-rbac)
3. [Módulo: Autenticación y Usuarios (`/auth/users`)](#3-módulo-autenticación-y-usuarios-authusers)
4. [Módulo: Roles y Permisos (`/auth/roles`)](#4-módulo-roles-y-permisos-authroles)
5. [Módulo: Planeación Mensual (`/ctl/planeacion`)](#5-módulo-planeación-mensual-ctlplaneacion)
6. [Módulo: Líneas de Producción (`/ctl/lineas`)](#6-módulo-líneas-de-producción-ctllineas)
7. [Módulo: Información Operacional y Formularios Dinámicos (`/ctl/listas`)](#7-módulo-información-operacional-y-formularios-dinámicos-ctllistas)
8. [Módulo: Banco de Preguntas (`/ctl/preguntas-banco`)](#8-módulo-banco-de-preguntas-ctlpreguntas-banco)
9. [Módulo: Contratistas (`/ctl/contratistas`)](#9-módulo-contratistas-ctlcontratistas)
10. [Módulo: Equipos y Maquinaria (`/ctl/equipos`)](#10-módulo-equipos-y-maquinaria-ctlequipos)
11. [Módulo: Operadores de Campo (`/ctl/operadores`)](#11-módulo-operadores-de-campo-ctloperadores)
12. [Módulo: Turnos de Trabajo (`/ctl/turnos`)](#12-módulo-turnos-de-trabajo-ctlturnos)
13. [Módulo: Ubicaciones Forestales (`/ctl/fincas`, `/ctl/nucleos`, `/ctl/zonas`)](#13-módulo-ubicaciones-forestales-ctlfincas-ctlnucleos-ctlzonas)
14. [Módulo: Especies Forestales (`/ctl/especies`)](#14-módulo-especies-forestales-ctlespecies)
15. [Códigos de Estado y Manejo de Errores](#15-códigos-de-estado-y-manejo-de-errores)

---

## 1. Arquitectura y Configuración Base

- **Servidor Backend**: Node.js con Express, arquitectura por capas (Rutas, Middlewares, Controladores, Servicios, Repositorios y Modelos Mongoose).
- **Base de Datos**: MongoDB.
- **Cliente Frontend**: React 19, TypeScript, HeroUI (`@heroui/react`), Tailwind CSS v4, Vite.
- **URL Base por Defecto**:
  - Desarrollo local: `http://localhost:3000`
  - Prefijo de Autenticación y Usuarios: `http://localhost:3000/auth`
  - Prefijo de Operaciones Forestales: `http://localhost:3000/ctl`
- **Encabezados Globales**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <JWT_TOKEN>` (obligatorio para **todos** los endpoints; peticiones sin token o con formato incorrecto se bloquean con 401 Unauthorized, con la única excepción de `/login`).

---

## 2. Autenticación, Seguridad y Matriz de Permisos (RBAC)

El acceso a la API cuenta con una política de seguridad estricta:
1. **Middleware Global de Autenticación Bearer**: Todas las rutas entrantes (tanto `/ctl/*` como `/auth/*` y rutas generales) exigen obligatoriamente la cabecera `Authorization: Bearer <token>`. Si no se envía el token o el formato es inválido, la petición se bloquea de inmediato con código `401 Unauthorized`.
   - **Excepción Única**: Las rutas de inicio de sesión (`/login`, `/auth/login`, `/auth/users/login`) no requieren token.
2. **`authMiddleware`**: Valida la firma del token JWT y carga el usuario autenticado junto con su rol.
3. **`checkPermission(modulo, accion)`**: Valida que el rol del usuario autenticado tenga concedido el permiso correspondiente para la acción solicitada:
   - `read`: Permite consultar y listar información.
   - `write`: Permite crear nuevos recursos.
   - `update`: Permite editar o actualizar recursos existentes.
   - `delete`: Permite dar de baja o eliminar recursos.

> **Regla de Administrador**: Los usuarios cuyo rol sea `Administrador` o posean la bandera `isSystem: true` tienen bypass completo con acceso total a todas las operaciones.

---

## 3. Módulo: Autenticación y Usuarios (`/auth/users`)

Gestiona el inicio de sesión, verificación de tokens JWT y la administración de usuarios del sistema.

### 3.1. Iniciar Sesión (Login)
- **Método**: `POST`
- **Ruta**: `/auth/users/login`
- **Acceso**: Público
- **Descripción**: Autentica credenciales y genera un token JWT.
- **Request Body**:
```json
{
  "email": "admin@ctl.com",
  "password": "Password123*"
}
```
- **Response (200 OK)**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3MDFiMmM0NWU4OWE0MjFiMDFjM2QxMSIsImlhdCI6MTY5...",
  "user": {
    "_id": "6701b2c45e89a421b01c3d11",
    "name": "Administrador General",
    "email": "admin@ctl.com",
    "role": {
      "_id": "6701b2c45e89a421b01c3d10",
      "name": "Administrador",
      "isSystem": true
    }
  }
}
```
- **cURL**:
```bash
curl -X POST "http://localhost:3000/auth/users/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ctl.com","password":"Password123*"}'
```

---

### 3.2. Verificar Token JWT
- **Método**: `POST`
- **Ruta**: `/auth/users/verify`
- **Acceso**: Requiere Token JWT
- **Header**: `Authorization: Bearer <token>`
- **Response (200 OK)**:
```json
{
  "_id": "6701b2c45e89a421b01c3d11",
  "name": "Administrador General",
  "email": "admin@ctl.com",
  "role": {
    "_id": "6701b2c45e89a421b01c3d10",
    "name": "Administrador",
    "isSystem": true
  }
}
```

---

### 3.3. Listar Todos los Usuarios
- **Método**: `GET`
- **Ruta**: `/auth/users`
- **Permiso**: `checkPermission("usuarios", "read")`
- **Response (200 OK)**:
```json
[
  {
    "_id": "6701b2c45e89a421b01c3d11",
    "name": "Administrador General",
    "email": "admin@ctl.com",
    "role": {
      "_id": "6701b2c45e89a421b01c3d10",
      "name": "Administrador",
      "isSystem": true
    },
    "createdAt": "2026-10-01T12:00:00.000Z"
  }
]
```

---

### 3.4. Registrar Nuevo Usuario
- **Método**: `POST`
- **Ruta**: `/auth/users/register`
- **Permiso**: `checkPermission("usuarios", "write")`
- **Request Body**:
```json
{
  "name": "Carlos Rodríguez",
  "email": "carlos.supervisor@ctl.com",
  "password": "Password123*",
  "role": "6701b2c45e89a421b01c3d20"
}
```
- **Response (201 Created)**:
```json
{
  "message": "Usuario registrado exitosamente",
  "user": {
    "_id": "6701b3a15e89a421b01c3d35",
    "name": "Carlos Rodríguez",
    "email": "carlos.supervisor@ctl.com",
    "role": "6701b2c45e89a421b01c3d20"
  }
}
```

---

### 3.5. Actualizar Usuario
- **Método**: `PUT`
- **Ruta**: `/auth/users/:id`
- **Permiso**: `checkPermission("usuarios", "update")`
- **Parámetro URL**: `:id` (ID del usuario)
- **Request Body**:
```json
{
  "name": "Carlos Rodríguez Silva",
  "email": "carlos.rodriguez@ctl.com",
  "password": "NuevoPasswordOpcional123"
}
```
- **Response (200 OK)**:
```json
{
  "message": "Usuario actualizado exitosamente",
  "user": {
    "_id": "6701b3a15e89a421b01c3d35",
    "name": "Carlos Rodríguez Silva",
    "email": "carlos.rodriguez@ctl.com"
  }
}
```

---

### 3.6. Asignar / Cambiar Rol a Usuario
- **Método**: `PUT`
- **Ruta**: `/auth/users/:id/role`
- **Permiso**: `checkPermission("usuarios", "update")`
- **Request Body**:
```json
{
  "role": "6701b2c45e89a421b01c3d10"
}
```
- **Response (200 OK)**:
```json
{
  "message": "Rol asignado correctamente",
  "user": {
    "_id": "6701b3a15e89a421b01c3d35",
    "role": "6701b2c45e89a421b01c3d10"
  }
}
```

---

### 3.7. Eliminar Usuario
- **Método**: `DELETE`
- **Ruta**: `/auth/users/:id`
- **Permiso**: `checkPermission("usuarios", "delete")`
- **Response (200 OK)**:
```json
{
  "message": "Usuario eliminado exitosamente",
  "id": "6701b3a15e89a421b01c3d35"
}
```

---

## 4. Módulo: Roles y Permisos (`/auth/roles`)

Control de acceso basado en roles con matriz RBAC para los 10 módulos principales.

### 4.1. Listar Roles
- **Método**: `GET`
- **Ruta**: `/auth/roles`
- **Permiso**: `checkPermission("roles", "read")`
- **Response (200 OK)**:
```json
[
  {
    "_id": "6701b2c45e89a421b01c3d10",
    "name": "Administrador",
    "description": "Acceso total y configuración del sistema",
    "isSystem": true,
    "permisos": {
      "planeacion": { "read": true, "write": true, "update": true, "delete": true },
      "listas": { "read": true, "write": true, "update": true, "delete": true },
      "turnos": { "read": true, "write": true, "update": true, "delete": true },
      "contratistas": { "read": true, "write": true, "update": true, "delete": true },
      "equipos": { "read": true, "write": true, "update": true, "delete": true },
      "operadores": { "read": true, "write": true, "update": true, "delete": true },
      "ubicaciones": { "read": true, "write": true, "update": true, "delete": true },
      "especies": { "read": true, "write": true, "update": true, "delete": true },
      "usuarios": { "read": true, "write": true, "update": true, "delete": true },
      "roles": { "read": true, "write": true, "update": true, "delete": true }
    }
  }
]
```

---

### 4.2. Crear Rol
- **Método**: `POST`
- **Ruta**: `/auth/roles`
- **Permiso**: `checkPermission("roles", "write")`
- **Request Body**:
```json
{
  "name": "Supervisor de Cosecha",
  "description": "Control operativo de frentes de corte y maquinaria",
  "permisos": {
    "planeacion": { "read": true, "write": true, "update": true, "delete": false },
    "listas": { "read": true, "write": true, "update": true, "delete": false },
    "turnos": { "read": true, "write": true, "update": true, "delete": false },
    "contratistas": { "read": true, "write": true, "update": true, "delete": false },
    "equipos": { "read": true, "write": true, "update": true, "delete": false },
    "operadores": { "read": true, "write": true, "update": true, "delete": false },
    "ubicaciones": { "read": true, "write": false, "update": false, "delete": false },
    "especies": { "read": true, "write": false, "update": false, "delete": false },
    "usuarios": { "read": false, "write": false, "update": false, "delete": false },
    "roles": { "read": false, "write": false, "update": false, "delete": false }
  }
}
```
- **Response (201 Created)**:
```json
{
  "_id": "6701c4a05e89a421b01c3e99",
  "name": "Supervisor de Cosecha",
  "isSystem": false
}
```

---

### 4.3. Actualizar Rol
- **Método**: `PUT`
- **Ruta**: `/auth/roles/:id`
- **Permiso**: `checkPermission("roles", "update")`

---

### 4.4. Eliminar Rol
- **Método**: `DELETE`
- **Ruta**: `/auth/roles/:id`
- **Permiso**: `checkPermission("roles", "delete")`
- **Nota**: Si el rol tiene `isSystem: true`, la petición retorna `400 Bad Request`.

---

## 5. Módulo: Planeación Mensual (`/ctl/planeacion`)

Planificación operativa de volumen de corte mensual por frentes de trabajo y cálculo de cumplimiento real.

> **Reglas de Negocio Clave**:
> 1. El **Harvester (HV)** derriba y troza la madera, determinando la producción total del mes.
> 2. Dicha producción se **divide equitativamente** entre todos los **Forwarders (FW)** participantes en la línea.
> 3. Cada línea cuenta con una meta mínima configurable (5,000 t por defecto).
> 4. Al eliminar una planeación, se requiere **confirmación estricta escribiendo el nombre** para evitar borrados accidentales.

### 5.1. Consultar Planeación por Período
- **Método**: `GET`
- **Ruta**: `/ctl/planeacion/periodo/:anio/:mes`
- **Permiso**: `checkPermission("planeacion", "read")`
- **Parámetros URL**: `:anio` (ej: `2026`), `:mes` (ej: `10`)
- **Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "_id": "6701c900e42a9b31d0541100",
    "nombre": "Octubre 2026",
    "anio": 2026,
    "mes": 10,
    "periodo": "2026-10",
    "estado": "activo",
    "kpis": {
      "metaTotalMes": 15000,
      "produccionTotalMes": 12450.75,
      "porcentajeCumplimientoMes": 83.0,
      "diferenciaMes": -2549.25,
      "cantidadLineas": 3
    },
    "lineasResumen": [
      {
        "lineaId": "6701a111e42a9b31d0541011",
        "nombreLinea": "Línea Alfa - Maderas del Norte",
        "contratista": {
          "_id": "6701a222e42a9b31d0541022",
          "nombre": "Maderas del Norte S.A.S."
        },
        "metaMinimaToneladas": 5000,
        "produccionRealToneladas": 5200.5,
        "porcentajeCumplimiento": 104.0,
        "diferenciaMeta": 200.5,
        "cantidadForwarders": 2,
        "toneladasPorForwarder": 2600.25,
        "harvesters": [
          {
            "_id": "6701a333e42a9b31d0541033",
            "nombreEquipo": "John Deere 1270G",
            "serieEquipo": "HV-01",
            "toneladas": 5200.5,
            "cantidadReportes": 28
          }
        ],
        "forwarders": [
          {
            "_id": "6701a444e42a9b31d0541044",
            "nombreEquipo": "Komatsu 875",
            "serieEquipo": "FW-01",
            "toneladasAtribuidas": 2600.25,
            "cantidadReportesOperacion": 26
          }
        ],
        "fincas": [
          {
            "_id": "6701a555e42a9b31d0541055",
            "nombreFinca": "Finca La Primavera",
            "codeFinca": "F-042"
          }
        ]
      }
    ]
  }
}
```

---

### 5.2. Crear o Actualizar Planeación Mensual (Upsert)
- **Método**: `POST`
- **Ruta**: `/ctl/planeacion`
- **Permiso**: `checkPermission("planeacion", "write")`
- **Request Body**:
```json
{
  "nombre": "Octubre 2026",
  "anio": 2026,
  "mes": 10,
  "estado": "activo",
  "notas": "Frentes de corte priorizados en rodales 4B y 5A",
  "lineasConfig": [
    {
      "lineaId": "6701a111e42a9b31d0541011",
      "nombreLinea": "Línea Alfa - Maderas del Norte",
      "contratistaId": "6701a222e42a9b31d0541022",
      "harvesters": ["6701a333e42a9b31d0541033"],
      "forwarders": ["6701a444e42a9b31d0541044", "6701a445e42a9b31d0541045"],
      "fincas": ["6701a555e42a9b31d0541055"],
      "metaMinimaToneladas": 5000
    }
  ]
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Planeación mensual guardada exitosamente",
  "data": {
    "_id": "6701c900e42a9b31d0541100",
    "periodo": "2026-10"
  }
}
```

---

### 5.3. Listar Histórico de Planeaciones
- **Método**: `GET`
- **Ruta**: `/ctl/planeacion`
- **Permiso**: `checkPermission("planeacion", "read")`

---

### 5.4. Eliminar Planeación Mensual
- **Método**: `DELETE`
- **Ruta**: `/ctl/planeacion/:id`
- **Permiso**: `checkPermission("planeacion", "delete")`
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Planeación eliminada exitosamente",
  "data": {
    "id": "6701c900e42a9b31d0541100"
  }
}
```

---

## 6. Módulo: Líneas de Producción (`/ctl/lineas`)

Agrupa maquinaria pesada de una misma empresa contratista para operar como una unidad productiva.

> **Regla Anti-Colisión**: Una máquina (Harvester o Forwarder) no puede pertenecer a más de una línea activa a la vez.

### 6.1. Listar Líneas
- **Método**: `GET`
- **Ruta**: `/ctl/lineas`
- **Permiso**: `checkPermission("planeacion", "read")`
- **Response (200 OK)**:
```json
[
  {
    "_id": "6701a111e42a9b31d0541011",
    "nombre": "Línea Alfa - Maderas del Norte",
    "contratistaId": {
      "_id": "6701a222e42a9b31d0541022",
      "nombre": "Maderas del Norte S.A.S."
    },
    "harvesters": [
      {
        "_id": "6701a333e42a9b31d0541033",
        "nombreEquipo": "John Deere 1270G",
        "serieEquipo": "HV-01"
      }
    ],
    "forwarders": [
      {
        "_id": "6701a444e42a9b31d0541044",
        "nombreEquipo": "Komatsu 875",
        "serieEquipo": "FW-01"
      }
    ],
    "fincasDefault": [],
    "metaMinimaDefecto": 5000,
    "activo": true
  }
]
```

---

### 6.2. Crear Línea
- **Método**: `POST`
- **Ruta**: `/ctl/lineas`
- **Permiso**: `checkPermission("planeacion", "write")`
- **Request Body**:
```json
{
  "nombre": "Línea 2 - Bosques Andinos",
  "contratistaId": "6701a222e42a9b31d0541022",
  "harvesters": ["6701a333e42a9b31d0541033"],
  "forwarders": ["6701a444e42a9b31d0541044"],
  "fincasDefault": ["6701a555e42a9b31d0541055"],
  "metaMinimaDefecto": 5000,
  "activo": true
}
```
- **Response (201 Created)**:
```json
{
  "_id": "6701b999e42a9b31d0541099",
  "nombre": "Línea 2 - Bosques Andinos",
  "activo": true
}
```

---

### 6.3. Editar Línea
- **Método**: `PUT`
- **Ruta**: `/ctl/lineas/:id`
- **Permiso**: `checkPermission("planeacion", "update")`

---

### 6.4. Eliminar Línea
- **Método**: `DELETE`
- **Ruta**: `/ctl/lineas/:id`
- **Permiso**: `checkPermission("planeacion", "delete")`

---

## 7. Módulo: Información Operacional y Formularios Dinámicos (`/ctl/listas`)

Diseño de plantillas jerárquicas con categorías, subcategorías, preguntas tipadas, selección en cascada y captura de reportes en campo.

> **Regla de Formulario**: Todo formulario operacional incluye de forma obligatoria un selector de equipo (`equipo_select`) vinculado para registrar sobre qué máquina se ejecuta el reporte.

### 7.1. Listar Plantillas de Formularios
- **Método**: `GET`
- **Ruta**: `/ctl/listas`
- **Permiso**: `checkPermission("listas", "read")`

---

### 7.2. Filtrar Plantillas por Tipo de Equipo
- **Método**: `GET`
- **Ruta**: `/ctl/listas/por-tipo/:tipoEquipo`
- **Parámetro URL**: `:tipoEquipo` (`Harvester`, `Forwarder`, `Ambos`, `General`)
- **Permiso**: `checkPermission("listas", "read")`

---

### 7.3. Consultar Formulario Completo
- **Método**: `GET`
- **Ruta**: `/ctl/listas/:id`
- **Permiso**: `checkPermission("listas", "read")`
- **Response (200 OK)**:
```json
{
  "_id": "6701d000e42a9b31d0541200",
  "titulo": "Reporte Diario de Operación Harvester",
  "descripcion": "Inspección preoperacional y registro de mediciones de turno",
  "tipoEquipo": "Harvester",
  "version": 1,
  "activo": true,
  "secciones": [
    {
      "id": "sec-cabina",
      "titulo": "Seguridad y Cabina",
      "descripcion": "Revisión física del equipo",
      "orden": 0
    },
    {
      "id": "sec-mediciones",
      "titulo": "Fluidos y Operación",
      "descripcion": "Mediciones y maestros vinculados",
      "orden": 1
    }
  ],
  "campos": [
    {
      "id": "c-equipo",
      "seccionId": "sec-cabina",
      "label": "Equipo Vinculado",
      "tipo": "equipo_select",
      "isDefaultEquipo": true,
      "required": true,
      "orden": 0
    },
    {
      "id": "c-freno",
      "seccionId": "sec-cabina",
      "label": "¿Freno de estacionamiento operativo?",
      "tipo": "radio",
      "opciones": ["Conforme", "No Conforme", "N/A"],
      "required": true,
      "orden": 1
    },
    {
      "id": "c-presion",
      "seccionId": "sec-mediciones",
      "label": "Presión de Aceite de Motor",
      "tipo": "number",
      "limiteMinimo": 25,
      "limiteMaximo": 75,
      "unidadMedida": "PSI",
      "placeholder": "Ej: 50",
      "descripcion": "Límites informativos (no bloquean el registro al excederse)",
      "required": true,
      "orden": 2
    },
    {
      "id": "c-especie",
      "seccionId": "sec-mediciones",
      "label": "Especie Forestal Cosechada",
      "tipo": "tabla_referencia",
      "tablaReferencia": "especies",
      "descripcion": "Carga opciones dinámicamente desde el maestro de especies",
      "required": false,
      "orden": 3
    }
  ]
}
```

---

### 7.4. Crear Formulario Dinámico
- **Método**: `POST`
- **Ruta**: `/ctl/listas`
- **Permiso**: `checkPermission("listas", "write")`
- **Request Body**:
```json
{
  "titulo": "Pre-Uso Diario de Forwarder",
  "descripcion": "Inspección técnica preoperacional de fluidos, mediciones y seguridad",
  "tipoEquipo": "Forwarder",
  "version": 1,
  "activo": true,
  "secciones": [
    {
      "id": "sec-inspeccion",
      "titulo": "Inspección General",
      "orden": 0
    },
    {
      "id": "sec-parametros",
      "titulo": "Parámetros de Medición",
      "orden": 1
    }
  ],
  "campos": [
    {
      "id": "c-equipo-fwd",
      "seccionId": "sec-inspeccion",
      "label": "Equipo Vinculado",
      "tipo": "equipo_select",
      "isDefaultEquipo": true,
      "required": true,
      "orden": 0
    },
    {
      "id": "c-temp-hid",
      "seccionId": "sec-parametros",
      "label": "Temperatura Hidráulica (°C)",
      "tipo": "number",
      "limiteMinimo": 40,
      "limiteMaximo": 85,
      "unidadMedida": "°C",
      "required": true,
      "orden": 1
    },
    {
      "id": "c-operador-apoyo",
      "seccionId": "sec-parametros",
      "label": "Operador de Apoyo",
      "tipo": "tabla_referencia",
      "tablaReferencia": "operadores",
      "required": false,
      "orden": 2
    }
  ]
}
```
- **Response (201 Created)**:
```json
{
  "_id": "6701d111e42a9b31d0541211",
  "titulo": "Pre-Uso Diario de Forwarder",
  "activo": true
}
```

---

### 7.5. Diligenciar / Enviar Respuestas en Campo
- **Método**: `POST`
- **Ruta**: `/ctl/listas/:id/responder` (o `/ctl/listas/:id/respuestas`)
- **Permiso**: `checkPermission("listas", "write")`
- **Comportamiento de Límites**: Los límites de los campos numéricos (`limiteMinimo`, `limiteMaximo`) son estrictamente informativos / orientativos. Si el valor capturado está fuera del rango, se alerta al usuario pero se autoriza el envío y persistencia del formulario.
- **Request Body**:
```json
{
  "formularioId": "6701d000e42a9b31d0541200",
  "equipoId": "6701a333e42a9b31d0541033",
  "operadorId": "6701b777e42a9b31d0541077",
  "fecha": "2026-10-05T08:30:00.000Z",
  "respuestas": [
    {
      "campoId": "c-equipo",
      "label": "Equipo Vinculado",
      "tipo": "equipo_select",
      "valor": "6701a333e42a9b31d0541033"
    },
    {
      "campoId": "c-freno",
      "label": "¿Freno de estacionamiento operativo?",
      "tipo": "radio",
      "valor": "Conforme"
    },
    {
      "campoId": "c-presion",
      "label": "Presión de Aceite de Motor",
      "tipo": "number",
      "valor": 80,
      "limiteMinimo": 25,
      "limiteMaximo": 75,
      "unidadMedida": "PSI"
    },
    {
      "campoId": "c-especie",
      "label": "Especie Forestal Cosechada",
      "tipo": "tabla_referencia",
      "tablaReferencia": "especies",
      "valor": "6701a999e42a9b31d0541099"
    }
  ]
}
```
- **Response (201 Created)**:
```json
{
  "success": true,
  "message": "Reporte operacional guardado correctamente",
  "data": {
    "_id": "6701e888e42a9b31d0541888"
  }
}
```

---

### 7.6. Consultar Respuestas Registradas
- **Método**: `GET`
- **Ruta**: `/ctl/listas/:id/respuestas`
- **Permiso**: `checkPermission("listas", "read")`
- **Query Params**:
  - `equipoId` (opcional): Filtrar por máquina
  - `fechaInicio` (opcional): Fecha en formato ISO
  - `fechaFin` (opcional): Fecha en formato ISO

---

## 8. Módulo: Banco de Preguntas (`/ctl/preguntas-banco`)

Banco reutilizable para armar listas operacionales rápidamente (admite preguntas tipadas con límites de medición y referencias a maestros).

### 8.1. Listar Preguntas
- **Método**: `GET`
- **Ruta**: `/ctl/preguntas-banco`
- **Permiso**: `checkPermission("listas", "read")`
- **Response (200 OK)**:
```json
[
  {
    "_id": "6701f000e42a9b31d0541900",
    "label": "Presión de Aceite de Motor",
    "tipo": "number",
    "categoria": "Fluidos",
    "limiteMinimo": 25,
    "limiteMaximo": 75,
    "unidadMedida": "PSI",
    "opciones": []
  },
  {
    "_id": "6701f000e42a9b31d0541901",
    "label": "Especie Forestal Cosechada",
    "tipo": "tabla_referencia",
    "categoria": "Operación Forestal",
    "tablaReferencia": "especies",
    "opciones": []
  }
]
```

### 8.2. Crear Pregunta
- **Método**: `POST`
- **Ruta**: `/ctl/preguntas-banco`
- **Permiso**: `checkPermission("listas", "write")`
- **Request Body**:
```json
{
  "label": "Nivel de combustible al finalizar (%)",
  "tipo": "number",
  "categoria": "Fluidos y Niveles",
  "limiteMinimo": 10,
  "limiteMaximo": 100,
  "unidadMedida": "%",
  "opciones": []
}
```

### 8.3. Editar Pregunta
- **Método**: `PUT`
- **Ruta**: `/ctl/preguntas-banco/:id`

### 8.4. Eliminar Pregunta
- **Método**: `DELETE`
- **Ruta**: `/ctl/preguntas-banco/:id`

---

## 9. Módulo: Contratistas (`/ctl/contratistas`)

Gestión de empresas prestadoras de servicios de cosecha y transporte.

### 9.1. Listar Contratistas
- **Método**: `GET`
- **Ruta**: `/ctl/contratistas`
- **Permiso**: `checkPermission("contratistas", "read")`

### 9.2. Crear Contratista
- **Método**: `POST`
- **Ruta**: `/ctl/contratistas`
- **Permiso**: `checkPermission("contratistas", "write")`
- **Request Body**:
```json
{
  "nombre": "Maderas del Norte S.A.S.",
  "telefono": "+57 310 1234567",
  "email": "contacto@maderasdelnorte.com",
  "estado": true
}
```

### 9.3. Actualizar Contratista
- **Método**: `PUT`
- **Ruta**: `/ctl/contratistas/edit/:id`
- **Permiso**: `checkPermission("contratistas", "update")`

### 9.4. Eliminar Contratista
- **Método**: `DELETE`
- **Ruta**: `/ctl/contratistas/:id`
- **Permiso**: `checkPermission("contratistas", "delete")`

---

## 10. Módulo: Equipos y Maquinaria (`/ctl/equipos`)

Inventario de maquinaria pesada forestal.

### 10.1. Listar Equipos
- **Método**: `GET`
- **Ruta**: `/ctl/equipos`
- **Permiso**: `checkPermission("equipos", "read")`

### 10.2. Crear Equipo
- **Método**: `POST`
- **Ruta**: `/ctl/equipos`
- **Permiso**: `checkPermission("equipos", "write")`
- **Request Body**:
```json
{
  "nombreEquipo": "Harvester John Deere 1270G",
  "serieEquipo": "HV-1270-01",
  "tipoEquipo": "Harvester",
  "contratistaId": "6701a222e42a9b31d0541022",
  "estado": true
}
```

### 10.3. Actualizar Equipo
- **Método**: `PUT`
- **Ruta**: `/ctl/equipos/edit/:id`
- **Permiso**: `checkPermission("equipos", "update")`

### 10.4. Eliminar Equipo
- **Método**: `DELETE`
- **Ruta**: `/ctl/equipos/:id`
- **Permiso**: `checkPermission("equipos", "delete")`

---

## 11. Módulo: Operadores de Campo (`/ctl/operadores`)

Personal que opera la maquinaria forestal.

### 11.1. Listar Operadores
- **Método**: `GET`
- **Ruta**: `/ctl/operadores`
- **Permiso**: `checkPermission("operadores", "read")`

### 11.2. Crear Operador Individual
- **Método**: `POST`
- **Ruta**: `/ctl/operadores`
- **Permiso**: `checkPermission("operadores", "write")`
- **Request Body**:
```json
{
  "nombre": "Julián Morales",
  "documento": "1098765432",
  "telefono": "+57 320 9876543",
  "contratistaId": "6701a222e42a9b31d0541022",
  "estado": true
}
```

### 11.3. Carga Masiva de Operadores
- **Método**: `POST`
- **Ruta**: `/ctl/operadores/masivo`
- **Permiso**: `checkPermission("operadores", "write")`
- **Request Body**:
```json
[
  { "nombre": "Operador Uno", "documento": "1111111", "contratistaId": "6701a222e42a9b31d0541022" },
  { "nombre": "Operador Dos", "documento": "2222222", "contratistaId": "6701a222e42a9b31d0541022" }
]
```

---

## 12. Módulo: Turnos de Trabajo (`/ctl/turnos`)

Jornadas operacionales configurables.

### 12.1. Listar Turnos
- **Método**: `GET`
- **Ruta**: `/ctl/turnos`
- **Permiso**: `checkPermission("turnos", "read")`

### 12.2. Crear Turno
- **Método**: `POST`
- **Ruta**: `/ctl/turnos`
- **Permiso**: `checkPermission("turnos", "write")`
- **Request Body**:
```json
{
  "nombreTurno": "Turno Mañana (06:00 - 14:00)",
  "horaInicio": "06:00",
  "horaFin": "14:00",
  "descripcion": "Primer turno diurno",
  "estado": true
}
```

---

## 13. Módulo: Ubicaciones Forestales (`/ctl/fincas`, `/ctl/nucleos`, `/ctl/zonas`)

Jerarquía territorial: Macro-Zonas > Núcleos Territoriales > Fincas / Predios.

### 13.1. Zonas
- `GET /ctl/zonas`: Listar macro-zonas
- `POST /ctl/zonas`: Crear zona
  ```json
  { "nombreZona": "Zona Norte Antioquia", "estado": true }
  ```
- `PUT /ctl/zonas/edit/:id`: Actualizar
- `PUT /ctl/zonas/:id`: Desactivar/eliminar

### 13.2. Núcleos
- `GET /ctl/nucleos`: Listar núcleos con zona poblada
- `POST /ctl/nucleos`: Crear núcleo
  ```json
  { "nombreNucleo": "Núcleo Yarumal", "zonaId": "6701f555e42a9b31d0541555", "estado": true }
  ```
- `PUT /ctl/nucleos/edit/:id`: Actualizar
- `DELETE /ctl/nucleos/:id`: Eliminar

### 13.3. Fincas
- `GET /ctl/fincas`: Listar fincas
- `POST /ctl/fincas`: Crear finca individual
  ```json
  {
    "nombreFinca": "Finca La Primavera",
    "codeFinca": "F-042",
    "nucleoId": "6701f444e42a9b31d0541444",
    "zonaId": "6701f555e42a9b31d0541555",
    "estado": true
  }
  ```
- `POST /ctl/fincas/masive`: Importación masiva de predios
- `PUT /ctl/fincas/edit/:id`: Actualizar finca
- `DELETE /ctl/fincas/:id`: Eliminar finca

---

## 14. Módulo: Especies Forestales (`/ctl/especies`)

Catálogo taxonómico de especies madereras cosechadas.

### 14.1. Listar Especies
- **Método**: `GET`
- **Ruta**: `/ctl/especies`
- **Permiso**: `checkPermission("especies", "read")`

### 14.2. Crear Especie
- **Método**: `POST`
- **Ruta**: `/ctl/especies`
- **Permiso**: `checkPermission("especies", "write")`
- **Request Body**:
```json
{
  "nombreEspecie": "Pinus patula",
  "codigoEspecie": "PIN-PAT-01",
  "estado": true
}
```

### 14.3. Editar Especie
- **Método**: `PUT`
- **Ruta**: `/ctl/especies/edit/:id`

### 14.4. Eliminar Especie
- **Método**: `DELETE`
- **Ruta**: `/ctl/especies/:id`

---

## 15. Códigos de Estado y Manejo de Errores

| Código HTTP | Nombre | Significado en CTL |
| :--- | :--- | :--- |
| `200 OK` | Operación Exitosa | Solicitud procesada correctamente (GET, PUT, PATCH, DELETE). |
| `201 Created` | Creado | Recurso creado exitosamente en la base de datos (POST). |
| `400 Bad Request` | Error de Cliente | Datos inválidos o faltantes en el payload de solicitud. |
| `401 Unauthorized` | No Autorizado | Token JWT ausente, inválido o expirado. |
| `403 Forbidden` | Acceso Denegado | El usuario no posee el rol o permiso requerido para la acción. |
| `404 Not Found` | No Encontrado | El recurso o endpoint no existe en el sistema. |
| `500 Server Error` | Error de Servidor | Excepción no controlada durante el procesamiento en backend. |

### Formato Estándar de Respuesta de Error:
```json
{
  "success": false,
  "message": "Descripción clara del motivo del fallo"
}
```
