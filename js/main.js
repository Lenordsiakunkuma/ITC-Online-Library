// public/js/main.js

document.getElementById('resource-form').addEventListener('submit', function (e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const data = Object.fromEntries(formData.entries());
  
    fetch('/api/resources', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(result => {
      alert(result.message);
      // Optionally, refresh the resource list or clear the form
    })
    .catch(error => {
      console.error('Error adding resource:', error);
    });
  });
  