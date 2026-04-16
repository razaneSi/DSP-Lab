from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import sympy as sp
import re
from fractions import Fraction




app = Flask(__name__)
CORS(app)

t = sp.symbols('t')

# Fonctions de base
def Rect(t):
    return np.where(np.abs(t) <= 0.5, 1, 0)

def Tri(t):
    return np.where(np.abs(t) <= 1, 1 - np.abs(t), 0)

def U(t):
    return np.where(t >= 0, 1, 0)

def Dirac(t):
    dt = t[1] - t[0]          # pas temporel automatique
    u = U(t)                 # fonction échelon
    return np.gradient(u, dt)  # dérivée numérique

def R(t):
    return t*U(t)

def express_signal(expression, mode):
    """
    mode:
      - 'step'  -> express using U(t)
      - 'ramp'  -> express using R(t)
      - 'sign'  -> express using sgn(t)
    """
    expression = expression.replace(" ", "")
    expression_key = expression.lower()
    mode = mode.lower()

    # Generic Rect(k*t), k integer (also supports Rect(t*k))
    rect_scale = None
    match_left = re.fullmatch(r"rect\(([-+]?\d+)\*t\)", expression_key)
    match_right = re.fullmatch(r"rect\(t\*([-+]?\d+)\)", expression_key)
    if match_left:
        rect_scale = int(match_left.group(1))
    elif match_right:
        rect_scale = int(match_right.group(1))

    if rect_scale is not None and rect_scale != 0 and mode in {"step", "sign"}:
        k_abs = abs(rect_scale)
        half_width = Fraction(1, 2 * k_abs)
        shift = str(half_width)
        if mode == "step":
            return f"U(t+{shift}) - U(t-{shift})"
        return f"(sgn(t+{shift}) - sgn(t-{shift}))/2"

    if expression_key == "u(t)" and mode == "sign":
        return "(1+sgn(t))/2"

    if expression_key == "u(t)" and mode == "step":
        return "U(t)"

    if expression_key == "rect(t)" and mode == "step":
        return "U(t+1/2) - U(t-1/2)"

    if expression_key == "rect(t)" and mode == "sign":
        return "(sgn(t+1/2) - sgn(t-1/2))/2"

    if expression_key in {"tri(t)", "tri(1*t)", "tri(t*1)"} and mode == "ramp":
        return "R(t+1) - 2*R(t) + R(t-1)"

    if expression_key in {"tri(t)", "tri(1*t)", "tri(t*1)"} and mode == "step":
        return "(t+1)*U(t+1) - 2*t*U(t) + (t-1)*U(t-1)"

    return None


def evaluate_expression(expression, time):
    expr = sp.sympify(expression)
    return evaluate_sympy_expression(expr, time)


def evaluate_sympy_expression(expr, time):
    func = sp.lambdify(
        t,
        expr,
        modules=[
            {
                "sin": np.sin,
                "cos": np.cos,
                "exp": np.exp,
                "sqrt": np.sqrt,
                "pi": np.pi,
                "Rect": Rect,
                "Tri": Tri,
                "U": U,
                "sgn": np.sign,
                "sign": np.sign,
                "Dirac": Dirac,
                "R": R,
            },
            "numpy",
        ],
    )
    signal = np.array(func(time), dtype=float)
    if signal.shape == ():
        signal = np.full_like(time, float(signal), dtype=float)
    return signal
# ----- Generate signal from expression -----

@app.route("/generate", methods=["POST"])
def generate():
    data = request.json
    expression = data["expression"]

    try:
        time = np.arange(-5, 5, 0.01)
        signal = evaluate_expression(expression, time)

        return jsonify({
            "time": time.tolist(),
            "signal": signal.tolist()
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 400


# ----- Energy -----

@app.route("/energy", methods=["POST"])
def energy():
    signal = np.array(request.json["signal"])
    dt = 0.01
    E = np.trapezoid(signal**2, dx=dt)
    return jsonify({"energy": float(E)})


# ----- Power -----

@app.route("/power", methods=["POST"])
def power():
    signal = np.array(request.json["signal"])
    dt = 0.01
    E = np.trapezoid(signal**2, dx=dt)
    T = len(signal) * dt
    P = E / T
    return jsonify({"power": float(P)})

@app.route("/express", methods=["POST"])
def express():
    data = request.json
    expression = data["expression"]
    mode = data["mode"]

    new_expr = express_signal(expression, mode)

    if not new_expr:
        return jsonify({"error": "Expression not supported for transformation"}), 400

    return jsonify({
        "original": expression,
        "expressed": new_expr
    })


@app.route("/operate", methods=["POST"])
def operate():
    data = request.json
    expression1 = data.get("expression1", "")
    expression2 = data.get("expression2", "")
    operation = data.get("operation", "+")

    if operation not in {"+", "-", "*"}:
        return jsonify({"error": "Operation must be one of +, -, *"}), 400

    try:
        time = np.arange(-5, 5, 0.01)
        signal1 = evaluate_expression(expression1, time)
        signal2 = evaluate_expression(expression2, time)

        if operation == "+":
            result = signal1 + signal2
        elif operation == "-":
            result = signal1 - signal2
        else:
            result = signal1 * signal2

        return jsonify({
            "time": time.tolist(),
            "signal1": signal1.tolist(),
            "signal2": signal2.tolist(),
            "result": result.tolist(),
            "equation": f"y(t) = x1(t) {operation} x2(t)",
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400




@app.route("/parity", methods=["POST"])
def parity():
    data = request.json
    expression = data.get("expression", "")

    try:
        time = np.arange(-2, 2, 0.01)
        original = evaluate_expression(expression, time)
        mirrored = evaluate_expression(expression, -time)

        even_part = 0.5 * (original + mirrored)
        odd_part = 0.5 * (original - mirrored)

        return jsonify({
            "time": time.tolist(),
            "original": original.tolist(),
            "mirrored": mirrored.tolist(),
            "even": even_part.tolist(),
            "odd": odd_part.tolist(),
            "even_formula": "xe(t) = 1/2 [x(t) + x(-t)]",
            "odd_formula": "xo(t) = 1/2 [x(t) - x(-t)]",
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route("/derivatives", methods=["POST"])
def derivatives():
    data = request.json
    expression = data.get("expression", "")

    try:
        time = np.arange(-5, 5, 0.01)
        dt = float(time[1] - time[0])

        # Numerical derivatives are robust for custom piecewise functions (Rect, Tri, U, etc.).
        original = evaluate_expression(expression, time)
        first = np.gradient(original, dt)
        second = np.gradient(first, dt)

        return jsonify({
            "time": time.tolist(),
            "original": original.tolist(),
            "first_derivative": first.tolist(),
            "second_derivative": second.tolist(),
            "first_expression": "d/dt x(t) (numerical)",
            "second_expression": "d2/dt2 x(t) (numerical)",
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400




# ----- Frequency detection for sinusoid -----

# @app.route("/frequency", methods=["POST"])
# def frequency():
#     expression = request.json["expression"]

#     try:
#         expr = sp.sympify(expression)

#         # Try extracting angular frequency
#         if expr.has(sp.sin) or expr.has(sp.cos):
#             inside = expr.args[0]
#             omega = inside.coeff(t)

#             if omega != 0:
#                 f0 = float(abs(omega) / (2 * np.pi))
#                 T = 1 / f0
#                 return jsonify({"f0": f0, "T": T})

#         return jsonify({"f0": None, "T": None})

#     except:
#         return jsonify({"f0": None, "T": None})


if __name__ == "__main__":
    app.run(debug=True)




