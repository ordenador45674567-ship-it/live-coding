from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
CORS(app)

DB_PATH = 'database.db'

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    # Tabla Usuarios
    cursor.execute('CREATE TABLE IF NOT EXISTS usuarios (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE, password TEXT)')
    # Tabla Productos
    cursor.execute('CREATE TABLE IF NOT EXISTS productos (id INTEGER PRIMARY KEY AUTOINCREMENT, nombre TEXT, precio REAL, descripcion TEXT, detalles TEXT, imagen TEXT, vendedor_id INTEGER)')
    conn.commit()
    conn.close()

# --- 1. REGISTRO ---
@app.route('/register', methods=['POST'])
def register():
    data = request.json
    pw_hash = generate_password_hash(data['password'])
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.execute("INSERT INTO usuarios (username, password) VALUES (?, ?)", (data['username'], pw_hash))
        conn.commit()
        return jsonify({"m": "Usuario creado"}), 201
    except:
        return jsonify({"error": "El usuario ya existe"}), 400
    finally:
        conn.close()

# --- 2. LOGIN (VERSIÓN ÚNICA) ---
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    conn = sqlite3.connect(DB_PATH)
    user_row = conn.execute("SELECT id, username, password FROM usuarios WHERE username = ?", (data['username'],)).fetchone()
    conn.close()
    
    # user_row[2] es el hash, user_row[0] es el id, user_row[1] es el nombre
    if user_row and check_password_hash(user_row[2], data['password']):
        return jsonify({"user_id": user_row[0], "username": user_row[1]}), 200
    return jsonify({"error": "Credenciales incorrectas"}), 401

# --- 3. PRODUCTOS (TIENDA Y VENTA) ---
@app.route('/productos', methods=['GET', 'POST'])
def manejar_productos():
    conn = sqlite3.connect(DB_PATH)
    if request.method == 'POST':
        d = request.json
        conn.execute("INSERT INTO productos (nombre, precio, descripcion, detalles, imagen, vendedor_id) VALUES (?,?,?,?,?,?)",
                    (d['nombre'], d['precio'], d['descripcion'], d['detalles'], d['imagen'], d['vendedor_id']))
        conn.commit()
        conn.close()
        return jsonify({"m": "OK"}), 201
    
    # SQL CON JOIN: Para sacar el nombre del vendedor en la tienda
    res = conn.execute('''
        SELECT p.id, p.nombre, p.precio, p.descripcion, p.detalles, p.imagen, u.username 
        FROM productos p 
        JOIN usuarios u ON p.vendedor_id = u.id
    ''').fetchall()
    conn.close()
    
    return jsonify([{
        "id": p[0], "nombre": p[1], "precio": p[2], 
        "descripcion": p[3], "detalles": p[4], "imagen": p[5], "vendedor": p[6], "vendedor_id": p[6]
    } for p in res])

# --- 4. DETALLES Y BORRADO ---
@app.route('/productos/<int:id_prod>', methods=['GET', 'DELETE'])
def un_producto(id_prod):
    conn = sqlite3.connect(DB_PATH)
    if request.method == 'DELETE':
        conn.execute("DELETE FROM productos WHERE id=?", (id_prod,))
        conn.commit()
        conn.close()
        return jsonify({"m": "OK"})
    
    # GET individual con el nombre del vendedor
    p = conn.execute('''
        SELECT p.id, p.nombre, p.precio, p.descripcion, p.detalles, p.imagen, u.username 
        FROM productos p 
        JOIN usuarios u ON p.vendedor_id = u.id 
        WHERE p.id = ?
    ''', (id_prod,)).fetchone()
    conn.close()
    
    if p:
        return jsonify({
            "id": p[0], "nombre": p[1], "precio": p[2], 
            "descripcion": p[3], "detalles": p[4], "imagen": p[5], "vendedor": p[6]
        })
    return jsonify({"error": "No existe"}), 404

if __name__ == '__main__':
    init_db()
    app.run(host='0.0.0.0', port=5000)