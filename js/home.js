document.addEventListener('DOMContentLoaded', () => {
  // ======================
  //  HERO BACKGROUND SLIDER
  // ======================
  const hero = document.getElementById('hero');
  if (hero) {
    const images = [
      '/images/itc.jpg',
      '/images/computer lab.jpg',
      '/images/Transport_2.jpg',
      '/images/Transport_4.jpg',
      '/images/ed.jpg'
    ];
    let index = 0;

    function changeBackground() {
      if (images.length === 0) return;
      hero.style.backgroundImage = `url('${images[index]}')`;
      index = (index + 1) % images.length;
    }

    // Preload images to prevent flickering
    images.forEach(src => {
      const img = new Image();
      img.src = src;
    });

    changeBackground();
    setInterval(changeBackground, 4000);
  }

  // ======================
  //  GALLERY AUTO-SCROLL
  // ======================
  const slider = document.querySelector('.gallery-slider');
  if (slider && window.innerWidth < 768) {
    let scrollAmount = 0;
    const scrollStep = 280;
    const scrollInterval = 3000;

    function autoScroll() {
      scrollAmount += scrollStep;
      if (scrollAmount >= slider.scrollWidth - slider.clientWidth) {
        scrollAmount = 0;
      }
      slider.scrollTo({ left: scrollAmount, behavior: 'smooth' });
    }

    setInterval(autoScroll, scrollInterval);
  }

  // ======================
  //  ADMIN PANEL VISIBILITY
  // ======================
  const isAdmin = localStorage.getItem('userRole') === 'admin';
  const adminPanelBtn = document.getElementById('adminPanelBtn');
  const mobileAdminBtn = document.getElementById('mobileAdminBtn');
  const adminPostForm = document.getElementById('adminPostForm');

  if (isAdmin) {
    if (adminPanelBtn) adminPanelBtn.style.display = 'inline-block';
    if (mobileAdminBtn) mobileAdminBtn.style.display = 'block';
    if (adminPostForm) adminPostForm.style.display = 'block';
  }

  // ======================
  //  DATA LOADING FUNCTIONS
  // ======================
  loadAnnouncements();
  loadNews();
  loadPosts();
  loadCourseCatalog();

  // ======================
  //  EVENT LISTENERS
  // ======================
  const loadMoreBtn = document.getElementById('loadMoreBtn');
  const archivedPostsBtn = document.getElementById('archivedPostsBtn');
  const submitPostBtn = document.getElementById('submitPost');
  const mediaUpload = document.getElementById('mediaUpload');
  const deptTabs = document.getElementById('deptTabs');

  if (loadMoreBtn) loadMoreBtn.addEventListener('click', loadMorePosts);
  if (archivedPostsBtn) archivedPostsBtn.addEventListener('click', showArchivedPosts);
  if (submitPostBtn) submitPostBtn.addEventListener('click', submitPost);
  if (mediaUpload) mediaUpload.addEventListener('change', handleMediaUpload);
  if (deptTabs) deptTabs.addEventListener('click', handleDeptTabClick);

  // ======================
  //  HELPER FUNCTIONS
  // ======================
  function handleDeptTabClick(e) {
    if (e.target.classList.contains('dept-tab')) {
      document.querySelectorAll('.dept-tab').forEach(tab => {
        tab.classList.remove('active');
      });
      e.target.classList.add('active');
      loadCoursesForDepartment(e.target.dataset.dept);
    }
  }

  function getPostTypeBadge(type) {
    const types = {
      news: '📰 News',
      notification: '🔔 Notification',
      advert: '📢 Advertisement',
      event: '🎉 Event'
    };
    return `<span class="post-type-badge">${types[type] || type}</span>`;
  }
});

// ======================
//  CONTENT LOADING FUNCTIONS
// ======================
async function loadAnnouncements() {
  const container = document.getElementById('postsContainer');
  if (!container) return;

  try {
    const response = await fetch('/api/announcements');
    
    // Handle HTTP errors
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Server error: ${response.status} - ${error}`);
    }
    
    const announcements = await response.json();
    container.innerHTML = '';

    if (!announcements || announcements.length === 0) {
      container.innerHTML = '<p class="no-data">No announcements available.</p>';
      return;
    }

    // Display announcements
    announcements.forEach(announcement => {
      const announcementEl = document.createElement('div');
      announcementEl.className = 'announcement-card';
      announcementEl.innerHTML = `
        <div class="announcement-header">
          <div class="announcement-icon">📢</div>
          <div class="announcement-title">${announcement.title || 'Announcement'}</div>
        </div>
        <div class="announcement-content">${announcement.message}</div>
        <div class="announcement-footer">
          ${announcement.created_at ? new Date(announcement.created_at).toLocaleDateString() : ''}
        </div>
      `;
      container.appendChild(announcementEl);
    });
  } catch (error) {
    console.error('Announcement loading error:', error);
    container.innerHTML = `
      <div class="error-alert">
        ⚠️ Failed to load announcements: ${error.message}
        <button onclick="loadAnnouncements()">Retry</button>
      </div>
    `;
  }
}

async function loadNews() {
  const container = document.getElementById('newsFeed');
  if (!container) return;

  try {
    const response = await fetch('/api/news');
    if (!response.ok) throw new Error('Failed to fetch news');
    
    const newsList = await response.json();
    container.innerHTML = '';

    if (!newsList || newsList.length === 0) {
      container.innerHTML = '<p class="no-data">No news available at this time.</p>';
      return;
    }

    newsList.forEach(news => {
      const newsEl = document.createElement('div');
      newsEl.className = 'news-card';
      newsEl.innerHTML = `
        <h4>${news.title}</h4>
        <p>${news.body || news.content || 'No content available'}</p>
        <div class="news-meta">
          <span>${news.category || 'General'}</span>
          <span>${news.created_at ? new Date(news.created_at).toLocaleDateString() : ''}</span>
        </div>
      `;
      container.appendChild(newsEl);
    });
  } catch (error) {
    console.error('News loading error:', error);
    container.innerHTML = '<p class="error">⚠️ Failed to load news. Please try again later.</p>';
  }
}

async function loadPosts() {
  const container = document.getElementById('postList');
  if (!container) return;

  try {
    const response = await fetch('/api/posts');
    if (!response.ok) throw new Error('Failed to fetch posts');
    
    const posts = await response.json();
    container.innerHTML = '';

    if (!posts || posts.length === 0) {
      container.innerHTML = '<p class="no-data">No posts available.</p>';
      return;
    }

    posts.forEach(post => {
      const postEl = document.createElement('div');
      postEl.className = 'post-card';
      
      let mediaHTML = '';
      if (post.media && post.media.length > 0) {
        mediaHTML = '<div class="post-media">';
        post.media.forEach(m => {
          mediaHTML += m.type === 'image' 
            ? `<img src="${m.url}" alt="Post image">`
            : `<video controls><source src="${m.url}"></video>`;
        });
        mediaHTML += '</div>';
      }
      
      postEl.innerHTML = `
        <div class="post-header">
          <div class="post-avatar">${post.author?.charAt(0) || 'A'}</div>
          <div>
            <div class="post-author">${post.author || 'Anonymous'}</div>
            <div class="post-time">${post.timestamp ? new Date(post.timestamp).toLocaleString() : ''}</div>
          </div>
        </div>
        <div class="post-content">${post.content || ''}</div>
        ${mediaHTML}
      `;
      
      container.appendChild(postEl);
    });
  } catch (error) {
    console.error('Post loading error:', error);
    container.innerHTML = '<p class="error">⚠️ Failed to load posts. Please try again later.</p>';
  }
}

async function loadCourseCatalog() {
  const container = document.getElementById('deptTabs');
  if (!container) return;

  try {
    const response = await fetch('/api/departments');
    if (!response.ok) throw new Error('Failed to fetch departments');
    
    const departments = await response.json();
    container.innerHTML = '';

    if (!departments || departments.length === 0) {
      container.innerHTML = '<p class="no-data">No departments found.</p>';
      return;
    }

    departments.forEach((dept, index) => {
      const tab = document.createElement('div');
      tab.className = `dept-tab ${index === 0 ? 'active' : ''}`;
      tab.textContent = dept.name;
      tab.dataset.dept = dept.id;
      container.appendChild(tab);
    });

    if (departments.length > 0) {
      loadCoursesForDepartment(departments[0].id);
    }
  } catch (error) {
    console.error('Department loading error:', error);
    container.innerHTML = '<p class="error">⚠️ Failed to load departments. Please try again later.</p>';
  }
}

async function loadCoursesForDepartment(deptId) {
  const container = document.getElementById('coursesContainer');
  if (!container) return;

  try {
    const response = await fetch(`/api/courses?department=${deptId}`);
    if (!response.ok) throw new Error('Failed to fetch courses');
    
    const courses = await response.json();
    container.innerHTML = '';

    if (!courses || courses.length === 0) {
      container.innerHTML = '<p class="no-data">No courses available for this department.</p>';
      return;
    }

    courses.forEach(course => {
      const courseEl = document.createElement('div');
      courseEl.className = 'course-card';
      courseEl.innerHTML = `
        <div class="course-img">
          <i class="fas fa-graduation-cap"></i>
        </div>
        <div class="course-content">
          <h3 class="course-title">${course.name}</h3>
          <div class="course-meta">
            <span><i class="far fa-clock"></i> ${course.duration || 'N/A'}</span>
            <span><i class="fas fa-user-graduate"></i> ${course.level || 'All Levels'}</span>
          </div>
          <p class="course-description">${course.description || 'No description available'}</p>
          <button class="button">View Details</button>
        </div>
      `;
      container.appendChild(courseEl);
    });
  } catch (error) {
    console.error('Course loading error:', error);
    container.innerHTML = '<p class="error">⚠️ Failed to load courses. Please try again later.</p>';
  }
}

// ======================
//  POST MANAGEMENT
// ======================
function submitPost() {
  const contentInput = document.getElementById('postContent');
  const typeSelect = document.getElementById('postType');
  
  if (!contentInput || !typeSelect) return;
  
  const content = contentInput.value.trim();
  const type = typeSelect.value;
  
  if (!content) {
    alert('Please enter post content');
    return;
  }
  
  // Create post object
  const post = {
    content,
    type,
    author: 'Admin User',
    timestamp: new Date().toISOString(),
    media: [] // Would be populated with uploaded files in real implementation
  };
  
  // In a real app, send to API
  console.log('Submitting post:', post);
  
  // Add to UI
  const postsContainer = document.getElementById('postsContainer');
  if (postsContainer) {
    const postEl = document.createElement('div');
    postEl.className = 'announcement-card';
    postEl.innerHTML = `
      <div class="announcement-header">
        <div class="announcement-icon">📢</div>
        <div class="announcement-title">Admin Post</div>
      </div>
      <div class="announcement-content">${content}</div>
      <div class="announcement-footer">
        Just now
      </div>
    `;
    postsContainer.prepend(postEl);
  }
  
  // Reset form
  contentInput.value = '';
  const mediaPreview = document.getElementById('mediaPreview');
  if (mediaPreview) mediaPreview.innerHTML = '';
}

function handleMediaUpload(e) {
  const files = e.target.files;
  const preview = document.getElementById('mediaPreview');
  if (!preview) return;
  
  preview.innerHTML = '';
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const reader = new FileReader();
    
    reader.onload = function(event) {
      const previewItem = document.createElement('div');
      previewItem.className = 'preview-item';
      
      if (file.type.startsWith('image/')) {
        previewItem.innerHTML = `
          <img src="${event.target.result}" alt="Preview">
          <div class="remove-media">&times;</div>
        `;
      } else if (file.type.startsWith('video/')) {
        previewItem.innerHTML = `
          <video controls>
            <source src="${event.target.result}" type="${file.type}">
          </video>
          <div class="remove-media">&times;</div>
        `;
      }
      
      preview.appendChild(previewItem);
    };
    
    reader.readAsDataURL(file);
  }
}

// ======================
//  PLACEHOLDER FUNCTIONS
// ======================
function loadMorePosts() {
  console.log('Loading more posts...');
  // Implementation would fetch next page of posts
  alert('Load more functionality would be implemented here');
}

function showArchivedPosts() {
  console.log('Showing archived posts...');
  // Implementation would show older posts
  alert('Archived posts functionality would be implemented here');
}