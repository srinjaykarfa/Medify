const BASE_URL =
  import.meta.env.MODE === 'development'
    ? import.meta.env.VITE_BACKEND_URL_DEV || 'http://localhost:8000'
    : import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

console.log('Frontend Mode:', import.meta.env.MODE);
console.log('Backend URL:', BASE_URL);

export default BASE_URL; 