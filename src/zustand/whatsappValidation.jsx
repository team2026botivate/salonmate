const { default: axios } = require('axios');
const { createStore } = require('zustand');

createStore((set) => {
  const [error, setError] = useState();
  const [success, setSuccess] = useState();

  const checkValidation = async (data) => {
    try {
      const data = await axios.get(`${import.meta.env.VITE_BACKEND_API}/messages/updateQuota`);

      console.log(data, 'data');
    } catch (error) {}
  };
});
