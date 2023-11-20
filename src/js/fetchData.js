import axios from 'axios';

const API_KEY = '40692232-4084d53797a695134229ef5d4';
const BASE_URL = 'https://pixabay.com/api/';
const per_page = 40;

async function fetchData(query, currentPage) {
  const url = `${BASE_URL}?key=${API_KEY}&q=${query}&image_type=photo&pretty=true&per_page=${per_page}&page=${currentPage}&orientation=horizontal&safesearch=true`;
  try {
    const { data } = await axios.get(url);

    return data;
  } catch (error) {
    console.log(error);
  }
}
export { fetchData };

console.log('2');
