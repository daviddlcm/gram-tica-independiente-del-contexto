let expression = "";
let colorMap = {}; 

// Generar color aleatorio
function generateRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// Crear un nodo circular con color único basado en el valor
function createCircleNode(value, type) {
    const node = document.createElement('div');
    node.classList.add('circle-node');
    
    // Asignar un color único al valor (número o operador)
    if (!colorMap[value]) {
        colorMap[value] = generateRandomColor();  // Asignar un color único
    }
    
    // Asignar el color al nodo (ya sea operador o número)
    node.style.backgroundColor = colorMap[value];

    node.innerText = value;
    node.classList.add(type);  // Añadir tipo de nodo (número o operador)
    return node;
}

// Actualizar la pantalla con la expresión actual
function updateDisplay() {
    document.getElementById('display').value = expression;
}

// Limpiar el árbol mostrado
function clearTree() {
    document.getElementById('tree').innerHTML = "";
}

// Generar el árbol de operaciones a partir de la expresión
function parseExpressionToTree(expr) {
    const operators = ['+', '-', '*', '/'];
    let stack = [];
    let postfix = [];
    let opStack = [];
    let num = '';

    // Convertir infija a postfija (usando la notación polaca inversa)
    for (let i = 0; i < expr.length; i++) {
        let char = expr[i];
        
        if (/\d/.test(char)) {
            num += char; // Acumulamos números de más de un dígito
        } else if (operators.includes(char)) {
            if (num) {
                postfix.push(num);
                num = '';
            }
            while (opStack.length && precedence(opStack[opStack.length - 1]) >= precedence(char)) {
                postfix.push(opStack.pop());
            }
            opStack.push(char);
        }
    }
    
    if (num) {
        postfix.push(num);
    }

    while (opStack.length) {
        postfix.push(opStack.pop());
    }

    // Convertir la notación postfija en un árbol binario
    for (let token of postfix) {
        if (!operators.includes(token)) {
            stack.push(token);
        } else {
            let right = stack.pop();
            let left = stack.pop();
            stack.push([token, left, right]);
        }
    }

    return stack[0];  // El árbol final
}

// Precedencia de operadores
function precedence(op) {
    if (op === '+' || op === '-') return 1;
    if (op === '*' || op === '/') return 2;
    return 0;
}

// Función para dibujar el árbol en HTML
function generateTreeHTML(node) {
    if (typeof node === 'string' || typeof node === 'number') {
        const type = typeof node === 'number' ? 'number' : 'operator'; // Determinamos si es un número o un operador
        return `
            <div class="node">
                ${createCircleNode(node, type).outerHTML}
            </div>
        `;
    }

    const [operator, left, right] = node;

    return `
        <div class="node">
            <div class="operator-node">
                ${createCircleNode(operator, 'operator').outerHTML}
            </div>
            <div class="children">
                <div class="child left">
                    ${generateTreeHTML(left)}
                </div>
                <div class="line vertical-line"></div> <!-- Línea vertical central entre el nodo padre y los hijos -->
                <div class="child right">
                    ${generateTreeHTML(right)}
                </div>
            </div>
        </div>
    `;
}






// Mostrar el árbol en el DOM
function showTree() {
    if (!expression) {
        alert("La expresión no puede estar vacía.");
        return;
    }

    fetch('/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expression })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert(`Error: ${data.error}`);
        } else {
            console.log("Árbol recibido del servidor:", data.tree);
            document.getElementById('tree').innerHTML = generateTreeHTML(data.tree);
        }
    })
    .catch(error => {
        alert(`Error al comunicarse con el servidor: ${error}`);
    });
}

// Ejemplo para agregar valores y dibujar el árbol
function addToExpression(value) {
    expression += value;
    updateDisplay();
    updateTree(value);  // Actualizamos el árbol visual con el valor agregado
}

// Actualiza el árbol visual
function updateTree(value) {
    const treeContainer = document.getElementById('tree');
    const circleNode = createCircleNode(value, 'number');  // Creamos el nodo circular para números
    treeContainer.appendChild(circleNode);
}

// Función para calcular la expresión
function calculate() {
    try {
        let result = eval(expression);  // Solo para demostración, usa un parser adecuado
        document.getElementById('display').value = result;
    } catch (error) {
        document.getElementById('display').value = 'Error';
    }
}

function clearDisplay() {
    expression = "";
    document.getElementById('display').value = "";
    document.getElementById('tree').innerHTML = "";
}