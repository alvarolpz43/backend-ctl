/**
 * Middleware para validar permisos granulares por módulo y acción
 * Formato de permisos: user.permisos = { [modulo]: { read, write, update, delete } }
 *
 * @param {string} modulo - Nombre del módulo ('contratistas', 'equipos', 'operadores', etc.)
 * @param {('read'|'write'|'update'|'delete')} accion - Acción a ejecutar
 */
export const checkPermission = (modulo, accion) => {
  return (req, res, next) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "No autorizado. Token o usuario no encontrado",
        });
      }

      // Bypass para rol Administrador de sistema
      const roleName = user.role?.name || "";
      const isSystemAdmin = roleName.toLowerCase() === "administrador" || user.role?.isSystem;
      if (isSystemAdmin) {
        return next();
      }

      // Obtener permisos efectivos
      const userPermisos = user.permisos || user.role?.permisos || {};
      const moduloPermisos = userPermisos[modulo];

      if (!moduloPermisos || !moduloPermisos[accion]) {
        return res.status(403).json({
          success: false,
          message: `Acceso denegado: No tienes permiso de "${accion}" en el módulo "${modulo}"`,
          requiredPermission: { modulo, accion },
        });
      }

      return next();
    } catch (error) {
      console.error("Error en checkPermission:", error);
      return res.status(500).json({
        success: false,
        message: "Error interno al verificar permisos",
      });
    }
  };
};
