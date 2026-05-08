// src/service/imgbb.js
const IMGBB_API_KEY = '659a4d9b8334d52efd6d5a3dfadeeaec';

export const subirImagen = (file, carpeta = 'evidencias', onProgress = null) => {
  return new Promise((resolve, reject) => {

    // Convertir la imagen a base64 para enviarla a ImgBB
    const reader = new FileReader();

    reader.onload = () => {
      // Quitar el encabezado "data:image/jpeg;base64," y quedarse solo con los datos
      const base64 = reader.result.split(',')[1];

      // Armar el cuerpo de la petición
      const formData = new FormData();
      formData.append('image', base64);
      formData.append('name', `${carpeta}_${Date.now()}`);

      // Enviar a la API de ImgBB con XMLHttpRequest para tener progreso
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`);

      // Progreso de subida
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          const porcentaje = Math.round((event.loaded / event.total) * 100);
          onProgress(porcentaje);
        }
      };

      // Respuesta recibida
      xhr.onload = () => {
        if (xhr.status === 200) {
          try {
            const respuesta = JSON.parse(xhr.responseText);

            if (respuesta.success) {
              // display_url es la URL directa a la imagen, permanente y pública
              resolve(respuesta.data.display_url);
            } else {
              reject(new Error('ImgBB rechazó la imagen. Verifica que la API Key sea correcta.'));
            }
          } catch {
            reject(new Error('La respuesta de ImgBB no se pudo procesar.'));
          }
        } else {
          reject(new Error(
            xhr.status === 400
              ? 'API Key incorrecta o imagen inválida. Verifica tu configuración.'
              : `Error al subir la imagen (código ${xhr.status}).`
          ));
        }
      };

      // Error de red
      xhr.onerror = () => {
        reject(new Error('No se pudo conectar con ImgBB. Verifica tu conexión a internet.'));
      };

      xhr.send(formData);
    };

    reader.onerror = () => {
      reject(new Error('No se pudo leer el archivo de imagen seleccionado.'));
    };

    // Leer el archivo como base64
    reader.readAsDataURL(file);
  });
};