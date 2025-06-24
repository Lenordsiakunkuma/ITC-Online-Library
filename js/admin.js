document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const navLinks = document.querySelectorAll('.sidebar-menu a');
  const sections = document.querySelectorAll('.content > div');
  const sectionTitle = document.getElementById('section-title');
  const logoutBtn = document.getElementById('logoutBtn');
  let authToken = localStorage.getItem('adminToken');
  
  // Redirect to login if no token
  if (!authToken) {
    window.location.href = '/admin-login.html';
    return;
  }
  
  // ======================
  //  UTILITY FUNCTIONS
  // ======================
  function showError(message) {
    const errorAlert = document.getElementById('error-alert');
    const errorMessage = document.getElementById('error-message');
    
    if (errorAlert && errorMessage) {
      errorMessage.textContent = message;
      errorAlert.classList.remove('hidden');
      
      // Auto-hide after 5 seconds
      setTimeout(() => {
        errorAlert.classList.add('hidden');
      }, 5000);
    } else {
      alert(`Error: ${message}`);
    }
  }

  // Fetch with authentication
  async function fetchWithAuth(url, options = {}) {
    if (!authToken) {
      authToken = localStorage.getItem('adminToken');
      if (!authToken) {
        window.location.href = '/admin-login.html';
        throw new Error('Not authenticated');
      }
    }
    
    options.headers = options.headers || {};
    options.headers['Authorization'] = `Bearer ${authToken}`;
    
    try {
      const response = await fetch(url, options);
      
      // Handle 401 Unauthorized
      if (response.status === 401) {
        localStorage.removeItem('adminToken');
        authToken = null;
        window.location.href = '/admin-login.html';
        throw new Error('Session expired');
      }
      
      // Handle 500 Server Errors
      if (response.status >= 500) {
        throw new Error(`Server error (${response.status})`);
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }
      
      return response;
    } catch (error) {
      // Handle network errors
      if (error.message.includes('Failed to fetch') || 
          error.message.includes('Connection refused')) {
        throw new Error('Backend server is unavailable. Please try again later.');
      }
      throw error;
    }
  }

  // ======================
  //  SECTION MANAGEMENT
  // ======================
  function setActiveSection(sectionId) {
    // Hide all sections
    sections.forEach(section => {
      section.classList.add('hidden');
    });
    
    // Show selected section
    const activeSection = document.getElementById(`${sectionId}-section`);
    if (activeSection) {
      activeSection.classList.remove('hidden');
    }
    
    // Update section title
    const activeLink = document.querySelector(`.sidebar-menu a[data-view="${sectionId}"]`);
    if (activeLink && sectionTitle) {
      sectionTitle.textContent = activeLink.textContent;
    }
    
    // Load section data
    if (sectionId === 'dashboard') loadDashboard();
    if (sectionId === 'users') loadUsers();
    if (sectionId === 'announcements') loadAnnouncements();
    if (sectionId === 'news') loadNews();
    if (sectionId === 'payments') loadPayments();
    
    // Update active nav link
    navLinks.forEach(link => {
      link.classList.remove('active');
    });
    if (activeLink) activeLink.classList.add('active');
  }

  // ======================
  //  DATA LOADING FUNCTIONS
  // ======================
  async function loadDashboard() {
    try {
      const response = await fetchWithAuth('/api/admin/dashboard');
      const stats = await response.json();
      
      if (document.getElementById('totalUsers')) {
        document.getElementById('totalUsers').textContent = stats.totalUsers || 0;
      }
      if (document.getElementById('totalResources')) {
        document.getElementById('totalResources').textContent = stats.totalResources || 0;
      }
      if (document.getElementById('totalRevenue')) {
        document.getElementById('totalRevenue').textContent = `$${stats.totalRevenue || 0}`;
      }
      if (document.getElementById('totalIssues')) {
        document.getElementById('totalIssues').textContent = stats.totalIssues || 0;
      }
    } catch (error) {
      showError('Failed to load dashboard: ' + error.message);
    }
  }

  async function loadUsers() {
    try {
      const response = await fetchWithAuth('/api/admin/users');
      const users = await response.json();
      
      const userList = document.getElementById('userList');
      if (!userList) return;
      
      userList.innerHTML = '';
      
      if (!users || !users.length) {
        userList.innerHTML = '<tr><td colspan="7">No users found</td></tr>';
        return;
      }
      
      users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${user.id}</td>
          <td>${user.username}</td>
          <td>${user.email}</td>
          <td>${user.role}</td>
          <td><span class="status ${user.status}">${user.status}</span></td>
          <td>${new Date(user.created_at).toLocaleDateString()}</td>
          <td>
            <button class="action-btn view-btn"><i class="fas fa-eye"></i></button>
            <button class="action-btn edit-btn"><i class="fas fa-edit"></i></button>
            <button class="action-btn delete-btn" data-id="${user.id}"><i class="fas fa-trash"></i></button>
          </td>
        `;
        userList.appendChild(row);
      });
      
      // Add delete event listeners
      document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const userId = btn.dataset.id;
          if (confirm(`Delete user ${userId}?`)) {
            deleteUser(userId);
          }
        });
      });
    } catch (error) {
      showError('Failed to load users: ' + error.message);
    }
  }

  async function deleteUser(id) {
    try {
      const response = await fetchWithAuth(`/api/admin/users/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        alert('User deleted successfully');
        loadUsers();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }
    } catch (error) {
      showError('Failed to delete user: ' + error.message);
    }
  }

  async function loadAnnouncements() {
    try {
      const response = await fetchWithAuth('/api/admin/announcements');
      const announcements = await response.json();
      
      const announcementList = document.getElementById('announcementList');
      if (!announcementList) return;
      
      announcementList.innerHTML = '';
      
      if (!announcements || !announcements.length) {
        announcementList.innerHTML = '<tr><td colspan="6">No announcements found</td></tr>';
        return;
      }
      
      announcements.forEach(announcement => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${announcement.id}</td>
          <td>${announcement.title}</td>
          <td>${announcement.message}</td>
          <td>${new Date(announcement.created_at).toLocaleDateString()}</td>
          <td><span class="status ${announcement.status}">${announcement.status}</span></td>
          <td>
            <button class="action-btn view-btn"><i class="fas fa-eye"></i></button>
            <button class="action-btn edit-btn"><i class="fas fa-edit"></i></button>
            <button class="action-btn delete-btn" data-id="${announcement.id}"><i class="fas fa-trash"></i></button>
          </td>
        `;
        announcementList.appendChild(row);
      });
      
      // Add delete event listeners
      document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const announcementId = btn.dataset.id;
          if (confirm(`Delete announcement ${announcementId}?`)) {
            deleteAnnouncement(announcementId);
          }
        });
      });
    } catch (error) {
      showError('Failed to load announcements: ' + error.message);
    }
  }

  async function deleteAnnouncement(id) {
    try {
      const response = await fetchWithAuth(`/api/admin/announcements/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        alert('Announcement deleted successfully');
        loadAnnouncements();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }
    } catch (error) {
      showError('Failed to delete announcement: ' + error.message);
    }
  }

  async function loadNews() {
    try {
      const response = await fetchWithAuth('/api/admin/news');
      const news = await response.json();
      
      const newsList = document.getElementById('newsList');
      if (!newsList) return;
      
      newsList.innerHTML = '';
      
      if (!news || !news.length) {
        newsList.innerHTML = '<tr><td colspan="7">No news articles found</td></tr>';
        return;
      }
      
      news.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${item.id}</td>
          <td>${item.title}</td>
          <td>${item.category}</td>
          <td>${new Date(item.created_at).toLocaleDateString()}</td>
          <td>${item.views || 0}</td>
          <td><span class="status ${item.status}">${item.status}</span></td>
          <td>
            <button class="action-btn view-btn"><i class="fas fa-eye"></i></button>
            <button class="action-btn edit-btn"><i class="fas fa-edit"></i></button>
            <button class="action-btn delete-btn" data-id="${item.id}"><i class="fas fa-trash"></i></button>
          </td>
        `;
        newsList.appendChild(row);
      });
      
      // Add delete event listeners
      document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const newsId = btn.dataset.id;
          if (confirm(`Delete news article ${newsId}?`)) {
            deleteNews(newsId);
          }
        });
      });
    } catch (error) {
      showError('Failed to load news: ' + error.message);
    }
  }

  async function deleteNews(id) {
    try {
      const response = await fetchWithAuth(`/api/admin/news/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        alert('News article deleted successfully');
        loadNews();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }
    } catch (error) {
      showError('Failed to delete news article: ' + error.message);
    }
  }

  async function loadPayments() {
    try {
      const response = await fetchWithAuth('/api/admin/payments');
      const payments = await response.json();
      
      const paymentList = document.getElementById('paymentList');
      if (!paymentList) return;
      
      paymentList.innerHTML = '';
      
      if (!payments || !payments.length) {
        paymentList.innerHTML = '<tr><td colspan="9">No payments found</td></tr>';
        return;
      }
      
      payments.forEach(payment => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${payment.id}</td>
          <td>${payment.username}</td>
          <td>${payment.plan}</td>
          <td>$${payment.amount?.toFixed(2) || '0.00'}</td>
          <td>${payment.method}</td>
          <td><span class="status ${payment.status}">${payment.status}</span></td>
          <td>${new Date(payment.created_at).toLocaleDateString()}</td>
          <td>${payment.transaction_id || 'N/A'}</td>
          <td>
            <button class="action-btn view-btn"><i class="fas fa-eye"></i></button>
            <button class="action-btn edit-btn"><i class="fas fa-edit"></i></button>
          </td>
        `;
        paymentList.appendChild(row);
      });
    } catch (error) {
      showError('Failed to load payments: ' + error.message);
    }
  }

  // ======================
  //  EVENT LISTENERS
  // ======================
  // Navigation
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const view = link.dataset.view;
      setActiveSection(view);
    });
  });

  // Logout button
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('adminToken');
        window.location.href = '/admin-login.html';
      }
    });
  }

  // Announcement form submission
  const announcementForm = document.getElementById('announcementForm');
  if (announcementForm) {
    announcementForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = document.getElementById('announcementTitle').value;
      const message = document.getElementById('announcementMessage').value;
      const status = document.getElementById('announcementStatus').value;

      try {
        await fetchWithAuth('/api/announcements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, message, status })
        });

        alert('Announcement added!');
        announcementForm.reset();
        loadAnnouncements();
      } catch (err) {
        showError('Error adding announcement: ' + err.message);
      }
    });
  }

  // Close button for error alerts
  const closeBtn = document.querySelector('.close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      const errorAlert = document.getElementById('error-alert');
      if (errorAlert) {
        errorAlert.classList.add('hidden');
      }
    });
  }

  // ======================
  //  INITIALIZATION
  // ======================
  // Initialize dashboard
  setActiveSection('dashboard');
});