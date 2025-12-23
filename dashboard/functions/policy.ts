export const fetchPoliciesApi = async () => {
    try {
        const response = await fetch('/api/policies');
        if (response.ok) {
            const data = await response.json();
            return Array.isArray(data) ? data : [];
        }
        throw "Failed fetching policies";
    } catch (error) {
        console.error('Error fetching policies:', error);
        return [];
    }
};