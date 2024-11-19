from flask import Flask, request, jsonify, render_template
from parser_calculadora import parser, evaluar_arbol 

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/calculate', methods=['POST'])
def calculate():
    data = request.get_json()
    expression = data.get("expression", "").strip()
    if not expression:
        return jsonify({"error": "La expresión no puede estar vacía."}), 400
    try:
        arbol = parser.parse(expression)
        result = evaluar_arbol(arbol)
        return jsonify({"result": result, "tree": arbol})
    except Exception as e:
        return jsonify({"error": f"Error al procesar la expresión: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port="5000")