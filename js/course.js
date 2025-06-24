document.addEventListener('DOMContentLoaded', () => {
  const courses = [
    {
      name: 'Networking',
      description: 'Learn about computer networks, protocols, and security.',
    },
    {
      name: 'Database',
      description: 'Understand relational databases, SQL, and data modeling.',
    },
    {
      name: 'Programming',
      description: 'Dive into algorithms, data structures, and coding practices.',
    },
    {
      name: 'Operating Systems',
      description: 'Explore OS concepts, process management, and memory allocation.',
    },
    {
      name: 'Digital Electronics',
      description: 'Study digital circuits, logic gates, and microprocessors.',
    },
  ];

  const coursesContainer = document.getElementById('coursesContainer');
  const modal = document.getElementById('previewModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalDescription = document.getElementById('modalDescription');
  const modalClose = document.getElementById('modalClose');

  // Function to create course cards
  courses.forEach((course) => {
    const card = document.createElement('div');
    card.className = 'course-card';

    const title = document.createElement('h2');
    title.textContent = course.name;

    const previewButton = document.createElement('button');
    previewButton.textContent = 'Preview';
    previewButton.addEventListener('click', () => {
      modalTitle.textContent = course.name;
      modalDescription.textContent = course.description;
      modal.style.display = 'flex';
    });

    card.appendChild(title);
    card.appendChild(previewButton);
    coursesContainer.appendChild(card);
  });

  // Close modal when clicking the close button
  modalClose.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  // Close modal when clicking outside the modal content
  window.addEventListener('click', (event) => {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  });
});
