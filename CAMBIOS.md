# Aula Virtual Fundametz · Funciones agregadas (versión con cumplimiento MDT)

Esta versión conserva todo lo que ya tenía el Aula Virtual (cursos, materiales, evaluaciones
inicial y final, buzón, calendario, plantillas de certificado, control de capacitaciones y
seguimiento) y **agrega** las funciones que le faltaban para cumplir el Acuerdo Ministerial
**MDT-2025-006** (40 horas anuales en igualdad) y la **LOPDP**.

## Pasos para actualizar
1. `npm install` (se agregaron `exceljs` y `qrcode`).
2. En Supabase → SQL Editor, ejecuta **`supabase_extension_mdt.sql`** (no borra datos y se puede ejecutar varias veces).
3. Ingresa como administrador. La primera vez el sistema pedirá **reemplazar la clave 2026** por una contraseña personal y aceptar el aviso de privacidad.
4. Ve a **Cumplimiento MDT → Cargar curso (40 h)** para cargar el curso de Igualdad 2026.

Si no se ejecuta el SQL, la app sigue funcionando y guarda los datos nuevos en el navegador, pero muestra un aviso.

## Funciones nuevas

### Seguridad de cuentas
- Las contraseñas se guardan **cifradas** (SHA-256 con sal). Ya no se muestran en la lista de cuentas.
- Las claves antiguas en texto plano funcionan **una sola vez** y obligan a crear una nueva.
- Las cuentas nuevas reciben una **clave temporal aleatoria**, que se ve una sola vez, y se exige el **cambio en el primer ingreso**.
- La acción **Clave** en Gestión de Cuentas restablece la contraseña con una clave temporal.
- Los colaboradores pueden **cambiar su contraseña** desde su perfil.
- Se **valida la cédula** ecuatoriana y se bloquea temporalmente el acceso tras 5 intentos fallidos.
- Se retiró el recuadro de "Acceso rápido de prueba", que mostraba las claves en la pantalla de inicio.

### LOPDP
- **Aviso de privacidad** obligatorio en el primer ingreso, con registro de fecha y versión.
- **Bitácora de auditoría**: inicios de sesión, cambios de clave, altas, bajas, importaciones, exportaciones y certificados. No se puede editar ni borrar.

### Cumplimiento MDT-2025-006 (pestaña "Cumplimiento MDT")
- Cada curso puede **acreditar horas**, tener un **eje temático** y un **tiempo mínimo de estudio**. Se configura en el formulario del curso.
- Horas por colaborador: virtuales + presenciales sobre la meta de 40 h, con avance **por área y por sexo**.
- Alertas cuando las **máximas autoridades** no completan la capacitación o falta cubrir algún eje.
- **Curso de Igualdad 2026 precargado**: 5 cursos de 8 h, 14 lecturas y 50 preguntas.
- **Excel de evidencias MDT** con 6 hojas: resumen por persona, área y sexo, tiempo diario de estudio, evaluaciones, asistencia presencial y plan de contenidos.

### Capacitaciones presenciales (pestaña "Presenciales")
- Registro de talleres y charlas con **lista de asistencia**. Las horas se suman al plan de cada asistente.

### Colaborador
- **Tiempo efectivo de estudio**: se registra cada minuto mientras el material está abierto y hay actividad, y se ve un indicador en pantalla.
- Tarjeta **"Mi plan de 40 horas"** con el avance y el siguiente paso.
- **Certificado anual de 40 horas** cuando se completa el plan.
- Todos los certificados llevan un **código único y QR**. Cualquiera puede verificarlos en `?verificar=CÓDIGO`.
- Las lecturas se muestran **con formato**: títulos, negritas, listas y destacados.

### Importación masiva
- En **Gestión de Cuentas → Importar Excel**: plantilla, vista previa con validación, creación de cuentas y listado de claves temporales para entregar.

### Funciones del aula para colaboradores (agregadas en la versión 3)
- **Actividades prácticas escritas** por curso (por ejemplo 2 de 20 puntos). La persona escribe su respuesta, la envía y puede editarla. Recursos Humanos las revisa en la pestaña **Actividades**, ajusta el puntaje y deja un comentario.
- **Nota del módulo sobre 100**: actividades + prueba final escalada al resto (40 + 60), con nota mínima configurable (70 por defecto). Las actividades deben enviarse antes de la prueba final.
- **Video principal obligatorio** (opcional por curso): el primer video bloquea lecturas, actividades y prueba hasta completarse.
- **Material de apoyo por lección**: PDF y archivos de Google Drive con vista previa en pantalla y enlaces a normativa oficial. Se cargan en el formulario del material como `Título | URL`.
- **Recuadros "Ejemplo práctico en planta"** en las lecturas: escriba `> **Ejemplo práctico en planta:** texto`.
- **Objetivo y planificación sugerida** al inicio de cada curso.
- **Guía de bienvenida** que se abre en el primer ingreso: 6 pasos, preguntas frecuentes, uso en celular y computadora, y opción "no volver a mostrar".
- **Recorrido en pantalla** que resalta las partes del tablero paso a paso.
- **Confirmación de nombres** antes de emitir cualquier certificado, con opción de corregirlos. El nombre queda guardado. Se puede **descargar o abrir listo para imprimir**.
- Si el colaborador **no aprueba**, la revisión muestra qué preguntas falló **sin revelar la respuesta correcta**. Se revela al aprobar o al agotar los intentos.
- El curso de Igualdad 2026 ahora incluye **10 actividades prácticas**, ejemplos en planta y un enlace oficial. Si ya lo había cargado, use **Cumplimiento MDT → Actualizarlo ahora**.

Lo que **no** se copió del aula de Dacar a propósito: la descarga de certificados ingresando solo el número de cédula (permite bajar el certificado de otra persona), la contraseña inicial igual a la cédula y los nombres de usuario inventados. Esta versión usa claves temporales, verificación por código/QR y la cédula como usuario.

## Versión 10 — El trabajador crea su nueva clave tras el restablecimiento
- Al pulsar **Restablecer clave**, el administrador elige entre dos opciones:
  1. **Que el trabajador cree su nueva clave** (recomendado): en su próximo ingreso escribe su cédula, pulsa **Ingresar** (sin contraseña) y el Aula le muestra «Crea tu nueva contraseña». No hay que entregarle nada. Vale por **24 horas** y se usa una sola vez.
  2. **Entregarle una clave temporal**: el flujo anterior (copiar o enviar por WhatsApp).
- Verificación: si el trabajador registró su celular, debe escribir los **últimos 4 dígitos** para confirmar que es él (máximo 5 intentos).
- La cuenta, el avance, las notas, el tiempo de estudio y los certificados se conservan. La clave anterior deja de funcionar al crear la nueva.
- En la lista de cuentas se ve «Puede crear clave nueva hasta…». Auditoría: `usuario.cambio_clave_habilitado` y `usuario.clave_creada`.
- Base de datos: columna `cambio_clave_hasta` en `profiles` (incluida en `supabase_actualizacion.sql`).

## Versión 9 — Recuperar la clave sin perder la cuenta
- En la pantalla de inicio, **¿Olvidaste tu contraseña?** abre «Recupera tu acceso»: el colaborador escribe su cédula y pulsa **Pedir clave nueva**. El mensaje es el mismo exista o no la cédula (no revela quién está registrado).
- En **Gestión de Cuentas → Solicitudes** aparece «Olvidaron su clave» con el botón **Generar clave temporal** (o **Descartar**). La pestaña cuenta estos pedidos junto con las cuentas nuevas. En la lista de cuentas la persona aparece con la etiqueta «Pidió clave nueva».
- El botón de cada cuenta ahora dice **Restablecer clave** y explica que **la cuenta, el avance, las notas, el tiempo de estudio y los certificados se conservan**: solo se reemplaza la clave.
- La clave temporal se muestra una vez, se puede copiar y, si la persona registró su celular, enviar por **WhatsApp** con un mensaje listo. Al ingresar con ella, el colaborador crea su nueva contraseña.
- Auditoría: `usuario.solicitud_clave`, `usuario.clave_restablecida` (indica si fue a pedido del colaborador) y `usuario.solicitud_clave_descartada`.
- Base de datos: columna `solicitud_clave_at` en `profiles`. Para bases ya instaladas: `supabase_actualizacion.sql` (incluye también las columnas de la versión 8).

## Autorización de tratamiento de datos personales (presentación mejorada)
- Nueva pantalla «Tus datos personales» en el primer ingreso y tarjeta de autorización en «Crear mi cuenta».
- **Lo esencial en tres puntos** (para qué, quién los ve, tus derechos) y el **documento completo en 10 secciones numeradas** con íconos: responsable, finalidades, datos tratados, registro del tiempo de estudio, base legal, quién accede, protección, conservación, derechos (acceso, rectificación, eliminación, oposición, portabilidad, suspensión) y reclamo ante la Superintendencia de Protección de Datos Personales.
- Casilla personalizada: «Yo, *nombre*, con cédula *número*, autorizo a FUNDAMETZ S.A.…», con la fecha. En el registro, el documento se abre en una ventana con el botón «He leído y autorizo».
- Archivo nuevo: `src/components/extras/AutorizacionDatos.tsx`.

## Versión 8 — Los colaboradores crean su propia cuenta (con aprobación de RR. HH.)
- En la pantalla de inicio hay un botón **Crear mi cuenta**. El colaborador llena cédula (validada), nombres, apellidos, sexo (Hombre o Mujer), área, y de forma opcional celular y correo; crea su contraseña y acepta el aviso de privacidad.
- **Sexo:** el Acuerdo MDT-2025-006 no pide datos de los participantes desagregados por sexo en su reporte (art. 5); el dato se usa para las estadísticas internas de igualdad. Los reportes muestran «No indicado» para cuentas antiguas sin el dato. Se quitó el campo «Cargo».
- La cuenta queda **pendiente** e inactiva. Si intenta ingresar antes de la aprobación, ve «Tu cuenta está esperando la aprobación de Recursos Humanos» (solo después de escribir bien su contraseña, para no revelar qué cédulas existen).
- **Gestión de Cuentas → Solicitudes de cuenta**: RR. HH. ve los datos y pulsa **Aprobar** o **Rechazar** (con motivo opcional, que se le muestra al colaborador). La pestaña muestra cuántas solicitudes esperan. «Buscar nuevas» trae las solicitudes hechas desde otros dispositivos.
- No se puede pedir una cuenta con una cédula ya registrada o con una solicitud en curso.
- Al aprobarla, el colaborador entra con su propia contraseña, sin clave temporal. Todo queda en la auditoría (`cuenta.solicitada`, `cuenta.aprobada`, `cuenta.rechazada`).
- Base de datos: 8 columnas nuevas en `profiles` (`estado_cuenta`, `cargo`, `telefono`, `correo`, `solicitado_at`, `revisado_por`, `revisado_at`, `motivo_rechazo`), incluidas en `supabase_instalacion.sql`.

## Publicación para usar desde cualquier dispositivo
- `supabase_instalacion.sql`: instalación completa en un solo archivo (tablas base + cumplimiento MDT). **No borra datos** y se puede volver a ejecutar. Crea la cuenta del administrador con la contraseña que usted escriba (reemplace `CAMBIE_ESTA_CLAVE`), para que nadie pueda entrar con la clave inicial.
- `public/config.js`: la conexión con Supabase se puede escribir aquí **sin volver a compilar** (útil para subir la carpeta lista a Netlify u otro hosting). Si se definen `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` al compilar (Vercel/Netlify con GitHub), esas tienen prioridad.
- App instalable: `manifest.webmanifest` e íconos para «Agregar a pantalla de inicio» en Android y iPhone.
- **Pendiente importante de seguridad:** las políticas de Supabase permiten leer y escribir con la clave pública. Antes de registrar a todo el personal conviene migrar a Supabase Auth con permisos por usuario.

## Versión 7 — Lecciones en cápsulas y «Escuchar la lección»
**Microaprendizaje**
- Cada lectura se divide sola en **cápsulas cortas** (≈ una pantalla de celular, 1–2 min) usando los títulos `## `. Arriba se ve «Cápsula 2 de 3 · ≈ 1 min», una barra de avance por cápsula y el tiempo que queda.
- Al final de cada lectura hay una **pregunta rápida** («Comprueba lo aprendido») con respuesta inmediata y explicación. Hay que responderla para terminar la lectura. No afecta la nota.
- El botón para completar la lectura se habilita cuando se recorrieron todas las cápsulas. El avance se recuerda: al volver, el colaborador sigue donde se quedó.
- El curso de Igualdad 2026 ya trae 14 preguntas rápidas (una por lectura). Si ya estaba cargado, use **Cumplimiento MDT → Actualizarlo ahora**.
- El administrador puede escribir sus propias preguntas en el texto de la lectura (ayuda dentro del formulario del material):
  ```
  ?? ¿Pregunta?
  [ ] Opción incorrecta
  [x] Opción correcta
  >> Explicación (opcional)
  ```

**Escuchar la lección**
- Botón **Escuchar** en cada cápsula: lee el texto en voz alta con la voz en español del dispositivo, con **Pausar / Continuar / Detener**, velocidad **Lenta / Normal / Rápida** (se recuerda) y **subtítulo** con la frase que se está leyendo.
- Lee «Art.» como «artículo» y «%» como «por ciento».

Archivos: `src/components/extras/LecturaCapsulas.tsx` y `src/lib/voz.ts` (nuevos); cambios en `UserDashboard.tsx`, `AdminDashboard.tsx` y `cursoIgualdad.ts`.

## Versión 6 — Renovación estética moderna
- **Tipografía Inter**, paleta azul moderna (`#2563EB`), fondos blancos y gris muy claro, esquinas redondeadas (12–16 px) y sombras suaves.
- **Inicio de sesión dividido:** panel de marca azul con los beneficios del aula a la izquierda y formulario amplio a la derecha (en celular, solo el formulario con el logo).
- **Menú lateral y barra inferior blancos**, con la opción activa marcada como pastilla azul. Encabezados de ventanas blancos.
- **Tablero:** saludo personal según la hora, **anillo de progreso** del plan de 40 h con chips de cursos, horas presenciales y tiempo de estudio, y tarjeta **«Continuar curso»** con el siguiente paso.
- **Tarjetas de curso** con portada de color e ícono propio por módulo, estados como chips suaves (Aprobado, En curso, No iniciado, Reprobado) y barra de avance redondeada; se elevan al pasar el mouse.
- Pruebas de funciones repetidas sin errores (ingreso, carga del curso, actividades, bloqueo de la prueba, revisión, certificado y recorrido guiado) en celular, tablet y computadora.

## Versión 5 — Diseño corporativo claro y uso en celular y tablet
**Estilo visual unificado**
- Una sola paleta: azul corporativo `#0B5CAD`, azul marino `#0B2F55` (menú y encabezados), grises neutros y verde solo para aprobado/éxito. Se reemplazaron los morados, índigos y verdes chillones, y los brillos de color en las sombras.
- Botones con texto normal (sin MAYÚSCULAS ni letra de máquina de escribir), esquinas redondeadas iguales en toda la app, títulos rectos (sin cursiva) y foco visible al navegar con teclado.
- Tarjetas de curso con franja de color discreta.
- Los mensajes ya no usan las ventanas del navegador (`alert`): aparecen avisos de color arriba a la derecha (o arriba en el celular), que se cierran solos. Se rediseñó también el aviso del panel de administración, que antes decía «[ALERTA]: …».

**Celular y tablet**
- En el celular, todas las ventanas suben desde abajo como una hoja que ocupa el ancho, con su manija y su desplazamiento propio.
- Botones e íconos de al menos 40 px en pantallas táctiles, y el toque responde sin retraso.
- Los campos usan letra de 16 px para que el iPhone no haga zoom al escribir.
- Las pestañas de cursos se deslizan con el dedo.
- La barra inferior respeta la zona del iPhone (`viewport-fit=cover`) y hay color de barra del navegador (`theme-color`).
- Revisado en celular (390 px), tablet (820 px) y computadora (1366 px).

**Experiencia de uso**
- En el curso, las actividades prácticas se abren solas cuando terminas las lecturas; antes se muestra «Recomendado al terminar las lecturas».
- Pruebas de funciones repetidas sin errores: ingreso, carga del curso de 40 h, todas las pestañas del administrador, actividades, bloqueo de la prueba, revisión sin revelar respuestas, nombre del certificado, certificado con QR y tutorial interactivo.

Cambios técnicos: `src/index.css` (sistema visual y reglas para celular), `index.html` (viewport y color de barra), `extras/ui.tsx` (`notificar()` y `<Notificaciones/>`), `App.tsx`, `PanelModulo.tsx`, y ajustes de clases en `UserDashboard.tsx`, `AdminDashboard.tsx` y las pantallas de `extras/`.

## Recorrido guiado (reemplaza el tutorial tipo videojuego de la versión 4)
- Al primer ingreso se abre un **recorrido de 6 pasos** con estilo corporativo: un borde azul resalta cada zona y una nota explica para qué sirve, con «Paso n de 6», **Atrás** y **Siguiente**. Sin puntos, medallas ni personajes.
- Pasos: bienvenida → plan de 40 h → pestañas de cursos → abrir un curso → objetivo, nota y actividades → evaluación final.
- **No bloquea:** en algunos pasos invita a probar («Pruébalo: toca Pendientes»), pero siempre se puede seguir con Siguiente. En el paso del curso, Siguiente lo abre automáticamente.
- En celular, la explicación aparece abajo a todo el ancho y la zona resaltada se ubica arriba.
- **Voz opcional:** botón «Escuchar» dentro de la nota, apagado por defecto; recuerda la elección. Si se agregan audios grabados en `public/tour/` (ver `guion_tour.txt` y `manifest.json`), se usan en lugar de la voz del navegador.
- Se repite con el botón **Recorrido guiado** del Tablero o desde la Guía de uso. Al terminar queda en Auditoría.

## Corrección importante
La versión anterior **borraba todos los datos locales** al recargar la página si había más de un
usuario guardado (una limpieza de datos de demostración mal configurada). Ahora solo se borran los
datos de demostración originales.

## Siguiente paso recomendado (seguridad)
Las políticas del esquema original permiten que cualquiera con la clave pública de Supabase lea
y modifique las tablas. Las contraseñas ya no se pueden leer porque están cifradas, pero los demás
datos sí. Para datos reales de trabajadores conviene migrar a **Supabase Auth** con políticas por
usuario. Ese cambio afecta la forma en que la app carga los datos y se recomienda hacerlo como
una fase aparte.

## Archivos nuevos
```
supabase_extension_mdt.sql          columnas y tablas nuevas
src/lib/seguridad.ts                cifrado, claves temporales, cédula
src/lib/extras.tsx                  datos nuevos (Supabase + respaldo local)
src/lib/cumplimiento.ts             cálculo de horas acreditadas
src/lib/cursoIgualdad.ts            curso de Igualdad 2026
src/lib/certificadoExtras.ts        QR, código y certificado de 40 h
src/lib/excel.ts, markdown.tsx      Excel y lecturas con formato
src/hooks/useLatido.ts              tiempo efectivo de estudio
src/components/extras/              pantallas nuevas (guía, tour, actividades, recursos, cumplimiento…)
```
Archivos modificados: `App.tsx`, `Login.tsx`, `AdminDashboard.tsx`, `UserDashboard.tsx`, `types.ts`, `supabaseService.ts`.

## v11 — Solicitudes en el menú y aviso de clave lista
- Nuevo menú **Solicitudes** (barra lateral, menú móvil y campana del encabezado) con contador: claves olvidadas + cuentas nuevas por aprobar. Aviso en el Tablero cuando hay pendientes.
- El colaborador que pide clave nueva ve los pasos (esperar → consultar → crear clave) y una tarjeta «Tu pedido está en revisión» con el botón **Ver si ya está lista**, recordada en su dispositivo por 7 días.
- Al habilitar el cambio, RR. HH. ve el mensaje listo para avisar: **Avisar por WhatsApp** (enlace wa.me, sin costo) o **Copiar mensaje**.

## v12 — Avisos por correo con el servidor propio de FUNDAMETZ
- Función de Supabase `supabase/functions/enviar-correo` (ver su LEEME.md): envía con `notificacion@fundametz.com` vía SMTP. Sin costo adicional (incluida en el plan gratuito de Supabase).
- Correo automático al colaborador cuando RR. HH. habilita su cambio de clave, aprueba o rechaza su cuenta; y a RR. HH. cuando llega una solicitud nueva.
- La ventana «Cambio de clave habilitado» muestra si el correo salió («Correo enviado a h****@…»).
- Gestión de Cuentas: campos **Correo** y **Celular** al crear o editar una cuenta.

## v13 — Correo como único canal de aviso
- Correo y celular **obligatorios** al crear la cuenta (registro propio y Gestión de Cuentas). El celular se usa para confirmar la identidad al cambiar la clave.
- Se quitó WhatsApp: los avisos salen solo por correo desde notificacion@fundametz.com. Si falla, la ventana ofrece «Reintentar envío».
- Autorización de datos actualizada: el contacto ya no es opcional y se indica su finalidad (avisos por correo).
