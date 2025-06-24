document.addEventListener('DOMContentLoaded', () => {
  const user = JSON.parse(localStorage.getItem('user'));

  if (!user || !user.username) {
    alert('You must be logged in to access this page.');
    window.location.href = '/login.html';
    return;
  }

  fetch(`/api/auth/user/${user.username}`)
    .then(res => {
      if (!res.ok) throw new Error('Failed to fetch user');
      return res.json();
    })
    .then(data => {
      if (data.subscription_status !== 'active') {
        alert('Your subscription is not active. Please make a payment.');
        window.location.href = '/subscription.html';
      } else {
        console.log('Access granted: subscription is active.');
      }
    })
    .catch(err => {
      console.error('Subscription check failed:', err);
      alert('An error occurred while verifying your access.');
      window.location.href = '/login.html';
    });
});
