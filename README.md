# Password-Manager-
# 🔐 Password Manager - Gestor de Contraseñas Seguro en Java

Aplicación de escritorio completamente funcional desarrollada en Java que permite gestionar contraseñas de forma segura, con interfaz gráfica moderna, almacenamiento local cifrado y gestión avanzada.

---

## 📋 Descripción

Password Manager es una herramienta de escritorio para gestionar contraseñas con alta seguridad, desarrollada en Java. Cuenta con una interfaz gráfica moderna usando JavaFX, almacenamiento local mediante SQLite y cifrado AES-256 para proteger todos los datos sensibles.

La aplicación incluye autenticación mediante contraseña maestra, generación de contraseñas seguras, búsquedas rápidas, visualización protegida y gestión completa (añadir, editar, eliminar) de credenciales.

---

## 🛠 Requisitos Funcionales

- **Autenticación inicial** mediante contraseña maestra cifrada (clave para AES derivada con PBKDF2).  
- Interfaz gráfica funcional y moderna con **JavaFX**.  
- Gestión de contraseñas con opciones para:  
  - Añadir nueva contraseña (nombre del servicio, usuario, contraseña).  
  - Editar y eliminar contraseñas guardadas.  
  - Buscar por nombre del servicio.  
  - Generar contraseñas seguras con configuración (longitud, símbolos, mayúsculas, números).  
  - Mostrar u ocultar contraseñas con botón toggle.  
- Almacenamiento local en **SQLite**, con todos los datos cifrados usando **AES-256**.  
- Toda la base de datos contiene solo valores cifrados; no hay texto plano almacenado.

---

## ⚙ Requisitos Técnicos

- Código modularizado y bien estructurado: separación clara entre lógica de cifrado, interfaz gráfica y base de datos.  
- Validaciones básicas en la interfaz (campos vacíos, longitud mínima, formato válido).  
- Comentarios explicativos en las clases y métodos importantes para facilitar mantenimiento y escalabilidad.  
- Instrucciones claras para:  
  - Ejecutar la aplicación localmente.  
  - Instalar dependencias (si las hubiera).  
  - Cambiar la contraseña maestra.  

---

## 🚀 Funcionalidades Extras (Opcionales)

- Copiar contraseña al portapapeles con un botón.  
- Temporizador de auto bloqueo o cierre tras inactividad para mayor seguridad.  
- Backups automáticos cifrados de la base de datos.

---

## 💻 Tecnologías usadas

- **Java 17+**  
- **JavaFX** (interfaz gráfica)  
- **SQLite** (base de datos local)  
- **AES-256** (cifrado avanzado)  
- **PBKDF2** (derivación segura de clave)  

---

## 📥 Instalación y Ejecución

1. Clonar el repositorio:  
   ```bash
   git clone https://github.com/tu-usuario/password-manager-java.git
   cd password-manager-java
