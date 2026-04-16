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
        symbolic_locals = {
            "t": t,
            "pi": sp.pi,
            "sin": sp.sin,
            "cos": sp.cos,
            "exp": sp.exp,
            "sqrt": sp.sqrt,
            "sgn": sp.sign,
            "sign": sp.sign,
            "Rect": sp.Function("Rect"),
            "Tri": sp.Function("Tri"),
            "U": sp.Function("U"),
            "Dirac": sp.Function("Dirac"),
            "R": sp.Function("R"),
        }
        expr = sp.sympify(expression, locals=symbolic_locals)
        mirrored_expr = sp.simplify(expr.subs(t, -t))
        even_expr = sp.simplify((expr + mirrored_expr) / 2)
        odd_expr = sp.simplify((expr - mirrored_expr) / 2)

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
            "even_expression": f"xe(t) = {str(even_expr)}",
            "odd_expression": f"xo(t) = {str(odd_expr)}",
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


@app.route("/fourier", methods=["POST"])
def fourier():
    data = request.json
    N = int(data.get("N", 10))  # number of harmonics

    T = 2.0          # period
    f0 = 1.0 / T     # fundamental frequency

    # ----- Sawtooth: range -1..1 -----
    # Exact complex exponential coefficients:
    #   c_0  = 0.0
    #   c_n  = j/(pi*n)   for n != 0

    def c_n(n):
        if n == 0:
            return complex(0.0, 0.0)
        return complex(0, 1.0 / (np.pi * n))   # = j/(πn)

    harmonics = list(range(-N, N + 1))
    amplitudes = []
    phases = []
    cn_real, cn_imag = [], []

    for n in harmonics:
        val = c_n(n)
        amplitudes.append(abs(val))
        phases.append(np.degrees(np.angle(val)))
        cn_real.append(val.real)
        cn_imag.append(val.imag)

    # ----- Time-domain: original + Fourier reconstruction -----
    # 4 full periods (0 → 8 s), 200 pts/period so sharp drops are visible
    NUM_PERIODS = 4
    PTS_PER_PERIOD = 200
    t_arr = []
    original_arr = []
    for p in range(NUM_PERIODS):
        t_seg = np.linspace(p * T, (p + 1) * T, PTS_PER_PERIOD, endpoint=False)
        x_seg = 2 * ((t_seg - p * T) / T) - 1  # rises -1 → 1 within each period
        t_arr.append(t_seg)
        original_arr.append(x_seg)

    t_arr = np.concatenate(t_arr)
    original = np.concatenate(original_arr)

    reconstructed = np.zeros_like(t_arr, dtype=complex)
    for n in range(-N, N + 1):
        reconstructed += c_n(n) * np.exp(1j * 2 * np.pi * n * f0 * t_arr)
    reconstructed = np.real(reconstructed)

    # ----- Power -----
    # Exact: P = 1/3  (integral of (t/T)^2 over one period)
    exact_power = 1.0 / 3.0
    # Parseval approximation with N harmonics
    approx_power = sum(abs(c_n(n))**2 for n in range(-N, N + 1))

    # ----- Coefficients table (n >= 0) -----
    table = []
    for n in range(0, N + 1):
        val = c_n(n)
        amp = abs(val)
        phase = np.degrees(np.angle(val)) if n > 0 else 0.0
        # Trig: a_n = 2*Re(c_n), b_n = -2*Im(c_n)
        an = 2 * val.real if n > 0 else val.real * 2   # a_0 = 2*c_0... but a_0 = c_0 for DC
        bn = -2 * val.imag
        if n == 0:
            an = 0.0
            bn = 0.0
        table.append({
            "n": n,
            "amp": round(amp, 5),
            "phase": round(phase, 1),
            "an": round(an, 5),
            "bn": round(bn, 5),
        })

    return jsonify({
        "harmonics": harmonics,
        "amplitudes": amplitudes,
        "phases": phases,
        "time": t_arr.tolist(),
        "original": original.tolist(),
        "reconstructed": reconstructed.tolist(),
        "approx_power": float(approx_power),
        "exact_power": float(exact_power),
        "table": table,
        "N": N,
    })


@app.route("/fourier_transform", methods=["POST"])
def fourier_transform():
    data = request.json
    signal_id = data.get("signalId", "sig1")
    
    time = np.arange(-3, 3.01, 0.01)
    freq = np.arange(-8, 8.01, 0.01)
    
    if signal_id == "sig1":
        time_sig = np.cos(6 * np.pi * time)
        amp_sig = 2.5 * (np.where(np.abs(freq - 3) < 0.05, 1, 0) + np.where(np.abs(freq + 3) < 0.05, 1, 0))
        phase_sig = np.zeros_like(freq)
        formula_tf = "X(f) = ½[δ(f - 3) + δ(f + 3)]"
        prop_used = "Direct: cos(2πf₀t) ↔ ½[δ(f-f₀) + δ(f+f₀)]"
        time_label = "x(t) = cos(6πt)"

    elif signal_id == "sig2":
        time_sig = Tri(2 * time)
        amp_sig = 0.5 * (np.sinc(freq / 2))**2
        phase_sig = np.zeros_like(freq)
        formula_tf = "X(f) = ½ sinc²(f/2)"
        prop_used = "Scale: x(at) ↔ (1/|a|)X(f/a) with a=2"
        time_label = "x₁(t) = Tri(2t)"

    elif signal_id == "sig3":
        time_sig = Rect((time - 1) / 2) - Rect((time + 1) / 2)
        X_f = -4j * np.sinc(2 * freq) * np.sin(2 * np.pi * freq)
        amp_sig = np.abs(X_f)
        phase_sig = np.where(amp_sig > 1e-4, np.angle(X_f, deg=True), 0)
        formula_tf = "X(f) = 2 sinc(2f) [e^{-j2πf} - e^{j2πf}] = -4j sinc(2f) sin(2πf)"
        prop_used = "Time shift & Scale"
        time_label = "x₂(t) = Rect((t-1)/2) - Rect((t+1)/2)"
        
    elif signal_id == "sig4":
        time_sig = Tri(time - 1) - Tri(time + 1)
        X_f = -2j * (np.sinc(freq))**2 * np.sin(2 * np.pi * freq)
        amp_sig = np.abs(X_f)
        phase_sig = np.where(amp_sig > 1e-4, np.angle(X_f, deg=True), 0)
        formula_tf = "X(f) = sinc²(f) [e^{-j2πf} - e^{j2πf}] = -2j sinc²(f) sin(2πf)"
        prop_used = "Time shift: x(t - t₀) ↔ X(f)e^{-j2πft₀}"
        time_label = "x₃(t) = Tri(t-1) - Tri(t+1)"

    elif signal_id == "sig5":
        time_sig = Rect(time / 2) - Tri(time)
        X_f = 2 * np.sinc(2 * freq) - (np.sinc(freq))**2
        amp_sig = np.abs(X_f)
        phase_sig = np.where(amp_sig > 1e-4, np.angle(X_f, deg=True), 0)
        formula_tf = "X(f) = 2 sinc(2f) - sinc²(f)"
        prop_used = "Linearity & Scale"
        time_label = "x₄(t) = Rect(t/2) - Tri(t)"

    else:
        return jsonify({"error": "Unknown signal"}), 400

    return jsonify({
        "time": time.tolist(),
        "freq": freq.tolist(),
        "time_sig": time_sig.tolist(),
        "amp_sig": amp_sig.tolist(),
        "phase_sig": phase_sig.tolist(),
        "formula_tf": formula_tf,
        "prop_used": prop_used,
        "time_label": time_label
    })

if __name__ == "__main__":
    app.run(debug=True)