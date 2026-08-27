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

    async uploadFile(file) {
        const formData = new FormData();

        formData.append('file', file);

        const response = await fetch(
            `${API_BASE_URL}/api/files/upload`,
            {
                method: 'POST',
                body: formData,
            }
        );

        if (!response.ok) {
            throw new Error('File upload failed');
        }

        return response.json();
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