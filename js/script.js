//-------------------------variables-----------------------------------------
// Form
const form = document.getElementById("subscriptionForm");

// Name & email inputs
const name = document.getElementById("name");

const email = document.getElementById("email");

// Prompts
const namePrompt = document.querySelector(".newsletter__name-prompt");

const emailPrompt = document.getElementById("promptEmail");

const emailSubmit = document.getElementById("emailSubmit");

// Clases CSS (guardamos las clases en variables para ser accedidas de manera más sencilla)
// para la validación del email
const errorClass = "newsletter__email-error";
const errorActiveClass = "newsletter__email-error--active";
const successClass = "newsletter__email-success";
const successActiveClass = "newsletter__email-success--active";

// Prompts email
let currentPromptType = null; // Esto es para el estrado del prompt actual: null, success, o error (email)

let isPromptVisible = false; // O true para visible (prompt del email) se utiliza en el event listener del email prompt

// Esto es para algo llamado "debounce" una función para el clearTimeout/setTimeout, que detiene la ejecución de un temporizador
// para permitir el cambio de estados y animaciones de los prompts (success/error) del email
let debounceTimer = null;

// Temporizador para esconder el prompt
let hidePromptTimer = null;

// Email regex
const validEmail = /^[a-zA-Z0-9._%+;,-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Modal para el mensaje de éxito o error una vez que se haga submit al formulario
const alert = document.getElementById("alert");

// Mensajes del prompt el para submit event del formulario
const text1 = document.querySelector(".text-1");

const text2 = document.querySelector(".text-2");

//--------------------------Event listeners---------------------------------------------

// Esta función nos ayudará a esconder el email prompt en el event listener después de algunos segundos
function hidePrompt() {
    if (!isPromptVisible) return;

    emailPrompt.classList.remove(errorActiveClass, successActiveClass);

    setTimeout(() => {
        if (!isPromptVisible) {
            emailPrompt.classList.remove(errorClass, successClass);
            emailPrompt.innerText = "";
            currentPromptType = null;
        }
    }, 300);
}

// Event listener para verificar el formato del correo electrónico y mostrar el prompt correspondiente
email.addEventListener("input", (event) => {
    // clearTimeout borra el temporizador previo (reset), de esta manera reseteando la ejecución del código.
    // Esto es para prevenir que el contador se ejecute mientras el usuario esté tecleando rápido y comienza cuando se detiene
    clearTimeout(debounceTimer);
    clearTimeout(hidePromptTimer); // Debounce timer para la función para esconder el prompt

    // Este set timeout hace que el código dentro de él se ejecute después de 300ms y reinica el temporizador después de cada
    // presión del teclado
    debounceTimer = setTimeout(() => {
        // Se toma el valor del input y se limpia con trim()
        const emailInput = email.value.trim();

        // Esta variable guarda si el prompt debe mostrar un mensaje de error o success (o null si no se necesita un prompt)
        let newPromptType = null;

        // Esta variable mostrará el mensaje en el prompt o nada si no se necesita
        let message = "";

        // Esta variable decide si el prompt será visible o no (false)
        let showPrompt = false;

        // Revisando el input del email
        // Si está vacío no se muestra ningún prompt y no se establece tipo o  mensaje
        if (emailInput === "") {
            showPrompt = false;
        }

        // Esto revisa si el valor del input coincide con el regex, si sí, muestra el prompt y mensaje correspondientes
        else if (validEmail.test(emailInput)) {
            showPrompt = true;
            newPromptType = "success";
            message = "Email válido";
        } else {
            showPrompt = true;
            newPromptType = "error";
            message = "e-mail no válido";
        }

        // Esto decide qué hacer con el prompt
        // si el showPrompt es false (p.ej, está vacío) wantsToHide es true y el prompt permanece hidden
        const wantsToHide = !showPrompt;

        // Esto revisa si el prompt se debe mostrar o actualizar
        // showPrompt debe ser true (ya sea tener un email válido o no válido) y...
        const wantsToShowOrChange =
            showPrompt &&
            (newPromptType !== currentPromptType || !isPromptVisible); // ...revisar si el prompt está cambiando (p.ej., de success a error o al revés) o...
        // ...el prompt está actualmente hidden pero debe mostrarse
        // La variable 'currentPromptType' rastrea el estado vigente del prompt (null, success o error)
        // isPromptVisible registra está mostrándose (true) o está escondido (false)

        // Si el prompt debe estar oculto (p.ej., el input esta vacío)
        if (wantsToHide) {
            hidePrompt(); // Función para esonder el prompt después de algunos segundos
            // Si el prompt es visible
            if (isPromptVisible) {
                emailPrompt.classList.remove(
                    // Se quita la clase correspondiente (success o error)
                    errorActiveClass,
                    successActiveClass,
                );
                isPromptVisible = false; // Se actualiza la visibilidad del prompt a false
                // El currentPromptType se mantiene hasta el cleanup  para saber cual background color remover
                setTimeout(() => {
                    // Se revisa si el input sigue vacío antes de limpiarlo completamente
                    if (email.value.trim() === "") {
                        emailPrompt.classList.remove(errorClass, successClass); // 1
                        emailPrompt.innerText = ""; // 2
                        currentPromptType = null; //3
                    }
                }, 350); // Después de 300ms (que coincide con la animación de la transición CSS) se comprueba si el input sigue
                // vacío y se limpia todo después de la transición con el remove class (1), innerText(2) y prompt (3)
            }
        }

        // Mostrar o actualizar el prompt (si es necesario)
        else if (wantsToShowOrChange) {
            // Si el prompt debe mostrarse o cambiar (email válido/inválido) o cambiando
            // entre estados
            if (isPromptVisible) {
                // Se transiciona entre estados visibles
                emailPrompt.classList.remove(
                    errorActiveClass,
                    successActiveClass,
                );

                // 1. Comienza el fade-out

                setTimeout(() => {
                    // 2. Después de un breve retraso (para que comience el fade-out) se actualiza el contenido y el fondo
                    emailPrompt.innerText = message;
                    emailPrompt.classList.remove(errorClass, successClass); // Se limpia la clase de fondo anterior

                    if (newPromptType === "success") {
                        emailPrompt.classList.add(successClass);
                    } else {
                        emailPrompt.classList.add(errorClass);
                    }

                    // 3. Esto es algo un poco complicado, esto hace posible la animación
                    // entre cambios (de success a error, o viceversa) porque forza al navegador a repaint el estilo del prompt
                    // o sea, a recalcular el layout (un "reflow") del documento
                    // El void sirve para retornar un valor de 'undefined', esto le dice al navegador que sólo nos interesa
                    // el efecto secundario del reflow y no el valor que resulta del 'offsetWidth'
                    void emailPrompt.offsetWidth;

                    // 4. Se añade la clase active para disparar el fade-in
                    if (newPromptType === "success") {
                        emailPrompt.classList.add(successActiveClass);
                    } else {
                        emailPrompt.classList.add(errorActiveClass);
                    }
                }, 325); // 325ms de  retraso  le da un momento al fade-out/fade-in para comenzar
            } else {
                // Primero se actualiza la clase del contenido y el fondo
                emailPrompt.innerText = message; // Aquí se actualiza el contenido
                emailPrompt.classList.remove(errorClass, successClass); // Se limpia cualquier clase anterior

                if (newPromptType === "success") {
                    emailPrompt.classList.add(successClass);
                } else {
                    emailPrompt.classList.add(errorClass); // Y aquí se añade la nueva clase
                }

                // Luego se añade la clase activa para disparar el fade-in
                // Usar requestAnimationFrame asegura que los estilos se apliquen antes de que comience la animación
                // se forza un repaint con offsetWidth y luego se añade la clase activa para desvanecer el prompt
                requestAnimationFrame(() => {
                    void emailPrompt.offsetWidth; // Reflow o recalcular el layout
                    if (newPromptType === "success") {
                        emailPrompt.classList.add(successActiveClass);
                    } else {
                        emailPrompt.classList.add(errorActiveClass);
                    }
                });
            }

            // Esto actualiza el currentPromptType al nuevo estado (success o error)
            currentPromptType = newPromptType;
            isPromptVisible = true; // Se marca el prompt visible

            hidePromptTimer = setTimeout(hidePrompt, 3000); // Se establecen 3 segundos para esconder el prompt automáticamente
        }
    }, 350); // Se hace debounce al input por 350ms para darle suficiente tiempo al navegador para aplicar todo
    // lo que pasa dentro de este debounce (debounceTimer) en términos de estilo y cambios de estado
});

// --------------------Código para el name prompt-------------------------------
// email.addEventListener("click", () => {
//     if (name.value === "") {
//         namePrompt.classList.add("newsletter__name-prompt--active");
//     }
//     setTimeout(() => {
//         namePrompt.classList.remove("newsletter__name-prompt--active");
//     }, 3000);
// }); // Intenta integrar esto en el event listener del submit

// --------------------Event listener para el submit-----------------------------
form.addEventListener("submit", (event) => {
    event.preventDefault();

    const nameInput = name.value.trim();

    const success = "success";
    const error = "error";
    const alertActive = "newsletter__alert--active";

    alert.classList.remove(success, error);
    text2.innerText = "";

    setTimeout(() => {
        namePrompt.classList.remove("newsletter__name-prompt--active");

        emailSubmit.classList.remove("newsletter__email-submit--active");
    }, 3000);

    if (!nameInput && !email.value) {
        alert.classList.add(error);
        alert.classList.add(alertActive);

        namePrompt.classList.add("newsletter__name-prompt--active");
        emailSubmit.classList.add("newsletter__email-submit--active");

        emailSubmit.innerText = "Escriba su e-mail";
        text1.innerText = "Por favor agregue su nombre y correo electrónico";
    } else if (!nameInput && validEmail.test(email.value)) {
        alert.classList.add(error);
        alert.classList.add(alertActive);

        namePrompt.classList.add("newsletter__name-prompt--active");

        text1.innerText = "Escriba su nombre en el campo";
    } else if (!nameInput && validEmail.test(email.value) === false) {
        alert.classList.add(error);
        alert.classList.add(alertActive);

        namePrompt.classList.add("newsletter__name-prompt--active");
        emailSubmit.classList.add("newsletter__email-submit--active");

        emailSubmit.innerText = "Formato no válido";

        text1.innerText = "Agregue su nombre";
        text2.innerText = "Ingrese un email válido";
    } else if (nameInput !== "" && !email.value) {
        alert.classList.add(error);
        alert.classList.add(alertActive);

        text1.innerText = "Ingrese un email";
    } else if (nameInput !== "" && validEmail.test(email.value) === false) {
        alert.classList.add(error);
        alert.classList.add(alertActive);

        text1.innerText = "Ingrese un email válido";
    } else {
        alert.classList.remove(error);
        alert.classList.add(success);
        alert.classList.add(alertActive);
        text1.innerText = "Suscripción añadida con éxito!";
        form.reset();
    }
});

// ------------------------Botón de cerrado para el alert-----------------------------
const closePrompt = document.querySelector(".newsletter__alert-close");

closePrompt.addEventListener("click", () => {
    alert.classList.remove("newsletter__alert--active");
});
