function logout() {
  localStorage.removeItem('user');
  window.location.href = '/login.html';
}

document.addEventListener('DOMContentLoaded', () => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user || user.role !== 'lecturer') {
    alert('Access denied. Please login as a lecturer.');
    return window.location.href = '/login.html';
  }

  const userInfo = document.getElementById('userInfo');
  const profilePic = document.getElementById('profilePic');
  if (userInfo) userInfo.innerText = `${user.username.toUpperCase()} (${user.role.toUpperCase()})`;
  if (profilePic && user.profilePic) profilePic.src = `/uploads/profile_pics/${user.profilePic}`;

  // Fetch resources
  const tbody = document.getElementById('resourceList');
  const counter = document.getElementById('counter');
  const searchInput = document.getElementById('searchInput');
  const fileTypeSelect = document.getElementById('fileType');
  const courseSelect = document.getElementById('courseFilter');
  let allResources = [];

  fetch('/api/resources/list')
    .then(res => res.json())
    .then(data => {
      allResources = data.filter(r => r.uploader === user.username);
      updateTable();
    })
    .catch(err => {
      console.error(err);
      tbody.innerHTML = `<tr><td colspan="4">❌ Failed to load resources.</td></tr>`;
    });

  function updateTable() {
    const search = searchInput.value.toLowerCase();
    const type = fileTypeSelect.value;
    const course = courseSelect.value;

    const filtered = allResources.filter(r => {
      const ext = r.filename.split('.').pop().toLowerCase();
      return (
        (type === 'all' || (type === 'pdf' && ext === 'pdf') || (type === 'doc' && (ext === 'doc' || ext === 'docx')))
        && (course === 'all' || r.course === course)
        && (r.title.toLowerCase().includes(search) || r.course.toLowerCase().includes(search))
      );
    });

    counter.innerText = `📚 Showing ${filtered.length} resource(s)`;
    tbody.innerHTML = '';

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4">No matching resources found.</td></tr>`;
      return;
    }

    filtered.forEach(r => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${r.title}</td>
        <td>${r.course}</td>
        <td>${r.downloads || 0}</td>
        <td>
          ${r.thumbnail 
            ? `<img src="/uploads/${r.thumbnail}" alt="Thumbnail" style="width:60px;height:auto;border-radius:6px;">` 
            : 'No Thumbnail'}
        </td>
        <td><a class="download-btn" href="/api/resources/download/${r.filename}">Download</a></td>
      `;
      tbody.appendChild(row);
    });
    
  }

  searchInput.addEventListener('input', updateTable);
  fileTypeSelect.addEventListener('change', updateTable);
  courseSelect.addEventListener('change', updateTable);

 // Upload resource
const uploadForm = document.getElementById('uploadForm');
uploadForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(uploadForm);
  formData.append('uploader', user.username);

  try {
    await fetch('/api/resources/upload', {
      method: 'POST',
      body: formData
    });
    alert('✅ Uploaded successfully!');
    window.location.reload();
  } catch (err) {
    console.error(err);
    alert('❌ Upload failed.');
  }
});


  // Profile update
  const profileForm = document.getElementById('profileForm');
  profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(profileForm);
    formData.append('email', user.email); // email is required to identify the user in backend

    try {
      const res = await fetch('/api/auth/updateProfile', {
        method: 'POST',
        body: formData
      });
      const result = await res.json();
      if (res.ok) {
        alert('✅ Profile updated! Please refresh.');
      } else {
        alert(result.error || '❌ Profile update failed.');
      }
    } catch (err) {
      console.error(err);
      alert('❌ Error updating profile.');
    }
  });
});
