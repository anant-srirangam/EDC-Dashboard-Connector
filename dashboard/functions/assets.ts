export const fetchAssetsApi = async () => {
    try {
        const response = await fetch('/api/assets');
        if (response.ok) {
            const data = await response.json();
            return Array.isArray(data) ? data : [];
        }
        throw "Failed fetching assets";
    } catch (error) {
        console.error('Error fetching assets:', error);
        return [];
    }
};