const config = {
    apiUrl: process.env.NODE_ENV === 'production' 
        ? 'https://voxpal-backend.onrender.com/api'
        : 'http://localhost:7000/api'
};

export default config; 