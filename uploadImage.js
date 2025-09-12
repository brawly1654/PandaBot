import FormData from 'form-data';
import axios from 'axios';

export default async function uploadImage(buffer) {
  const form = new FormData();
  form.append('file', buffer, 'image.jpg');

  const res = await axios.post('https://telegra.ph/upload', form, {
    headers: form.getHeaders(),
  });

  return 'https://telegra.ph' + res.data[0].src;
}
