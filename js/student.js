let allResources = [];

const tbody = document.getElementById('resourceList');
const counter = document.getElementById('counter');
const searchInput = document.getElementById('searchInput');
const fileTypeSelect = document.getElementById('fileType');
const courseSelect = document.getElementById('courseFilter'); // 🔥 New course selector

// Fetch resources from backend
fetch('/api/resources/list')
  .then(res => res.json())
  .then(data => {
    allResources = data;
    updateTable();
  })
  .catch(error => {
    console.error('Error loading resources:', error);
    tbody.innerHTML = `<tr><td colspan="3">❌ Failed to load resources.</td></tr>`;
  });

function updateTable() {
  const search = searchInput.value.toLowerCase();
  const type = fileTypeSelect.value;
  const selectedCourse = courseSelect.value;

  const filtered = allResources.filter(r => {
    const matchesSearch =
      r.title.toLowerCase().includes(search) ||
      r.uploader.toLowerCase().includes(search);

    const ext = r.filename.split('.').pop().toLowerCase();
    const matchesType =
      type === 'all' ||
      (type === 'pdf' && ext === 'pdf') ||
      (type === 'doc' && (ext === 'doc' || ext === 'docx'));

    const matchesCourse =
      selectedCourse === 'all' || r.course === selectedCourse;

    return matchesSearch && matchesType && matchesCourse;
  });

  // Update counter
  counter.innerText = `📚 Showing ${filtered.length} resource(s)`;

  // Update table
  tbody.innerHTML = '';
  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4">No matching resources found.</td></tr>`;
    return;
  }

  filtered.forEach(resource => {
    const row = document.createElement('tr');
    row.innerHTML = `
  <td>${resource.title}</td>
  <td>${resource.uploader}</td>
  <td>${resource.course}</td>
  <td>${resource.downloads || 0}</td>
  <td><a href="/api/resources/download/${resource.filename}" class="download-btn">Download</a></td>
`;

    tbody.appendChild(row);
  });
}

// Event listeners
searchInput.addEventListener('input', updateTable);
fileTypeSelect.addEventListener('change', updateTable);
courseSelect.addEventListener('change', updateTable); // 🔥 New
