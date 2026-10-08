import { isFirebaseConfigured, storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

/**
 * Converte um File em Base64 Data URL (para uso local)
 */
export const fileToDataUrl = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};

/**
 * Formata tamanho de bytes para leitura humana (ex: 1.4 MB)
 */
export const formatBytes = (bytes, decimals = 1) => {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Faz upload do arquivo, direcionando para Firebase Storage se ativo,
 * ou criando um Data URL persistente localmente.
 */
export const uploadFile = async (file, pathPrefix = 'uploads') => {
  if (!file) throw new Error('Nenhum arquivo fornecido.');

  const fileId = 'file_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const cleanName = file.name;
  const sizeFormatted = formatBytes(file.size);
  const type = file.type || 'application/octet-stream';

  if (isFirebaseConfigured && storage) {
    try {
      const storageRef = ref(storage, `${pathPrefix}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(snapshot.ref);

      return {
        id: fileId,
        name: cleanName,
        size: sizeFormatted,
        type,
        url: downloadUrl,
        isFirebase: true,
        uploadedAt: new Date().toISOString()
      };
    } catch (error) {
      console.warn('[Storage] Falha no upload ao Firebase Storage, fallback para Data URL local:', error);
    }
  }

  // Fallback local robusto via DataURL
  const dataUrl = await fileToDataUrl(file);
  return {
    id: fileId,
    name: cleanName,
    size: sizeFormatted,
    type,
    url: dataUrl,
    isFirebase: false,
    uploadedAt: new Date().toISOString()
  };
};
