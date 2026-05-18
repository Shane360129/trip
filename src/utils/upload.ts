import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../firebase';
import { newId } from './id';

const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8 MB

const sanitizeExt = (filename: string): string => {
    const m = filename.toLowerCase().match(/\.([a-z0-9]{1,5})$/);
    return m ? m[1] : 'jpg';
};

export interface UploadProgress {
    progress: number;        // 0..100
    bytes: number;
    totalBytes: number;
}

export interface UploadResult {
    url: string;
    path: string;
}

export const uploadImage = (
    file: File,
    tripId: string,
    onProgress?: (p: UploadProgress) => void
): Promise<UploadResult> =>
    new Promise((resolve, reject) => {
        if (!file.type.startsWith('image/')) {
            reject(new Error('只支援圖片檔'));
            return;
        }
        if (file.size > MAX_IMAGE_BYTES) {
            reject(new Error(`圖片太大（限 ${MAX_IMAGE_BYTES / 1024 / 1024}MB 以內）`));
            return;
        }

        const path = `trips/${tripId}/${newId()}.${sanitizeExt(file.name)}`;
        const fileRef = ref(storage, path);
        const task = uploadBytesResumable(fileRef, file, { contentType: file.type });

        task.on(
            'state_changed',
            (snap) => {
                onProgress?.({
                    progress: snap.totalBytes ? Math.round((snap.bytesTransferred / snap.totalBytes) * 100) : 0,
                    bytes: snap.bytesTransferred,
                    totalBytes: snap.totalBytes,
                });
            },
            (err) => reject(err),
            async () => {
                try {
                    const url = await getDownloadURL(task.snapshot.ref);
                    resolve({ url, path });
                } catch (err) {
                    reject(err);
                }
            }
        );
    });

export const deleteUploadedImage = async (url: string): Promise<void> => {
    if (!url.includes('firebasestorage.googleapis.com')) return;
    try {
        // Storage Reference accepts a full download URL
        await deleteObject(ref(storage, url));
    } catch {
        // Silent fail: orphaned file is OK
    }
};
