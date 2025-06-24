document.addEventListener('DOMContentLoaded', () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const bookList = document.getElementById('bookList');
  const subscriptionNotice = document.getElementById('subscriptionNotice');

  if (!user || !user.username) {
    subscriptionNotice.innerHTML = `<strong style="color: red;">⚠️ Please login first.</strong>`;
    return;
  }

  // Fix: only pass username
  fetch(`/api/auth/checkSubscription?username=${encodeURIComponent(user.username)}`)
    .then(res => res.json())
    .then(data => {
      let subscribed = data.subscription_status === 'active';
      
      // Update notice
      if (!subscribed) {
        subscriptionNotice.innerHTML = `<strong style="color: red;">⚠️ Your subscription is inactive. You must subscribe to download books.</strong>`;
      } else {
        subscriptionNotice.innerHTML = `<strong style="color: green;">✅ Subscription Active. You can download books.</strong>`;
      }

      // Now load the books after checking subscription
      loadBooks(subscribed);
    })
    .catch(err => {
      console.error('Subscription check error:', err);
      subscriptionNotice.innerHTML = `<strong style="color: red;">⚠️ Failed to check subscription.</strong>`;
    });

  function loadBooks(subscribed) {
    fetch('/api/resources/list')
      .then(res => res.json())
      .then(books => {
        bookList.innerHTML = '';

        if (books.length === 0) {
          bookList.innerHTML = '<p>No books available yet.</p>';
          return;
        }

        books.forEach(book => {
          const card = document.createElement('div');
          card.className = 'book-card';
          card.innerHTML = `
            <img src="/uploads/${book.thumbnail || 'default-thumbnail.jpg'}" 
            alt="${book.title}" style="width: 100%; height: auto; border-radius: 6px;">
            <h3>${book.title}</h3>
            <p>Uploaded by: ${book.uploader}</p>
            <button>${subscribed ? 'Download' : 'Subscribe Now'}</button>
          `;

          const button = card.querySelector('button');
          button.addEventListener('click', () => {
            if (subscribed) {
              window.location.href = `/api/resources/download/${book.filename}`;
            } else {
              window.location.href = '/payment.html';
            }
          });

          bookList.appendChild(card);
        });
      })
      .catch(err => {
        console.error('Failed to load books:', err);
        bookList.innerHTML = '<p>⚠️ Failed to load books. Try again later.</p>';
      });
  }
});