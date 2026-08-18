import { CMSBlock } from "../types";

export const initialCMSBlocks: CMSBlock[] = [
  {
    id: "block_1",
    type: "HEADING",
    content: {
      text: "NUESTROS ESTUDIOS Y",
      accentText: "SALAS DE ENSAYO",
      level: 3,
    },
    order: 10,
  },
  {
    id: "block_2",
    type: "PARAGRAPH",
    content: {
      text: "DISPONEMOS DE TRES ESTUDIOS TOTALMENTE EQUIPADOS EN LEÓN, GUANAJUATO, DISEÑADOS PARA EL ENTRENAMIENTO EXHAUSTIVO DE TEATRO, CANTO Y DANZA CONTEMPORÁNEA. CADA SALA CUENTA CON PISO AMORTIGUADO Y ESPEJOS DE CUERPO ENTERO.",
    },
    order: 20,
  },
  {
    id: "block_3",
    type: "WARNING_BANNER",
    content: {
      text: "ACCESO RESTRINGIDO A ALUMNOS REGISTRADOS CON FOLIO ACTIVO.",
      variant: "red",
    },
    order: 30,
  },
  {
    id: "block_4",
    type: "IMAGE_GRID",
    content: {
      images: [
        "ESTUDIO PRINCIPAL A",
        "SALA DE EXPRESIÓN CORPORAL",
        "CABINA DE GRABACIÓN VOCAL"
      ],
      variant: "concrete",
    },
    order: 40,
  },
];
