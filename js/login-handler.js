document.addEventListener('DOMContentLoaded', () => {
    const handleLogin = (formId) => {
      const form = document.getElementById(formId);
      if (!form) return;
    
  
      form.addEventListener('submit', async (e) => {
        e.preventDefault(); // 🛑 STOP default form submission
  
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
  
        try {
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
  
          const result = await res.json();
          console.log('Login Result:', result);
  
          if (res.ok && result.redirectTo) {
            // 🔥 Save user info to localStorage
            localStorage.setItem('user', JSON.stringify({
              username: result.username,
              role: result.role
            }));
  
            // 🚀 Redirect to the dashboard
            window.location.href = result.redirectTo;
          } else {
            alert(result.error || 'Login failed.');
          }
        } catch (err) {
          alert('Something went wrong.');
          console.error('Login error:', err);
        }
      });
    };
  
    handleLogin('studentLoginForm');
    handleLogin('lecturerLoginForm');
  });
  

  document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('studentLoginForm') || document.getElementById('lecturerLoginForm') || document.getElementById('adminLoginForm');
  
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
  
        const formData = new FormData(loginForm);
        const data = Object.fromEntries(formData.entries());
  
        try {
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
  
          const result = await res.json();
  
          if (res.ok) {
            // Save user info to localStorage
            localStorage.setItem('user', JSON.stringify({
              username: result.username,
              role: result.role
            }));
  
            // ✅ Redirect to correct dashboard
            window.location.href = result.redirectTo;
          } else {
            alert(result.error || 'Login failed.');
          }
        } catch (err) {
          console.error('Login error:', err);
          alert('Server error. Try again.');
        }
      });
    }
  });
  



  document.addEventListener('DOMContentLoaded', function() {
      // Mobile menu toggle
      const mobileToggle = document.getElementById('mobileToggle');
      const navLinks = document.querySelector('.nav-links');
      
      if (mobileToggle) {
        mobileToggle.addEventListener('click', function() {
          navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
          mobileToggle.innerHTML = navLinks.style.display === 'flex' ? 
            '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
        });
      }
      
      // Password visibility toggle
      function setupPasswordToggle(passwordId, toggleId) {
        const passwordInput = document.getElementById(passwordId);
        const toggleButton = document.getElementById(toggleId);
        
        if (passwordInput && toggleButton) {
          toggleButton.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            toggleButton.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
          });
        }
      }
      
      // Set up password toggles
      setupPasswordToggle('studentPassword', 'studentPasswordToggle');
      setupPasswordToggle('lecturerPassword', 'lecturerPasswordToggle');
      
      // Role notification element
      const roleNotification = document.getElementById('roleNotification');
      
      // Form submission handling with role-based redirection
      function setupFormValidation(formId) {
        const form = document.getElementById(formId);
        
        if (form) {
          form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const username = form.querySelector('input[name="username"]').value.trim();
            const password = form.querySelector('input[name="password"]').value;
            const role = form.querySelector('input[name="role"]').value;
            
            // Simple validation
            if (!username || !password) {
              alert('Please fill in all required fields');
              return;
            }
            
            // Show loading state
            const submitButton = form.querySelector('button[type="submit"]');
            const originalText = submitButton.innerHTML;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Authenticating...';
            submitButton.disabled = true;
            
            // Simulate authentication
            setTimeout(() => {
              // Reset button
              submitButton.innerHTML = originalText;
              submitButton.disabled = false;
              
              // Show role notification
              roleNotification.classList.add('show', role);
              
              // Update notification content based on role
              const roleTitle = role === 'student' ? 'Student Dashboard' : 'Lecturer Dashboard';
              roleNotification.querySelector('.role-notification-title').textContent = `Welcome, ${username}!`;
              roleNotification.querySelector('.role-notification-text').textContent = `Redirecting to ${roleTitle}...`;
              
              // Redirect based on role after delay
              setTimeout(() => {
                if (role === 'student') {
                  // Redirect to student dashboard
                  window.location.href = 'student_dashboard.html';
                } else {
                  // Redirect to lecturer dashboard
                  window.location.href = 'lecturer_dashboard.html';
                }
              }, 2000);
            }, 1500);
          });
        }
      }
      
      // Set up form validations
      setupFormValidation('studentLoginForm');
      setupFormValidation('lecturerLoginForm');
      
    });


    document.addEventListener('DOMContentLoaded', () => {
  // Password toggle setup
  const setupPasswordToggle = (inputId, toggleId) => {
    const input = document.getElementById(inputId);
    const toggle = document.getElementById(toggleId);
    if (input && toggle) {
      toggle.addEventListener('click', () => {
        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
        toggle.innerHTML = isPassword
          ? '<i class="fas fa-eye-slash"></i>'
          : '<i class="fas fa-eye"></i>';
      });
    }
  };

  setupPasswordToggle('studentPassword', 'studentPasswordToggle');
  setupPasswordToggle('lecturerPassword', 'lecturerPasswordToggle');

  const handleLogin = (formId) => {
    const form = document.getElementById(formId);
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Authenticating...';

      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        const result = await res.json();

        if (!res.ok || !result.token) {
          alert(result.error || 'Login failed.');
          submitBtn.innerHTML = originalText;
          submitBtn.disabled = false;
          return;
        }

        // Save token and role
        localStorage.setItem('authToken', result.token);
        localStorage.setItem('user', JSON.stringify({
        username: result.username,
        role: result.role,
        token: result.token
      }));
;

        // Show role notification
        const notify = document.getElementById('roleNotification');
        if (notify) {
          notify.classList.add('show', result.role.toLowerCase());
          notify.querySelector('.role-notification-title').textContent = `Welcome, ${result.username}!`;
          notify.querySelector('.role-notification-text').textContent = `Redirecting to ${result.role} dashboard...`;
        }

        // Redirect based on role
        setTimeout(() => {
          if (result.role === 'student') {
            window.location.href = 'student_dashboard.html';
          } else if (result.role === 'lecturer') {
            window.location.href = 'lecturer_dashboard.html';
          } else {
            alert('Unknown role. Cannot redirect.');
          }
        }, 2000);

      } catch (err) {
        console.error('Login error:', err);
        alert('Something went wrong. Try again.');
      } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
      }
    });
  };

  handleLogin('studentLoginForm');
  handleLogin('lecturerLoginForm');

  // Mobile nav
  const toggle = document.getElementById('mobileToggle');
  const nav = document.querySelector('.nav-links');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      nav.style.display = nav.style.display === 'flex' ? 'none' : 'flex';
      toggle.innerHTML = nav.style.display === 'flex'
        ? '<i class="fas fa-times"></i>'
        : '<i class="fas fa-bars"></i>';
    });
  }
});
