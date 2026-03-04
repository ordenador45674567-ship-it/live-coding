# Usamos una imagen ligera de Python
FROM python:3.9-slim

# Establecemos el directorio de trabajo dentro del contenedor
WORKDIR /app

# Instalamos las librerías necesarias directamente
# Flask para el servidor y Flask-CORS para que el frontend pueda hablar con la API
RUN pip install --no-cache-dir flask flask-cors

# Copiamos el contenido de la carpeta backend al contenedor
COPY . .

# Exponemos el puerto donde escuchará Flask
EXPOSE 5000

# Comando para arrancar la aplicación
CMD ["python", "app.py"]