function subscribe(plan) {
  // Save selected plan in localStorage
  localStorage.setItem('plan', plan);
  alert(`You selected the ${plan.toUpperCase()} plan.`);
  // Redirect to payment
  window.location.href = '/payment.html';
}

