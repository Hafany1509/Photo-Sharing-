function fetchModel(url) {
  return fetch(url, { credentials: 'include' }).then((response) => {
    if (!response.ok) {
      return response.text().then((text) => Promise.reject(new Error(`HTTP ${response.status}: ${text}`)));
    }
    return response.json().then((data) => ({ data }));
  });
}

export default fetchModel;
