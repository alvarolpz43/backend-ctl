import mongoose from "mongoose";
import "dotenv/config";
import PreguntaBancoModel from "../models/preguntasBanco.model.js";
import ListaTemplateModel from "../models/listas.model.js";
import RespuestaListaModel from "../models/respuestasLista.model.js";
import { connectDb } from "../../database/db.js";

export const COMPONENTES_DATA = [
  { categoria: "Maquina Base", subcategoria: "Electrica", item: "Generador", codigo: "1101" },
  { categoria: "Maquina Base", subcategoria: "Electrica", item: "Motor De Arranque", codigo: "1102" },
  { categoria: "Maquina Base", subcategoria: "Electrica", item: "Batería", codigo: "1103" },
  { categoria: "Maquina Base", subcategoria: "Electrica", item: "Cables", codigo: "1104" },
  { categoria: "Maquina Base", subcategoria: "Electrica", item: "Centralita Eléctrica", codigo: "1105" },
  { categoria: "Maquina Base", subcategoria: "Electrica", item: "Instrumentos", codigo: "1106" },
  { categoria: "Maquina Base", subcategoria: "Electrica", item: "Luces", codigo: "1107" },
  { categoria: "Maquina Base", subcategoria: "Electrica", item: "Equipo De Control", codigo: "1108" },
  { categoria: "Maquina Base", subcategoria: "Electrica", item: "Sensor", codigo: "1109" },
  { categoria: "Maquina Base", subcategoria: "Electrica", item: "Electroimán", codigo: "1110" },
  { categoria: "Maquina Base", subcategoria: "Electrica", item: "Equipo Del Asiento", codigo: "1111" },
  { categoria: "Maquina Base", subcategoria: "Electrica", item: "Equipo De Comunicaciones", codigo: "1112" },
  { categoria: "Maquina Base", subcategoria: "Electrica", item: "Sistema De Supresión De Incendios", codigo: "1113" },
  { categoria: "Maquina Base", subcategoria: "Electrica", item: "Misceláneo", codigo: "1199" },
  { categoria: "Maquina Base", subcategoria: "Hidráulica", item: "Bomba", codigo: "1201" },
  { categoria: "Maquina Base", subcategoria: "Hidráulica", item: "Motor", codigo: "1202" },
  { categoria: "Maquina Base", subcategoria: "Hidráulica", item: "Mangueras", codigo: "1203" },
  { categoria: "Maquina Base", subcategoria: "Hidráulica", item: "Válvulas", codigo: "1204" },
  { categoria: "Maquina Base", subcategoria: "Hidráulica", item: "Cilindros", codigo: "1205" },
  { categoria: "Maquina Base", subcategoria: "Hidráulica", item: "Equipo De Control", codigo: "1206" },
  { categoria: "Maquina Base", subcategoria: "Hidráulica", item: "Filtro", codigo: "1207" },
  { categoria: "Maquina Base", subcategoria: "Hidráulica", item: "Misceláneo", codigo: "1299" },
  { categoria: "Maquina Base", subcategoria: "Mecánica", item: "Chasis", codigo: "1301" },
  { categoria: "Maquina Base", subcategoria: "Mecánica", item: "Brazo Pitman", codigo: "1302" },
  { categoria: "Maquina Base", subcategoria: "Mecánica", item: "Eje Delantero", codigo: "1303" },
  { categoria: "Maquina Base", subcategoria: "Mecánica", item: "Eje Trasero", codigo: "1304" },
  { categoria: "Maquina Base", subcategoria: "Mecánica", item: "Bogies", codigo: "1305" },
  { categoria: "Maquina Base", subcategoria: "Mecánica", item: "Equipo Del Volante", codigo: "1306" },
  { categoria: "Maquina Base", subcategoria: "Mecánica", item: "Frenos", codigo: "1307" },
  { categoria: "Maquina Base", subcategoria: "Mecánica", item: "Motor", codigo: "1308" },
  { categoria: "Maquina Base", subcategoria: "Mecánica", item: "Caja De Cambios", codigo: "1309" },
  { categoria: "Maquina Base", subcategoria: "Mecánica", item: "Sistema De Combustible", codigo: "1310" },
  { categoria: "Maquina Base", subcategoria: "Mecánica", item: "Cabina", codigo: "1311" },
  { categoria: "Maquina Base", subcategoria: "Mecánica", item: "Equipo Del Asiento", codigo: "1312" },
  { categoria: "Maquina Base", subcategoria: "Mecánica", item: "Sistema De Supresión De Incendios", codigo: "1313" },
  { categoria: "Maquina Base", subcategoria: "Mecánica", item: "Misceláneo", codigo: "1399" },
  { categoria: "Maquina Base", subcategoria: "Neumática", item: "Compresor", codigo: "1401" },
  { categoria: "Maquina Base", subcategoria: "Neumática", item: "Válvulas", codigo: "1402" },
  { categoria: "Maquina Base", subcategoria: "Neumática", item: "Conductos", codigo: "1403" },
  { categoria: "Maquina Base", subcategoria: "Neumática", item: "Sistema Anticongelante", codigo: "1404" },
  { categoria: "Maquina Base", subcategoria: "Neumática", item: "Misceláneo", codigo: "1499" },
  { categoria: "Grúa", subcategoria: "Eléctrica", item: "Cables", codigo: "2101" },
  { categoria: "Grúa", subcategoria: "Eléctrica", item: "Equipo De Control", codigo: "2102" },
  { categoria: "Grúa", subcategoria: "Eléctrica", item: "Luces", codigo: "2103" },
  { categoria: "Grúa", subcategoria: "Eléctrica", item: "Sensor", codigo: "2104" },
  { categoria: "Grúa", subcategoria: "Eléctrica", item: "Electroimán", codigo: "2105" },
  { categoria: "Grúa", subcategoria: "Eléctrica", item: "Misceláneo", codigo: "2199" },
  { categoria: "Grúa", subcategoria: "Hidráulica", item: "Mangueras", codigo: "2201" },
  { categoria: "Grúa", subcategoria: "Hidráulica", item: "Válvulas", codigo: "2202" },
  { categoria: "Grúa", subcategoria: "Hidráulica", item: "Cilindros", codigo: "2203" },
  { categoria: "Grúa", subcategoria: "Hidráulica", item: "Motor", codigo: "2204" },
  { categoria: "Grúa", subcategoria: "Hidráulica", item: "Rotator", codigo: "2205" },
  { categoria: "Grúa", subcategoria: "Hidráulica", item: "Misceláneo", codigo: "2299" },
  { categoria: "Grúa", subcategoria: "Mecánica", item: "Carcasa De Giro", codigo: "2301" },
  { categoria: "Grúa", subcategoria: "Mecánica", item: "Soporte Del Brazo", codigo: "2302" },
  { categoria: "Grúa", subcategoria: "Mecánica", item: "Brazo Horizontal", codigo: "2303" },
  { categoria: "Grúa", subcategoria: "Mecánica", item: "Brazo Vertical", codigo: "2304" },
  { categoria: "Grúa", subcategoria: "Mecánica", item: "Telescopio", codigo: "2305" },
  { categoria: "Grúa", subcategoria: "Mecánica", item: "Garra", codigo: "2306" },
  { categoria: "Grúa", subcategoria: "Mecánica", item: "Rodillos Humectadores Oscilantes", codigo: "2307" },
  { categoria: "Grúa", subcategoria: "Mecánica", item: "Misceláneo", codigo: "2399" },
  { categoria: "Cabezal Cosechador", subcategoria: "Eléctrica", item: "Cables", codigo: "3101" },
  { categoria: "Cabezal Cosechador", subcategoria: "Eléctrica", item: "Equipo De Control", codigo: "3102" },
  { categoria: "Cabezal Cosechador", subcategoria: "Eléctrica", item: "Ordenador", codigo: "3103" },
  { categoria: "Cabezal Cosechador", subcategoria: "Eléctrica", item: "Sensor", codigo: "3104" },
  { categoria: "Cabezal Cosechador", subcategoria: "Eléctrica", item: "Electroimán", codigo: "3105" },
  { categoria: "Cabezal Cosechador", subcategoria: "Eléctrica", item: "Misceláneo", codigo: "3199" },
  { categoria: "Cabezal Cosechador", subcategoria: "Hidráulica", item: "Conductos", codigo: "3201" },
  { categoria: "Cabezal Cosechador", subcategoria: "Hidráulica", item: "Válvulas", codigo: "3202" },
  { categoria: "Cabezal Cosechador", subcategoria: "Hidráulica", item: "Cilindros", codigo: "3203" },
  { categoria: "Cabezal Cosechador", subcategoria: "Hidráulica", item: "Motor De La Sierra", codigo: "3204" },
  { categoria: "Cabezal Cosechador", subcategoria: "Hidráulica", item: "Rodillos De Alimentación", codigo: "3205" },
  { categoria: "Cabezal Cosechador", subcategoria: "Hidráulica", item: "Tensor De Cadena", codigo: "3206" },
  { categoria: "Cabezal Cosechador", subcategoria: "Hidráulica", item: "Misceláneo", codigo: "3299" },
  { categoria: "Cabezal Cosechador", subcategoria: "Mecánica", item: "Chasis", codigo: "3301" },
  { categoria: "Cabezal Cosechador", subcategoria: "Mecánica", item: "Cubierta Protectora", codigo: "3302" },
  { categoria: "Cabezal Cosechador", subcategoria: "Mecánica", item: "Brazos De Rodillo De Alimentación", codigo: "3303" },
  { categoria: "Cabezal Cosechador", subcategoria: "Mecánica", item: "Rodillos De Alimentación", codigo: "3304" },
  { categoria: "Cabezal Cosechador", subcategoria: "Mecánica", item: "Cuchillos De Desrame", codigo: "3305" },
  { categoria: "Cabezal Cosechador", subcategoria: "Mecánica", item: "Unidad De Sierra", codigo: "3306" },
  { categoria: "Cabezal Cosechador", subcategoria: "Mecánica", item: "Tensor De Cadena", codigo: "3307" },
  { categoria: "Cabezal Cosechador", subcategoria: "Mecánica", item: "Lubricador De La Cadena", codigo: "3308" },
  { categoria: "Cabezal Cosechador", subcategoria: "Mecánica", item: "Dispositivo De Medición", codigo: "3309" },
  { categoria: "Cabezal Cosechador", subcategoria: "Mecánica", item: "Marcador De Color", codigo: "3310" },
  { categoria: "Cabezal Cosechador", subcategoria: "Mecánica", item: "Dispositivo De Revestimiento De Tocón", codigo: "3311" },
  { categoria: "Cabezal Cosechador", subcategoria: "Mecánica", item: "Misceláneo", codigo: "3399" },
  { categoria: "Cabezal Cosechador", subcategoria: "Otro", item: "Otro", codigo: "3401" }
];

export const opcionesEstructuradas = COMPONENTES_DATA.map(c => ({
  label: `[${c.codigo}] ${c.item} (${c.categoria} > ${c.subcategoria})`,
  value: c.codigo,
  codigo: c.codigo,
  categoria: c.categoria,
  subcategoria: c.subcategoria,
  item: c.item
}));

export const arbolComponentes = COMPONENTES_DATA.reduce((acc, c) => {
  let cat = acc.find(x => x.nombre === c.categoria);
  if (!cat) {
    cat = { nombre: c.categoria, subcategorias: [] };
    acc.push(cat);
  }
  let subcat = cat.subcategorias.find(x => x.nombre === c.subcategoria);
  if (!subcat) {
    subcat = { nombre: c.subcategoria, items: [] };
    cat.subcategorias.push(subcat);
  }
  subcat.items.push({
    codigo: c.codigo,
    item: c.item,
    label: `[${c.codigo}] ${c.item}`,
    value: c.codigo
  });
  return acc;
}, []);

export const resetAndSeed = async () => {
  console.log("🧹 1. Limpiando preguntas de componentes previas...");
  await PreguntaBancoModel.deleteOne({ label: "Componente / Ítem de Maquinaria" });
  console.log("✅ Limpieza completada.");

  console.log("🌱 2. Creando la única pregunta requerida con las 80 opciones multi-campo en cascada...");
  const preguntaUnica = await PreguntaBancoModel.create({
    label: "Componente / Ítem de Maquinaria",
    tipo: "cascading_select",
    categoria: "Componentes y Fallas",
    descripcion: "Selección técnica jerárquica en cascada: Categoría > Subcategoría > Ítem con código",
    opciones: opcionesEstructuradas,
    jerarquia: arbolComponentes,
    niveles: ["Categoría", "Subcategoría", "Ítem / Código"],
    activo: true
  });
  console.log(`✅ Pregunta creada en el banco con ID: ${preguntaUnica._id} (${opcionesEstructuradas.length} opciones en cascada).`);
};

if (process.argv[1]?.endsWith("resetAndSeedComponents.js")) {
  main().catch(err => {
    console.error("Error en resetAndSeed:", err);
    process.exit(1);
  });
}
