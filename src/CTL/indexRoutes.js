import Router from "express";
import { authMiddleware } from "../Middleware/ValidateAuth.js";

import ConttsRoutes from "./routes/contratistas.routes.js";
import EquiposRoutes from "./routes/equipos.routes.js";
import EspeciesRoutes from "./routes/especies.routes.js";
import FincasRoutes from "./routes/fincas.routes.js";
import NucleosRoutes from "./routes/nucleos.routes.js";
import ZonasRoutes from "./routes/zonas.routes.js";
import OperadoresRoutes from "./routes/operadores.routes.js";
import TurnosRoutes from "./routes/turno.routes.js";
import ListasRoutes from "./routes/listas.routes.js";
import PreguntasBancoRoutes from "./routes/preguntasBanco.routes.js";
import LineasRoutes from "./routes/lineas.routes.js";
import PlaneacionRoutes from "./routes/planeacion.routes.js";

const routerCTL = Router();

routerCTL.use(authMiddleware);

routerCTL.use("/contratistas", ConttsRoutes);
routerCTL.use("/equipos", EquiposRoutes);
routerCTL.use("/especies", EspeciesRoutes);
routerCTL.use("/fincas", FincasRoutes);
routerCTL.use("/nucleos", NucleosRoutes);
routerCTL.use("/zonas", ZonasRoutes);
routerCTL.use("/operadores", OperadoresRoutes);
routerCTL.use("/turnos", TurnosRoutes);
routerCTL.use("/listas", ListasRoutes);
routerCTL.use("/preguntas-banco", PreguntasBancoRoutes);
routerCTL.use("/lineas", LineasRoutes);
routerCTL.use("/planeacion", PlaneacionRoutes);

export default routerCTL;