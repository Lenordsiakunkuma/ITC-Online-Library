document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('subscriptionForm');
  const planCards = document.querySelectorAll('.plan');
  const planSelect = document.getElementById('selectedPlan');
  const amountField = document.getElementById('amountField');

  // Auto-select plan when clicking card
  planCards.forEach(card => {
    card.addEventListener('click', () => {
      const plan = card.dataset.plan;
      planSelect.value = plan;
      updateAmount(plan);
      form.scrollIntoView({ behavior: 'smooth' });
    });
  });

  // Auto-fill amount based on plan
  planSelect.addEventListener('change', () => {
    updateAmount(planSelect.value);
  });

  function updateAmount(plan) {
    let amount = 0;
    if (plan === 'weekly') amount = 10;
    else if (plan === 'monthly') amount = 30;
    else if (plan === 'yearly') amount = 300;
    amountField.value = amount;
  }

  // Form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);

    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        body: formData
      });

      const result = await res.json();

      if (res.ok) {
        alert(result.message || '✅ Payment submitted!');
        form.reset();
        planSelect.value = '';
        amountField.value = '';
      } else {
        alert(result.error || '❌ Submission failed.');
      }
    } catch (err) {
      console.error('Error:', err);
      alert('❌ Network or server error.');
    }
  });
});
