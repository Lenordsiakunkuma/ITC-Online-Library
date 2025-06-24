document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('adminLoginForm');

  form.addEventListener('submit', async (e) => {
    e.preventDefault(); // Stop form from submitting normally

    const formData = new FormData(form);
    const username = formData.get('username');
    const password = formData.get('password');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || 'Login failed.');
        return;
      }

      // Store token if provided (optional for secure routes)
      if (data.token) {
        localStorage.setItem('adminToken', data.token);
        window.location.href = 'admin_dashboard.html'; // Redirect to dashboard
      } else {
        alert('Login successful, but no token received.');
      }
    } catch (err) {
      console.error('Login error:', err);
      alert('Failed to login. Please try again.');
    }
  });
});
