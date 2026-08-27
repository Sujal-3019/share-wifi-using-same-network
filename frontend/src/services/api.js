const API_BASE_URL =
    import.meta.env.VITE_API_URL || 'http://localhost:8000';

console.log('API URL:', API_BASE_URL);

export const api = {
    async health() {
        const response = await fetch(`${API_BASE_URL}/health`);

        if (!response.ok) {
            throw new Error('Backend is unavailable');
        }

        return response.json();
    },

    async filesStatus() {
        const response = await fetch(
            `${API_BASE_URL}/api/files/status`
        );

        if (!response.ok) {
            throw new Error('File service is unavailable');
        }

        return response.json();
    },

    uploadFile(file, onProgress) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();

            xhr.open(
                'POST',
                `${API_BASE_URL}/api/files/upload`
            );

            xhr.upload.addEventListener(
                'progress',
                (event) => {
                    if (!event.lengthComputable) {
                        return;
                    }

                    const progress =
                        (event.loaded / event.total) * 100;

                    if (onProgress) {
                        onProgress(progress, event.loaded, event.total);
                    }
                }
            );

            xhr.addEventListener(
                'load',
                () => {
                    if (
                        xhr.status >= 200 &&
                        xhr.status < 300
                    ) {
                        try {
                            const result = JSON.parse(
                                xhr.responseText
                            );

                            resolve(result);
                        } catch (error) {
                            reject(
                                new Error(
                                    'Invalid server response'
                                )
                            );
                        }
                    } else {
                        reject(
                            new Error(
                                `Upload failed with status ${xhr.status}`
                            )
                        );
                    }
                }
            );

            xhr.addEventListener(
                'error',
                () => {
                    reject(
                        new Error('Network error during upload')
                    );
                }
            );

            xhr.addEventListener(
                'abort',
                () => {
                    reject(
                        new Error('Upload cancelled')
                    );
                }
            );

            const formData = new FormData();

            formData.append('file', file);

            xhr.send(formData);
        });
    },

    async getFiles() {
        const response = await fetch(
            `${API_BASE_URL}/api/files`
        );

        if (!response.ok) {
            throw new Error('Failed to load files');
        }

        return response.json();
    },
};