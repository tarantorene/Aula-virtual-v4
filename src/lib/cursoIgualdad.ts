// Curso precargado: "Igualdad, Derechos y No Discriminación" (Acuerdo MDT-2025-006)
// 5 cursos de 8 horas = 40 horas · 14 lecturas · 50 preguntas.
// Generado a partir del contenido del Plan de Capacitación en Igualdad 2026.
// Revise el contenido legal con asesoría laboral antes de publicarlo.
import type { ActividadPractica, Material, Question, Topic } from "../types";

const CATEGORIA = "Igualdad y No Discriminación (MDT-2025-006)";

const BASE = [
  {
    "id": "tpc-igualdad-2026-1",
    "orden": 1,
    "title": "Igualdad 1: Derechos laborales de mujeres y hombres",
    "description": "Conoce los derechos y obligaciones básicos de toda persona trabajadora y las protecciones especiales de maternidad y paternidad.",
    "ejeMdt": "derechos"
  },
  {
    "id": "tpc-igualdad-2026-2",
    "orden": 2,
    "title": "Igualdad 2: Igualdad de género y corresponsabilidad",
    "description": "Reconoce los estereotipos de género que afectan las decisiones en el trabajo y la importancia de compartir las tareas de cuidado.",
    "ejeMdt": "genero"
  },
  {
    "id": "tpc-igualdad-2026-3",
    "orden": 3,
    "title": "Igualdad 3: Trabajo de igual valor e igualdad salarial",
    "description": "Comprende el principio de igual remuneración por trabajo de igual valor y distingue las diferencias salariales justificadas de las discriminatorias.",
    "ejeMdt": "igual_valor"
  },
  {
    "id": "tpc-igualdad-2026-4",
    "orden": 4,
    "title": "Igualdad 4: Erradicación de la violencia, el acoso y la discriminación",
    "description": "Identifica el acoso laboral, el acoso sexual y la discriminación, y conoce la ruta confidencial para reportarlos sin represalias.",
    "ejeMdt": "violencia"
  },
  {
    "id": "tpc-igualdad-2026-5",
    "orden": 5,
    "title": "Igualdad 5: Inclusión, diversidad y comunicación respetuosa",
    "description": "Valora la inclusión de personas con discapacidad y de todas las edades, y aplica una comunicación respetuosa en el día a día.",
    "ejeMdt": "otro"
  }
] as const;

// Preguntas rápidas de microaprendizaje: una al final de cada lectura (sintaxis "?? / [ ] / [x] / >>").
const CHEQUEOS: Record<string, string> = {
  "mat-igualdad-2026-1-1": "?? Firmaste un documento que dice que renuncias a tus vacaciones. ¿Qué pasa con ese derecho?\n[ ] Lo pierdes, porque lo firmaste\n[x] Lo conservas: los derechos laborales son irrenunciables\n[ ] Solo lo conservas si el Ministerio lo aprueba\n>> La Constitución (Art. 326) dice que los derechos laborales son irrenunciables: ningún documento te los puede quitar.",
  "mat-igualdad-2026-1-2": "?? ¿Cuántos días de licencia de paternidad pagada tiene un papá por el nacimiento de su hijo?\n[ ] Ninguno, la licencia es solo para la mamá\n[ ] 3 días\n[x] 10 días, y 5 más en caso de cesárea o nacimiento múltiple\n>> El Art. 152 del Código del Trabajo reconoce la licencia de paternidad pagada de 10 días, que se amplía en cesárea o nacimiento múltiple.",
  "mat-igualdad-2026-2-1": "?? ¿Cuál es la diferencia entre sexo y género?\n[x] El sexo es biológico; el género son roles y expectativas que se aprenden y pueden cambiar\n[ ] Son lo mismo\n[ ] El género es biológico y el sexo se aprende\n>> El género son los roles que la sociedad asigna a mujeres y hombres: se aprenden, y por eso pueden cambiar.",
  "mat-igualdad-2026-2-2": "?? Un supervisor no asciende a una compañera porque «seguro se embaraza». ¿Qué es esa decisión?\n[ ] Una precaución razonable\n[x] Discriminación basada en un estereotipo\n[ ] Una decisión por competencias\n>> Cuando una decisión se basa en el género y no en las competencias, es discriminación.",
  "mat-igualdad-2026-2-3": "?? ¿Qué significa corresponsabilidad?\n[ ] Que la mamá se encarga de la casa y el papá «ayuda»\n[x] Compartir de forma justa el cuidado y las tareas del hogar entre mujeres, hombres, la empresa y el Estado\n[ ] Que la empresa cuide a los hijos de sus trabajadores\n>> Un papá que cuida no está ayudando: está haciendo su parte.",
  "mat-igualdad-2026-3-1": "?? ¿Qué significa «a trabajo de igual valor, igual remuneración»?\n[ ] Que todos en la empresa ganan lo mismo\n[x] Que nadie gane menos por ser mujer, por su edad u otra condición personal cuando hace un trabajo de igual valor\n[ ] Que solo se compara a personas con el mismo cargo exacto\n>> La igualdad salarial no significa ganar igual: significa que nadie gane menos por quién es.",
  "mat-igualdad-2026-3-2": "?? ¿Cuál de estas diferencias de sueldo es justificada?\n[ ] Pagar menos a una trabajadora porque tiene hijos pequeños\n[x] Pagar más a quien tiene un cargo con mayor responsabilidad\n[ ] Negar un bono por la edad de la persona\n>> El cargo, la antigüedad, las competencias, el desempeño y las horas extra son razones objetivas. El género, los hijos o la edad no lo son.",
  "mat-igualdad-2026-3-3": "?? Según el Acuerdo MDT-2025-006, ¿a quiénes se dirigen las capacitaciones de 40 horas al año?\n[ ] Solo a los jefes\n[ ] Solo a las mujeres de la empresa\n[x] A todas las personas trabajadoras, con participación de las máximas autoridades\n>> El acuerdo exige capacitar a todo el personal, incluidas las máximas autoridades, y reportarlo al Ministerio del Trabajo.",
  "mat-igualdad-2026-4-1": "?? ¿Qué caracteriza al acoso laboral según el Código del Trabajo?\n[ ] Una discusión aislada por un error en el turno\n[x] Un comportamiento reiterado que atenta contra la dignidad de la persona\n[ ] Solo puede venir de un jefe\n>> El acoso laboral es reiterado, atenta contra la dignidad y puede venir de un jefe, de un compañero o de un subordinado.",
  "mat-igualdad-2026-4-2": "?? Un compañero hace bromas sobre la edad de otro y a él le incomodan. Según el semáforo del respeto, ¿qué color es?\n[ ] Verde: es solo humor\n[x] Amarillo: si incomoda, hay que detenerse\n[ ] No aplica, porque la edad no es un tema de respeto\n>> Los comentarios sobre el cuerpo, la edad, el origen o el género son luz amarilla: si incomodan, detente. Si se repiten, pasan a rojo.",
  "mat-igualdad-2026-4-3": "?? Si reportas de buena fe un caso de acoso, ¿pueden cambiarte de puesto o despedirte por eso?\n[ ] Sí, si el jefe lo decide\n[x] No: tienes garantía de no represalias y confidencialidad\n[ ] Solo si el caso no se comprueba\n>> Reportar es tu derecho. Nadie puede castigarte por reportar de buena fe.",
  "mat-igualdad-2026-5-1": "?? ¿Cuál es la forma correcta de referirse a un compañero con discapacidad?\n[ ] Minusválido\n[ ] Inválido\n[x] Persona con discapacidad\n>> Usa «persona con discapacidad» y habla directamente con ella, no con su acompañante.",
  "mat-igualdad-2026-5-2": "?? ¿Qué es la mentoría en ambas direcciones?\n[x] Quien tiene experiencia enseña el oficio y quien es más joven comparte herramientas digitales\n[ ] Que los jóvenes supervisen a los mayores\n[ ] Que solo se capacite a quienes recién llegan\n>> La experiencia y las nuevas competencias se complementan en los equipos intergeneracionales.",
  "mat-igualdad-2026-5-3": "?? ¿Cuál frase habla de hechos y no de personas?\n[ ] «Eres un descuidado»\n[x] «La máquina quedó sin limpiar»\n[ ] «Siempre haces todo mal»\n>> Hablar de hechos permite corregir el problema sin atacar a la persona.",
};

export function cursoIgualdad2026(): { topics: Topic[]; materials: Material[]; questions: Question[] } {
  const ahora = new Date().toISOString();
  const topics: Topic[] = BASE.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    category: CATEGORIA,
    createdAt: ahora,
    minScoreToPass: 8,
    maxAttempts: 3,
    timeLimitMinutes: 20,
    randomizeQuestions: true,
    status: "published",
    targetAreas: [],
    hasInitialQuiz: false,
    horasAcreditadas: 8,
    ejeMdt: t.ejeMdt,
    minutosMinimos: 120,
    actividades: ACTIVIDADES[t.id] ?? [],
    notaMinimaModulo: 70,
    videoObligatorio: false,
  }));
  // Ejemplos prácticos y enlace oficial en la primera lectura de cada curso, y pregunta rápida al final de cada lectura
  const materials = MATERIALES.map((m) => {
    const extra = EJEMPLOS[m.id];
    const conEjemplo = extra
      ? { ...m, content: `${m.content}\n\n> **Ejemplo práctico en planta:** ${extra}`, recursos: [{ titulo: "Ministerio del Trabajo del Ecuador (normativa y trámites)", url: "https://www.trabajo.gob.ec" }] }
      : m;
    return CHEQUEOS[m.id] ? { ...conEjemplo, content: `${conEjemplo.content}\n\n${CHEQUEOS[m.id]}` } : conEjemplo;
  });
  return { topics, materials, questions: PREGUNTAS };
}

const MATERIALES: Material[] = [
  {
    "id": "mat-igualdad-2026-1-1",
    "topicId": "tpc-igualdad-2026-1",
    "title": "Tus derechos básicos en el trabajo",
    "type": "document",
    "content": "## Los derechos laborales son irrenunciables\n\nLa Constitución del Ecuador reconoce el trabajo como un derecho y un deber social (Art. 33) y establece que los derechos laborales son **irrenunciables e intangibles** (Art. 326). Esto significa que **ningún contrato ni acuerdo puede quitarte un derecho** que la ley te da, aunque lo firmes.\n\nEstos derechos aplican **por igual a mujeres y hombres**.\n\n## Lo que te garantiza el Código del Trabajo\n\n- **Jornada:** máximo 8 horas diarias y 40 horas semanales (Art. 47).\n- **Descanso semanal:** dos días de descanso, normalmente sábado y domingo (Art. 50).\n- **Horas adicionales:** las horas suplementarias se pagan con un recargo del 50 % y las extraordinarias con un recargo del 100 % (Art. 55).\n- **Vacaciones:** 15 días ininterrumpidos al año, y un día adicional por cada año a partir del quinto año en la misma empresa (Art. 69).\n- **Afiliación al IESS** desde el primer día de trabajo (Art. 42).\n- **Décimo tercer y décimo cuarto sueldo** (Arts. 111 y 113).\n- **Participación en utilidades:** el 15 % de las utilidades líquidas de la empresa se reparte entre las personas trabajadoras (Art. 97).\n\n## También tienes obligaciones\n\nCumplir el horario, seguir las normas de seguridad, cuidar los equipos y tratar con respeto a tus compañeras y compañeros. Los derechos y las obligaciones van juntos.\n\n> **Recuerda:** si tienes dudas sobre tu rol de pagos, tus vacaciones o tus horas extra, acude a **Recursos Humanos**. Preguntar es tu derecho.",
    "estimatedMinutes": 20
  },
  {
    "id": "mat-igualdad-2026-1-2",
    "topicId": "tpc-igualdad-2026-1",
    "title": "Maternidad, paternidad y lactancia",
    "type": "document",
    "content": "## Protecciones que cuidan a la familia\n\nEstas protecciones **no son privilegios**: protegen la salud de la madre y del bebé y reconocen que el cuidado es responsabilidad de mamás **y** papás.\n\n## Maternidad\n\n- **Licencia de maternidad pagada de 12 semanas** por el nacimiento de tu hija o hijo; se amplía 10 días en caso de nacimientos múltiples (Art. 152).\n- **Jornada de lactancia:** durante los **12 meses posteriores a la licencia de maternidad**, la jornada de la madre lactante es de **6 horas** diarias (Art. 155, conforme la sentencia 36-19-IN de la Corte Constitucional).\n- **Prohibición de despido por embarazo:** el despido de una trabajadora embarazada o en período de lactancia, por esa razón, se considera **ineficaz** (Art. 195.1).\n\n## Paternidad\n\n- **Licencia de paternidad pagada:** 10 días por el nacimiento de tu hija o hijo, que se amplían 5 días más en caso de cesárea o nacimiento múltiple (Art. 152).\n- Consulta con Recursos Humanos si existe alguna actualización legal sobre la duración de esta licencia.\n\n## Para mamá y papá\n\n- Al terminar la licencia de maternidad o paternidad, la madre o el padre puede solicitar una **licencia sin remuneración de hasta 9 meses** para el cuidado de su hija o hijo, sin perder su puesto.\n\n## En la contratación\n\nLa normativa del Ministerio del Trabajo prohíbe solicitar **pruebas de embarazo** o de **VIH** como requisito para contratar o mantener el empleo, y prohíbe preguntar por el estado civil o los planes de tener hijos para decidir una contratación.\n\n> **Hoy es ella, mañana puede ser tu esposa, tu hermana o tu hija.** Respetar estos derechos es respetar a tu familia.",
    "estimatedMinutes": 25
  },
  {
    "id": "mat-igualdad-2026-2-1",
    "topicId": "tpc-igualdad-2026-2",
    "title": "¿Qué es la igualdad de género?",
    "type": "document",
    "content": "## Conceptos clave\n\n- **Sexo:** características biológicas con las que nacemos.\n- **Género:** los roles, comportamientos y expectativas que la sociedad asigna a mujeres y hombres. Se aprenden, y por eso **pueden cambiar**.\n- **Igualdad de género:** mujeres y hombres tienen los **mismos derechos, oportunidades y responsabilidades**.\n- **Equidad:** dar a cada persona lo que necesita para llegar al mismo punto de partida.\n\n## Lo que dice la ley\n\nLa Constitución establece que **nadie puede ser discriminado** por razones de sexo, identidad de género, orientación sexual, estado civil, entre otras (Art. 11, numeral 2). Además, el Estado garantiza a las mujeres **igualdad en el acceso al empleo**, a la formación y promoción laboral, y a una remuneración equitativa (Art. 331).\n\n## Igualdad no es \"favorecer a las mujeres\"\n\nLa igualdad de género **nos beneficia a todos**: a las mujeres, que acceden a más oportunidades, y a los hombres, que pueden vivir su paternidad y su vida familiar sin estereotipos.",
    "estimatedMinutes": 20
  },
  {
    "id": "mat-igualdad-2026-2-2",
    "topicId": "tpc-igualdad-2026-2",
    "title": "Estereotipos en la planta y en la oficina",
    "type": "document",
    "content": "## ¿Qué es un estereotipo?\n\nEs una **idea fija y generalizada** sobre cómo \"deben\" ser las personas por su género. Por ejemplo:\n\n- \"Ese trabajo es muy pesado para una mujer.\"\n- \"Los hombres no saben organizar.\"\n- \"A ella no la promovamos porque seguro se embaraza.\"\n- \"Él no puede pedir permiso para cuidar a su hijo; eso es cosa de la mamá.\"\n\n## Cómo afectan al trabajo\n\nLos estereotipos producen **sesgos**: decisiones injustas que se toman sin darnos cuenta, al **contratar, asignar tareas, capacitar o promover**. Cuando una decisión se basa en el género y no en las competencias, es **discriminación**.\n\n## Qué podemos hacer\n\n1. **Decidir por competencias:** ¿la persona puede hacer el trabajo, con la capacitación y el equipo adecuados?\n2. **Cuestionar el \"siempre se ha hecho así\".**\n3. **Usar un lenguaje respetuoso**: evitar bromas que ridiculicen a un género.\n4. **Dar las mismas oportunidades** de capacitación y ascenso.\n\n> En FUNDAMETZ, el puesto es de quien tiene las competencias, no de un género.",
    "estimatedMinutes": 20
  },
  {
    "id": "mat-igualdad-2026-2-3",
    "topicId": "tpc-igualdad-2026-2",
    "title": "Corresponsabilidad: el cuidado es de todos",
    "type": "document",
    "content": "## Trabajo que no se paga, pero que cuenta\n\nCocinar, limpiar, cuidar a los hijos o a familiares enfermos o adultos mayores es **trabajo**, aunque no se pague. En Ecuador, las mujeres dedican **muchas más horas** que los hombres a este trabajo no remunerado, lo que limita su tiempo para estudiar, descansar o crecer laboralmente.\n\n## ¿Qué es la corresponsabilidad?\n\nEs **compartir de forma justa** las responsabilidades del hogar y del cuidado:\n\n- **Entre mujeres y hombres** dentro de la familia.\n- **Entre la familia, la empresa y el Estado**: la empresa respeta las licencias y facilita la conciliación entre el trabajo y la vida familiar.\n\n## Ideas prácticas\n\n- Los papás también usan su **licencia de paternidad** y participan en las citas médicas y la crianza.\n- Organizar los turnos y permisos con anticipación, hablando con tu supervisor y con Recursos Humanos.\n- Repartir las tareas de la casa de forma equitativa.\n\n> Un papá que cuida no está \"ayudando\": está **haciendo su parte**.",
    "estimatedMinutes": 20
  },
  {
    "id": "mat-igualdad-2026-3-1",
    "topicId": "tpc-igualdad-2026-3",
    "title": "A trabajo de igual valor, igual remuneración",
    "type": "document",
    "content": "## El principio\n\nEl Código del Trabajo establece la **igualdad de remuneración** sin discriminación (Art. 79), y la **Ley Orgánica para la Igualdad Salarial entre Mujeres y Hombres** refuerza que **a trabajo de igual valor corresponde igual remuneración**. Este principio también está en el **Convenio 100 de la OIT**.\n\n## ¿Qué es \"trabajo de igual valor\"?\n\nNo significa que los trabajos sean idénticos. Dos puestos distintos pueden tener **igual valor** si exigen un nivel similar de:\n\n- **Competencias:** conocimientos, experiencia y habilidades.\n- **Esfuerzo:** físico y mental.\n- **Responsabilidad:** sobre personas, equipos, dinero o resultados.\n- **Condiciones de trabajo:** riesgos, turnos, ambiente.\n\n## El mito más común\n\n**\"Con la igualdad salarial, todos vamos a ganar lo mismo.\"** ❌ **Mito.**\n\nLa igualdad salarial **no** significa que todos ganen igual. Significa que **nadie gane menos por ser mujer, por su edad, su etnia, una discapacidad o cualquier otra condición personal**, cuando hace un trabajo de igual valor.",
    "estimatedMinutes": 20
  },
  {
    "id": "mat-igualdad-2026-3-2",
    "topicId": "tpc-igualdad-2026-3",
    "title": "Diferencias justas y diferencias discriminatorias",
    "type": "document",
    "content": "## Diferencias salariales **justificadas** ✅\n\nEs legítimo que dos personas ganen distinto por razones **objetivas**, por ejemplo:\n\n- **El cargo** y su nivel de responsabilidad.\n- **La antigüedad** en la empresa.\n- **Las competencias** y la formación que exige el puesto.\n- **El desempeño**, medido con criterios claros.\n- **Las horas** suplementarias o extraordinarias trabajadas.\n\n## Diferencias **discriminatorias** ❌\n\nEstá prohibido pagar menos, o negar un bono o un ascenso, por:\n\n- Ser mujer u hombre.\n- Estar embarazada o tener hijos.\n- La edad, la etnia, la religión o el lugar de origen.\n- Tener una discapacidad o una enfermedad.\n\n## Si tienes dudas sobre tu sueldo\n\n1. **No saques conclusiones por un rumor.** Las diferencias pueden tener una razón objetiva.\n2. Consulta con **Recursos Humanos**: tienes derecho a conocer los criterios con que se fija tu remuneración.\n3. Si crees que existe una discriminación, puedes reportarlo de forma **confidencial** (lo verás en el Módulo 4).",
    "estimatedMinutes": 20
  },
  {
    "id": "mat-igualdad-2026-3-3",
    "topicId": "tpc-igualdad-2026-3",
    "title": "Lo que hace la empresa: el plan de igualdad",
    "type": "document",
    "content": "## Obligaciones del empleador\n\nEl **Acuerdo Ministerial MDT-2025-006** del Ministerio del Trabajo regula cómo los empleadores cumplen la ley de igualdad salarial. Entre otras obligaciones, las empresas deben:\n\n- Realizar **capacitaciones de al menos 40 horas al año** dirigidas a **todas las personas trabajadoras**, con la participación de sus máximas autoridades, sobre: derechos laborales de mujeres y hombres, igualdad de género, erradicación de la violencia y no discriminación, y trabajo de igual valor.\n- Realizar **acciones de sensibilización** sobre igualdad de género y no discriminación.\n- **Reportar** estas capacitaciones y acciones al Ministerio del Trabajo.\n\n## Por eso existe este curso\n\nCada módulo que apruebas suma horas a tu formación y sirve como **evidencia** de que FUNDAMETZ cumple la ley. Tu tiempo de estudio y tus evaluaciones quedan registrados de forma segura.\n\n> La igualdad salarial es un compromiso de la empresa **y** de cada persona: valorar el trabajo por lo que es, no por quién lo hace.",
    "estimatedMinutes": 15
  },
  {
    "id": "mat-igualdad-2026-4-1",
    "topicId": "tpc-igualdad-2026-4",
    "title": "Acoso laboral y acoso sexual",
    "type": "document",
    "content": "## Acoso laboral\n\nEl Código del Trabajo (Art. 46.1) define el acoso laboral como un comportamiento que **atenta contra la dignidad** de la persona, se ejerce **de forma reiterada** y puede **perjudicar su situación laboral**. Puede venir de un jefe, de un compañero o incluso de un subordinado.\n\n**Ejemplos:** humillar en público, aislar a alguien del equipo, asignar tareas imposibles para que falle, burlas o apodos ofensivos repetidos, amenazas constantes.\n\nEl acoso laboral está **prohibido** y puede ser causa de **visto bueno** (terminación del contrato) tanto para quien acosa como a pedido de quien lo sufre.\n\n## Acoso sexual\n\nSon los comentarios, insinuaciones, contactos o propuestas de **naturaleza sexual que la otra persona no desea**. Es una forma grave de violencia y, además, **un delito** según el Código Orgánico Integral Penal (Art. 166).\n\n## Marco internacional\n\nEl **Convenio 190 de la OIT** reconoce el derecho de toda persona a un mundo del trabajo **libre de violencia y acoso**, incluida la violencia por razón de género.",
    "estimatedMinutes": 25
  },
  {
    "id": "mat-igualdad-2026-4-2",
    "topicId": "tpc-igualdad-2026-4",
    "title": "Discriminación y el semáforo del respeto",
    "type": "document",
    "content": "## ¿Qué es discriminar?\n\nEs **tratar peor** a una persona por quién es. La Constitución (Art. 11, num. 2) prohíbe la discriminación por **etnia, lugar de nacimiento, edad, sexo, identidad de género, identidad cultural, estado civil, idioma, religión, ideología, filiación política, condición socioeconómica, condición migratoria, orientación sexual, estado de salud, portar VIH, discapacidad o diferencia física**, entre otras.\n\n## \"Era solo una broma\"... ¿mito o realidad?\n\n**Depende**, y depende de **quien la recibe**, no de quien la hace. Usa el **semáforo del respeto**:\n\n- 🟢 **Verde:** humor que todos disfrutan y que no se burla de nadie.\n- 🟡 **Amarillo:** comentarios sobre el cuerpo, la edad, el origen, la religión o el género de alguien. **Si incomodan, detente.**\n- 🔴 **Rojo:** burlas repetidas, apodos ofensivos, insinuaciones sexuales, excluir a alguien por quién es. **Es acoso o discriminación.**\n\n> **Regla simple:** si no lo dirías frente a todos, o si a ti te molestaría, **no lo digas**.",
    "estimatedMinutes": 20
  },
  {
    "id": "mat-igualdad-2026-4-3",
    "topicId": "tpc-igualdad-2026-4",
    "title": "Cómo reportar: ruta confidencial en FUNDAMETZ",
    "type": "document",
    "content": "## Si lo vives o lo presencias\n\n1. **No lo normalices.** Nadie tiene que \"aguantar\" el acoso o la discriminación.\n2. **Anota los hechos:** qué pasó, cuándo, dónde y quién estuvo presente.\n3. **Repórtalo** a **Recursos Humanos**. Si necesitas apoyo de salud, acude también al **área médica**.\n4. Si lo prefieres o el caso no se atiende, puedes acudir al **Ministerio del Trabajo**.\n\n## Tus garantías\n\n- **Confidencialidad:** tu caso se maneja con reserva.\n- **No represalias:** nadie puede castigarte, cambiarte de puesto o despedirte por reportar de buena fe.\n- **Debido proceso:** las dos partes son escuchadas antes de tomar una decisión.\n\n## Si eres testigo\n\nTu apoyo cuenta: acompaña a la persona afectada, no difundas rumores y, si ella está de acuerdo, ofrece tu testimonio.\n\n> **\"Si denuncio, me botan.\"** ❌ **Mito.** Reportar es tu derecho y la empresa debe protegerte.",
    "estimatedMinutes": 15
  },
  {
    "id": "mat-igualdad-2026-5-1",
    "topicId": "tpc-igualdad-2026-5",
    "title": "Inclusión de personas con discapacidad",
    "type": "document",
    "content": "## Lo que dice la ley\n\nEl Código del Trabajo obliga a las empresas con **25 o más trabajadores** a contratar **al menos un 4 %** de personas con discapacidad (Art. 42, numeral 33).\n\n## Inclusión no es caridad\n\n**\"Contratar personas con discapacidad es quitarle el puesto a otro.\"** ❌ **Mito.**\n\nCada persona ocupa su puesto **porque puede hacer el trabajo**, con los **ajustes razonables** que necesite: adaptar el puesto, el horario o las herramientas para que pueda desempeñarse en igualdad de condiciones.\n\n## Cómo apoyar la inclusión\n\n- Habla **directamente** con la persona, no con su acompañante.\n- **Pregunta antes de ayudar**: \"¿Te puedo ayudar en algo?\".\n- Usa el término **persona con discapacidad**, no \"inválido\" ni \"minusválido\".\n- Mantén libres las rutas de acceso y las señalizaciones.",
    "estimatedMinutes": 20
  },
  {
    "id": "mat-igualdad-2026-5-2",
    "topicId": "tpc-igualdad-2026-5",
    "title": "Todas las edades suman",
    "type": "document",
    "content": "## La edad no define la capacidad\n\nLa Constitución prohíbe la discriminación por **edad** (Art. 11, num. 2), y en 2025 se aprobó una reforma legal que refuerza la prohibición de discriminar por edad en el sistema laboral.\n\n## Prejuicios frecuentes\n\n- \"Los mayores no aprenden tecnología.\" ❌\n- \"Los jóvenes no son responsables.\" ❌\n- \"A esa edad ya no conviene capacitarlo.\" ❌\n\n## Equipos intergeneracionales\n\nLa **experiencia** de quienes llevan años en la planta y las **nuevas competencias** de quienes recién llegan se complementan. Algunas prácticas:\n\n- **Mentoría en ambas direcciones:** quien tiene experiencia enseña el oficio y quien es más joven comparte herramientas digitales.\n- Dar las **mismas oportunidades de capacitación** a todas las edades.\n- Evitar bromas sobre la edad (es **luz amarilla** del semáforo).",
    "estimatedMinutes": 15
  },
  {
    "id": "mat-igualdad-2026-5-3",
    "topicId": "tpc-igualdad-2026-5",
    "title": "Comunicación respetuosa en el día a día",
    "type": "document",
    "content": "## Cómo hablamos construye el ambiente de trabajo\n\n- **Escucha activa:** mira a la persona, no la interrumpas y confirma que entendiste: \"Si te entiendo bien, me dices que...\".\n- **Habla de hechos, no de personas:** \"La máquina quedó sin limpiar\" en lugar de \"Eres un descuidado\".\n- **Usa un tono firme pero respetuoso**, incluso en momentos de presión o de emergencia.\n- **Lenguaje inclusivo:** nombra a todas las personas (\"compañeras y compañeros\", \"el equipo\").\n\n## Manejar un desacuerdo\n\n1. **Calma:** si estás molesto, toma un momento antes de responder.\n2. **Escucha** la versión de la otra persona.\n3. **Busquen juntos una solución** enfocada en el trabajo.\n4. Si no se resuelve, **pide apoyo** a tu supervisor o a Recursos Humanos.\n\n> **Igualdad no es que todos reciban lo mismo; es que nadie reciba menos por quién es.**",
    "estimatedMinutes": 20
  }
];

const PREGUNTAS: Question[] = [
  {
    "id": "q-igualdad-2026-1-01",
    "topicId": "tpc-igualdad-2026-1",
    "questionText": "Firmaste un documento en el que \"renuncias\" a tus vacaciones. ¿Qué dice la ley?",
    "options": [
      "Pierdes las vacaciones porque lo firmaste",
      "Los derechos laborales son irrenunciables: el documento no te quita ese derecho",
      "Solo vale si lo firma también el Ministerio",
      "Puedes reclamar solo la mitad"
    ],
    "correctOptionIndex": 1,
    "type": "final",
    "format": "multiple",
    "points": 10
  },
  {
    "id": "q-igualdad-2026-1-02",
    "topicId": "tpc-igualdad-2026-1",
    "questionText": "¿Cuál es la jornada máxima ordinaria según el Código del Trabajo?",
    "options": [
      "10 horas diarias y 50 semanales",
      "8 horas diarias y 40 semanales",
      "12 horas diarias y 48 semanales",
      "No existe un máximo"
    ],
    "correctOptionIndex": 1,
    "type": "final",
    "format": "multiple",
    "points": 10
  },
  {
    "id": "q-igualdad-2026-1-03",
    "topicId": "tpc-igualdad-2026-1",
    "questionText": "¿Cuántos días de vacaciones anuales tiene una persona trabajadora durante sus primeros cinco años?",
    "options": [
      "10 días",
      "15 días ininterrumpidos",
      "30 días",
      "Depende de su sexo"
    ],
    "correctOptionIndex": 1,
    "type": "final",
    "format": "multiple",
    "points": 10
  },
  {
    "id": "q-igualdad-2026-1-04",
    "topicId": "tpc-igualdad-2026-1",
    "questionText": "¿Desde cuándo debe estar afiliada al IESS una persona trabajadora?",
    "options": [
      "Desde el primer día de trabajo",
      "Después del período de prueba",
      "Al cumplir un año",
      "Solo si lo solicita"
    ],
    "correctOptionIndex": 0,
    "type": "final",
    "format": "multiple",
    "points": 10
  },
  {
    "id": "q-igualdad-2026-1-05",
    "topicId": "tpc-igualdad-2026-1",
    "questionText": "¿Cuánto dura la licencia de maternidad pagada en un parto único?",
    "options": [
      "6 semanas",
      "10 semanas",
      "12 semanas",
      "6 meses"
    ],
    "correctOptionIndex": 2,
    "type": "final",
    "format": "multiple",
    "points": 10
  },
  {
    "id": "q-igualdad-2026-1-06",
    "topicId": "tpc-igualdad-2026-1",
    "questionText": "Después de la licencia de maternidad, ¿cuál es la jornada de la madre lactante y por cuánto tiempo?",
    "options": [
      "8 horas, sin cambios",
      "6 horas diarias durante 12 meses",
      "4 horas durante 3 meses",
      "6 horas durante 1 mes"
    ],
    "correctOptionIndex": 1,
    "type": "final",
    "format": "multiple",
    "points": 10
  },
  {
    "id": "q-igualdad-2026-1-07",
    "topicId": "tpc-igualdad-2026-1",
    "questionText": "La jornada reducida por lactancia de una compañera es:",
    "options": [
      "Un privilegio que perjudica al equipo",
      "Un favor de la empresa",
      "Un derecho legal que protege la salud de la madre y del bebé",
      "Algo que se negocia con el supervisor"
    ],
    "correctOptionIndex": 2,
    "type": "final",
    "format": "multiple",
    "points": 10
  },
  {
    "id": "q-igualdad-2026-1-08",
    "topicId": "tpc-igualdad-2026-1",
    "questionText": "¿Qué ocurre si se despide a una trabajadora por estar embarazada?",
    "options": [
      "Es válido si se le paga una indemnización",
      "El despido se considera ineficaz",
      "Es válido durante el período de prueba",
      "Solo genera una multa menor"
    ],
    "correctOptionIndex": 1,
    "type": "final",
    "format": "multiple",
    "points": 10
  },
  {
    "id": "q-igualdad-2026-1-09",
    "topicId": "tpc-igualdad-2026-1",
    "questionText": "En un parto normal, ¿cuántos días de licencia de paternidad pagada reconoce el Art. 152 del Código del Trabajo?",
    "options": [
      "Ninguno",
      "3 días",
      "10 días",
      "12 semanas"
    ],
    "correctOptionIndex": 2,
    "type": "final",
    "format": "multiple",
    "points": 10
  },
  {
    "id": "q-igualdad-2026-1-10",
    "topicId": "tpc-igualdad-2026-1",
    "questionText": "En una entrevista de trabajo, ¿se puede exigir una prueba de embarazo a una candidata?",
    "options": [
      "Sí, si el puesto es en planta",
      "Sí, con su firma",
      "No, está prohibido por la normativa del Ministerio del Trabajo",
      "Solo para puestos administrativos"
    ],
    "correctOptionIndex": 2,
    "type": "final",
    "format": "multiple",
    "points": 10
  },
  {
    "id": "q-igualdad-2026-2-01",
    "topicId": "tpc-igualdad-2026-2",
    "questionText": "¿Cuál es la diferencia entre sexo y género?",
    "options": [
      "Son lo mismo",
      "El sexo es biológico; el género son roles aprendidos socialmente",
      "El género es biológico; el sexo es social",
      "El género solo se refiere a las mujeres"
    ],
    "correctOptionIndex": 1,
    "type": "final",
    "format": "multiple",
    "points": 10
  },
  {
    "id": "q-igualdad-2026-2-02",
    "topicId": "tpc-igualdad-2026-2",
    "questionText": "La igualdad de género significa:",
    "options": [
      "Que las mujeres reciban más beneficios que los hombres",
      "Que mujeres y hombres tengan los mismos derechos, oportunidades y responsabilidades",
      "Que todos hagan exactamente las mismas tareas",
      "Que solo las mujeres reciban capacitación"
    ],
    "correctOptionIndex": 1,
    "type": "final",
    "format": "multiple",
    "points": 10
  },
  {
    "id": "q-igualdad-2026-2-03",
    "topicId": "tpc-igualdad-2026-2",
    "questionText": "\"No promovamos a Ana porque seguro se embaraza.\" Esta frase es un ejemplo de:",
    "options": [
      "Una decisión técnica",
      "Un estereotipo que lleva a una discriminación",
      "Una buena práctica de planificación",
      "Una política de la empresa"
    ],
    "correctOptionIndex": 1,
    "type": "final",
    "format": "multiple",
    "points": 10
  },
  {
    "id": "q-igualdad-2026-2-04",
    "topicId": "tpc-igualdad-2026-2",
    "questionText": "¿Qué artículo de la Constitución prohíbe la discriminación por sexo, identidad de género o estado civil, entre otras razones?",
    "options": [
      "Art. 11, numeral 2",
      "Art. 47",
      "Art. 152",
      "Art. 500"
    ],
    "correctOptionIndex": 0,
    "type": "final",
    "format": "multiple",
    "points": 10
  },
  {
    "id": "q-igualdad-2026-2-05",
    "topicId": "tpc-igualdad-2026-2",
    "questionText": "¿Cuál es la mejor forma de decidir quién ocupa un puesto en planta?",
    "options": [
      "Por su género",
      "Por sus competencias, con la capacitación y el equipo adecuados",
      "Por su edad",
      "Por quién tiene más amigos en el área"
    ],
    "correctOptionIndex": 1,
    "type": "final",
    "format": "multiple",
    "points": 10
  },
  {
    "id": "q-igualdad-2026-2-06",
    "topicId": "tpc-igualdad-2026-2",
    "questionText": "La corresponsabilidad en el cuidado significa:",
    "options": [
      "Que la mamá se encarga del hogar y el papá ayuda",
      "Compartir de forma justa las tareas del hogar y del cuidado",
      "Que la empresa cuida a los hijos de los trabajadores",
      "Que solo los hombres trabajan fuera de casa"
    ],
    "correctOptionIndex": 1,
    "type": "final",
    "format": "multiple",
    "points": 10
  },
  {
    "id": "q-igualdad-2026-2-07",
    "topicId": "tpc-igualdad-2026-2",
    "questionText": "Un compañero pide su licencia de paternidad. ¿Cuál es la actitud correcta?",
    "options": [
      "Burlarse porque eso es cosa de mamás",
      "Respetarlo: es su derecho y su responsabilidad",
      "Decirle que pierde la oportunidad de ascenso",
      "Pedirle que no la use"
    ],
    "correctOptionIndex": 1,
    "type": "final",
    "format": "multiple",
    "points": 10
  },
  {
    "id": "q-igualdad-2026-2-08",
    "topicId": "tpc-igualdad-2026-2",
    "questionText": "El trabajo doméstico y de cuidado no remunerado:",
    "options": [
      "No es trabajo",
      "Es trabajo, y en Ecuador recae mayoritariamente en las mujeres",
      "Solo existe en las ciudades",
      "Lo hace por igual toda la población"
    ],
    "correctOptionIndex": 1,
    "type": "final",
    "format": "multiple",
    "points": 10
  },
  {
    "id": "q-igualdad-2026-2-09",
    "topicId": "tpc-igualdad-2026-2",
    "questionText": "Un sesgo de género en el trabajo es:",
    "options": [
      "Una decisión injusta influida por estereotipos, muchas veces sin darnos cuenta",
      "Una norma de seguridad",
      "Un tipo de contrato",
      "Una evaluación de desempeño objetiva"
    ],
    "correctOptionIndex": 0,
    "type": "final",
    "format": "multiple",
    "points": 10
  },
  {
    "id": "q-igualdad-2026-2-10",
    "topicId": "tpc-igualdad-2026-2",
    "questionText": "¿Cuál de estas acciones promueve la igualdad en el equipo?",
    "options": [
      "Hacer bromas sobre lo que \"no pueden\" hacer las mujeres",
      "Dar las mismas oportunidades de capacitación y ascenso",
      "Asignar las tareas según el género",
      "Excluir de las reuniones a quien tiene hijos pequeños"
    ],
    "correctOptionIndex": 1,
    "type": "final",
    "format": "multiple",
    "points": 10
  },
  {
    "id": "q-igualdad-2026-3-01",
    "topicId": "tpc-igualdad-2026-3",
    "questionText": "\"Con la igualdad salarial, todos vamos a ganar lo mismo.\" Esto es:",
    "options": [
      "Realidad",
      "Mito: significa igual pago por trabajo de igual valor",
      "Realidad solo en planta",
      "Realidad desde 2026"
    ],
    "correctOptionIndex": 1,
    "type": "final",
    "format": "multiple",
    "points": 10
  },
  {
    "id": "q-igualdad-2026-3-02",
    "topicId": "tpc-igualdad-2026-3",
    "questionText": "¿Cuál de estas razones JUSTIFICA una diferencia de sueldo?",
    "options": [
      "Ser hombre",
      "Estar embarazada",
      "Tener un cargo con mayor responsabilidad",
      "La edad de la persona"
    ],
    "correctOptionIndex": 2,
    "type": "final",
    "format": "multiple",
    "points": 10
  },
  {
    "id": "q-igualdad-2026-3-03",
    "topicId": "tpc-igualdad-2026-3",
    "questionText": "¿Cuál de estas razones NO puede justificar que alguien gane menos?",
    "options": [
      "Menor antigüedad",
      "Un cargo de menor responsabilidad",
      "Tener una discapacidad",
      "Haber trabajado menos horas extra"
    ],
    "correctOptionIndex": 2,
    "type": "final",
    "format": "multiple",
    "points": 10
  },
  {
    "id": "q-igualdad-2026-3-04",
    "topicId": "tpc-igualdad-2026-3",
    "questionText": "Dos puestos distintos pueden ser de \"igual valor\" cuando:",
    "options": [
      "Tienen el mismo nombre",
      "Exigen un nivel similar de competencias, esfuerzo, responsabilidad y condiciones",
      "Los ocupan personas del mismo sexo",
      "Están en la misma área"
    ],
    "correctOptionIndex": 1,
    "type": "final",
    "format": "multiple",
    "points": 10
  },
  {
    "id": "q-igualdad-2026-3-05",
    "topicId": "tpc-igualdad-2026-3",
    "questionText": "¿Qué artículo del Código del Trabajo establece la igualdad de remuneración?",
    "options": [
      "Art. 47",
      "Art. 79",
      "Art. 152",
      "Art. 195.1"
    ],
    "correctOptionIndex": 1,
    "type": "final",
    "format": "multiple",
    "points": 10
  },
  {
    "id": "q-igualdad-2026-3-06",
    "topicId": "tpc-igualdad-2026-3",
    "questionText": "Escuchas que un compañero gana más que tú. ¿Qué es lo más adecuado?",
    "options": [
      "Concluir que hay discriminación",
      "Consultar con Recursos Humanos los criterios de tu remuneración",
      "Dejar de trabajar",
      "Publicarlo en redes sociales"
    ],
    "correctOptionIndex": 1,
    "type": "final",
    "format": "multiple",
    "points": 10
  },
  {
    "id": "q-igualdad-2026-3-07",
    "topicId": "tpc-igualdad-2026-3",
    "questionText": "¿Cuántas horas anuales de capacitación en igualdad exige como mínimo el Acuerdo MDT-2025-006?",
    "options": [
      "10 horas",
      "20 horas",
      "40 horas",
      "100 horas"
    ],
    "correctOptionIndex": 2,
    "type": "final",
    "format": "multiple",
    "points": 10
  },
  {
    "id": "q-igualdad-2026-3-08",
    "topicId": "tpc-igualdad-2026-3",
    "questionText": "¿A quién debe dirigirse esta capacitación según la normativa?",
    "options": [
      "Solo a las mujeres",
      "Solo a los jefes",
      "A todas las personas trabajadoras, con participación de las máximas autoridades",
      "Solo al personal nuevo"
    ],
    "correctOptionIndex": 2,
    "type": "final",
    "format": "multiple",
    "points": 10
  },
  {
    "id": "q-igualdad-2026-3-09",
    "topicId": "tpc-igualdad-2026-3",
    "questionText": "Negar un ascenso a una trabajadora porque tiene hijos pequeños es:",
    "options": [
      "Una decisión de negocio válida",
      "Una discriminación prohibida",
      "Legal si se le explica",
      "Correcto si ella está de acuerdo"
    ],
    "correctOptionIndex": 1,
    "type": "final",
    "format": "multiple",
    "points": 10
  },
  {
    "id": "q-igualdad-2026-3-10",
    "topicId": "tpc-igualdad-2026-3",
    "questionText": "¿Qué convenio de la OIT trata la igualdad de remuneración?",
    "options": [
      "Convenio 100",
      "Convenio 1",
      "Convenio 300",
      "No existe ninguno"
    ],
    "correctOptionIndex": 0,
    "type": "final",
    "format": "multiple",
    "points": 10
  },
  {
    "id": "q-igualdad-2026-4-01",
    "topicId": "tpc-igualdad-2026-4",
    "questionText": "Según el Código del Trabajo, el acoso laboral se caracteriza por ser:",
    "options": [
      "Un hecho aislado sin importancia",
      "Un comportamiento reiterado que atenta contra la dignidad de la persona",
      "Una evaluación de desempeño negativa",
      "Una orden de trabajo normal"
    ],
    "correctOptionIndex": 1,
    "type": "final",
    "format": "multiple",
    "points": 10
  },
  {
    "id": "q-igualdad-2026-4-02",
    "topicId": "tpc-igualdad-2026-4",
    "questionText": "¿Quién puede ejercer acoso laboral?",
    "options": [
      "Solo los jefes",
      "Solo los compañeros",
      "Un jefe, un compañero o incluso un subordinado",
      "Solo personas externas"
    ],
    "correctOptionIndex": 2,
    "type": "final",
    "format": "multiple",
    "points": 10
  },
  {
    "id": "q-igualdad-2026-4-03",
    "topicId": "tpc-igualdad-2026-4",
    "questionText": "Un comentario de naturaleza sexual no deseado por la otra persona es:",
    "options": [
      "Un cumplido",
      "Acoso sexual, que además es un delito",
      "Algo normal en planta",
      "Una broma sin consecuencias"
    ],
    "correctOptionIndex": 1,
    "type": "final",
    "format": "multiple",
    "points": 10
  },
  {
    "id": "q-igualdad-2026-4-04",
    "topicId": "tpc-igualdad-2026-4",
    "questionText": "En el semáforo del respeto, los apodos ofensivos repetidos son:",
    "options": [
      "Luz verde",
      "Luz amarilla",
      "Luz roja: acoso o discriminación",
      "No aplica"
    ],
    "correctOptionIndex": 2,
    "type": "final",
    "format": "multiple",
    "points": 10
  },
  {
    "id": "q-igualdad-2026-4-05",
    "topicId": "tpc-igualdad-2026-4",
    "questionText": "¿Quién define si una broma es ofensiva?",
    "options": [
      "Quien la hace",
      "La mayoría del grupo",
      "Quien la recibe",
      "El supervisor"
    ],
    "correctOptionIndex": 2,
    "type": "final",
    "format": "multiple",
    "points": 10
  },
  {
    "id": "q-igualdad-2026-4-06",
    "topicId": "tpc-igualdad-2026-4",
    "questionText": "Un compañero hace comentarios sobre el cuerpo de una compañera y ella se incomoda. Lo correcto es:",
    "options": [
      "Reírse para no quedar mal",
      "Detenerse: es luz amarilla y puede llegar a ser acoso",
      "Ignorarlo",
      "Grabarlo y publicarlo"
    ],
    "correctOptionIndex": 1,
    "type": "final",
    "format": "multiple",
    "points": 10
  },
  {
    "id": "q-igualdad-2026-4-07",
    "topicId": "tpc-igualdad-2026-4",
    "questionText": "Si reportas un caso de acoso de buena fe:",
    "options": [
      "Te pueden despedir",
      "Nadie puede tomar represalias contra ti",
      "Debes renunciar a tu puesto",
      "Pierdes tus vacaciones"
    ],
    "correctOptionIndex": 1,
    "type": "final",
    "format": "multiple",
    "points": 10
  },
  {
    "id": "q-igualdad-2026-4-08",
    "topicId": "tpc-igualdad-2026-4",
    "questionText": "En FUNDAMETZ, ¿a dónde puedes acudir para reportar un caso de acoso o discriminación?",
    "options": [
      "Solo a tus compañeros",
      "A Recursos Humanos, y al área médica si necesitas apoyo de salud",
      "A redes sociales",
      "A nadie"
    ],
    "correctOptionIndex": 1,
    "type": "final",
    "format": "multiple",
    "points": 10
  },
  {
    "id": "q-igualdad-2026-4-09",
    "topicId": "tpc-igualdad-2026-4",
    "questionText": "¿Qué convenio de la OIT trata la violencia y el acoso en el mundo del trabajo?",
    "options": [
      "Convenio 190",
      "Convenio 100",
      "Convenio 29",
      "Convenio 1"
    ],
    "correctOptionIndex": 0,
    "type": "final",
    "format": "multiple",
    "points": 10
  },
  {
    "id": "q-igualdad-2026-4-10",
    "topicId": "tpc-igualdad-2026-4",
    "questionText": "Excluir a un compañero de las actividades del equipo por su origen étnico es:",
    "options": [
      "Discriminación prohibida por la Constitución",
      "Una decisión de equipo válida",
      "Aceptable si es temporal",
      "Una broma"
    ],
    "correctOptionIndex": 0,
    "type": "final",
    "format": "multiple",
    "points": 10
  },
  {
    "id": "q-igualdad-2026-5-01",
    "topicId": "tpc-igualdad-2026-5",
    "questionText": "¿Qué porcentaje mínimo de personas con discapacidad deben contratar las empresas con 25 o más trabajadores?",
    "options": [
      "1 %",
      "4 %",
      "10 %",
      "No hay obligación"
    ],
    "correctOptionIndex": 1,
    "type": "final",
    "format": "multiple",
    "points": 10
  },
  {
    "id": "q-igualdad-2026-5-02",
    "topicId": "tpc-igualdad-2026-5",
    "questionText": "\"Contratar personas con discapacidad es quitarle el puesto a otro.\" Esto es:",
    "options": [
      "Realidad",
      "Mito: cada persona ocupa su puesto porque puede hacer el trabajo",
      "Realidad solo en planta",
      "Depende del área"
    ],
    "correctOptionIndex": 1,
    "type": "final",
    "format": "multiple",
    "points": 10
  },
  {
    "id": "q-igualdad-2026-5-03",
    "topicId": "tpc-igualdad-2026-5",
    "questionText": "¿Qué es un ajuste razonable?",
    "options": [
      "Bajar el sueldo",
      "Adaptar el puesto, el horario o las herramientas para trabajar en igualdad de condiciones",
      "Cambiar a la persona de empresa",
      "Darle menos tareas sin consultarle"
    ],
    "correctOptionIndex": 1,
    "type": "final",
    "format": "multiple",
    "points": 10
  },
  {
    "id": "q-igualdad-2026-5-04",
    "topicId": "tpc-igualdad-2026-5",
    "questionText": "¿Cuál es el término adecuado?",
    "options": [
      "Inválido",
      "Minusválido",
      "Persona con discapacidad",
      "Discapacitadito"
    ],
    "correctOptionIndex": 2,
    "type": "final",
    "format": "multiple",
    "points": 10
  },
  {
    "id": "q-igualdad-2026-5-05",
    "topicId": "tpc-igualdad-2026-5",
    "questionText": "Antes de ayudar a una persona con discapacidad, lo correcto es:",
    "options": [
      "Ayudarla sin preguntar",
      "Preguntarle si necesita ayuda y cómo",
      "Hablar con su acompañante",
      "Ignorarla"
    ],
    "correctOptionIndex": 1,
    "type": "final",
    "format": "multiple",
    "points": 10
  },
  {
    "id": "q-igualdad-2026-5-06",
    "topicId": "tpc-igualdad-2026-5",
    "questionText": "\"A esa edad ya no conviene capacitarlo.\" Esta frase es:",
    "options": [
      "Una buena decisión de negocio",
      "Un prejuicio por edad, prohibido como causa de discriminación",
      "Una política de seguridad",
      "Una regla del IESS"
    ],
    "correctOptionIndex": 1,
    "type": "final",
    "format": "multiple",
    "points": 10
  },
  {
    "id": "q-igualdad-2026-5-07",
    "topicId": "tpc-igualdad-2026-5",
    "questionText": "La mentoría en ambas direcciones significa:",
    "options": [
      "Que solo los mayores enseñan",
      "Que la experiencia y las nuevas competencias se comparten entre generaciones",
      "Que solo los jóvenes enseñan",
      "Que no hay que enseñar"
    ],
    "correctOptionIndex": 1,
    "type": "final",
    "format": "multiple",
    "points": 10
  },
  {
    "id": "q-igualdad-2026-5-08",
    "topicId": "tpc-igualdad-2026-5",
    "questionText": "¿Cuál es un ejemplo de hablar de hechos y no de personas?",
    "options": [
      "Eres un descuidado",
      "Siempre haces todo mal",
      "La máquina quedó sin limpiar al cambio de turno",
      "Contigo no se puede"
    ],
    "correctOptionIndex": 2,
    "type": "final",
    "format": "multiple",
    "points": 10
  },
  {
    "id": "q-igualdad-2026-5-09",
    "topicId": "tpc-igualdad-2026-5",
    "questionText": "En un desacuerdo con un compañero, el primer paso recomendado es:",
    "options": [
      "Gritar para que te escuche",
      "Tomar un momento para calmarte antes de responder",
      "Ir directamente a redes sociales",
      "Dejar de hablarle"
    ],
    "correctOptionIndex": 1,
    "type": "final",
    "format": "multiple",
    "points": 10
  },
  {
    "id": "q-igualdad-2026-5-10",
    "topicId": "tpc-igualdad-2026-5",
    "questionText": "La escucha activa consiste en:",
    "options": [
      "Interrumpir para dar tu opinión",
      "Prestar atención, no interrumpir y confirmar lo que entendiste",
      "Mirar el celular mientras hablan",
      "Responder antes de que terminen"
    ],
    "correctOptionIndex": 1,
    "type": "final",
    "format": "multiple",
    "points": 10
  }
];

const act = (id: string, titulo: string, consigna: string, criterios: string): ActividadPractica => ({ id, titulo, consigna, criterios, puntos: 20 });

const ACTIVIDADES: Record<string, ActividadPractica[]> = {
  "tpc-igualdad-2026-1": [
    act("act-ig-1-1", "Mis derechos en la práctica", "Elige dos derechos laborales de la lección (por ejemplo, vacaciones, horas extra o afiliación al IESS) y explica con un ejemplo de tu área cómo se aplican en tu trabajo diario.", "Identifica correctamente dos derechos y los relaciona con una situación real de su área."),
    act("act-ig-1-2", "Caso: licencia de paternidad", "Un compañero de tu turno acaba de ser papá y algunos bromean diciendo que \"eso es cosa de mamás\". ¿Qué derechos tiene él según el Código del Trabajo y cómo responderías tú a esos comentarios?", "Menciona la licencia de paternidad y responde con respeto y argumentos."),
  ],
  "tpc-igualdad-2026-2": [
    act("act-ig-2-1", "Detecta el estereotipo", "Escribe una frase que hayas escuchado en el trabajo y que contenga un estereotipo de género. Explica por qué es un estereotipo y cómo se podría decir de forma respetuosa.", "Reconoce el estereotipo y propone una alternativa respetuosa."),
    act("act-ig-2-2", "Corresponsabilidad en casa", "Describe cómo se reparten las tareas de cuidado en tu hogar (sin datos personales sensibles) y propone una acción concreta para que la distribución sea más justa.", "Reflexiona sobre la carga de cuidado y propone una acción concreta."),
  ],
  "tpc-igualdad-2026-3": [
    act("act-ig-3-1", "¿Diferencia justa o discriminación?", "Dos operadores del mismo puesto ganan distinto: uno tiene 8 años en la empresa y el otro 1 año. En otra área, a una trabajadora se le negó un bono por estar embarazada. Analiza ambos casos.", "Distingue la diferencia objetiva (antigüedad) de la discriminatoria (embarazo)."),
    act("act-ig-3-2", "Trabajo de igual valor", "Elige dos puestos distintos de Fundametz y compáralos según competencias, esfuerzo, responsabilidad y condiciones de trabajo. ¿Podrían ser de igual valor? Justifica.", "Usa los cuatro factores de valoración para justificar su respuesta."),
  ],
  "tpc-igualdad-2026-4": [
    act("act-ig-4-1", "El semáforo del respeto", "Escribe un ejemplo de comentario para cada color del semáforo (verde, amarillo y rojo) que podría darse en la planta o la oficina, y explica tu clasificación.", "Clasifica correctamente los tres ejemplos y justifica cada uno."),
    act("act-ig-4-2", "Ruta de denuncia", "Una compañera te cuenta que un supervisor le hace comentarios sexuales a diario. Describe paso a paso qué le aconsejarías hacer y qué garantías tiene al denunciar.", "Describe la ruta (Recursos Humanos, área médica, Ministerio) y menciona confidencialidad y no represalias."),
  ],
  "tpc-igualdad-2026-5": [
    act("act-ig-5-1", "Ajustes razonables", "Un nuevo compañero con discapacidad auditiva se integra a tu área. Propón tres ajustes razonables o prácticas para que pueda trabajar en igualdad de condiciones y con seguridad.", "Propone tres ajustes concretos, viables y respetuosos."),
    act("act-ig-5-2", "Comunicación respetuosa", "Recuerda un desacuerdo en el trabajo (sin nombres). Reescribe cómo lo manejarías usando escucha activa y hablando de hechos y no de personas.", "Aplica escucha activa y lenguaje centrado en hechos."),
  ],
};

const EJEMPLOS: Record<string, string> = {
  "mat-igualdad-2026-1-1": "Un operador del turno de la noche no recibió el recargo de sus horas extraordinarias del fin de semana. Lo correcto es revisar su rol de pagos y su registro de asistencia y consultar a Recursos Humanos, que debe corregir el pago si corresponde.",
  "mat-igualdad-2026-2-1": "En la planta de refinación se abre una vacante de operador de montacargas. Una trabajadora de bodega tiene la licencia y la experiencia requeridas. La decisión debe basarse en sus competencias, no en la idea de que \"ese trabajo es de hombres\".",
  "mat-igualdad-2026-3-1": "Dos analistas de calidad, una mujer y un hombre, tienen el mismo cargo, antigüedad y funciones. Si ella gana menos sin una razón objetiva, existe una discriminación salarial que Recursos Humanos debe corregir.",
  "mat-igualdad-2026-4-1": "En mantenimiento, un grupo pone apodos ofensivos a un compañero por su acento. Aunque lo llamen \"broma\", si es reiterado y lo afecta, es acoso laboral: hay que detenerlo y reportarlo.",
  "mat-igualdad-2026-5-1": "Un técnico con 25 años de experiencia y una practicante recién graduada trabajan juntos: él enseña el ajuste de equipos y ella le muestra cómo registrar las órdenes de trabajo en el sistema. Ambos aprenden.",
};
