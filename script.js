document.addEventListener('DOMContentLoaded', function() {
    // 1. Smooth Scrolling for Navigation Links
    const navLinks = document.querySelectorAll('nav ul li a.nav-link');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                // Scroll smoothly to the target section
                window.scrollTo({
                    top: targetElement.offsetTop - document.querySelector('.navbar').offsetHeight,
                    behavior: 'smooth'
                });
            }
        });
    });

    // 2. Navigation Bar Active State & Scroll Effects
    const navbar = document.querySelector('.navbar');
    const sections = document.querySelectorAll('section[id]');
    
    // Function to update the active link based on scroll position
    const updateActiveLink = () => {
        let current = '';
        const scrollY = window.pageYOffset;
        const navHeight = navbar.offsetHeight;

        sections.forEach(section => {
            const sectionTop = section.offsetTop - navHeight;
            const sectionHeight = section.clientHeight;
            
            // Check if the current scroll position is within the section bounds
            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });

        // Add a subtle border/shadow effect to the navbar when scrolling
        if (scrollY > 50) {
            navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.5)';
        } else {
            navbar.style.boxShadow = 'none';
        }
    };

    // Initial check and subsequent checks on scroll
    window.addEventListener('scroll', updateActiveLink);
    updateActiveLink(); // Run once on load to set initial state

    // 3. Project Modal/Lightbox functionality
    const modal = document.getElementById('projectModal');
    const openModalBtns = document.querySelectorAll('.open-modal-btn');
    const closeModalBtn = document.querySelector('.close-btn');
    const modalTitle = document.getElementById('modal-title');
    const modalDescription = document.getElementById('modal-description');

    // Open Modal
    openModalBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get data from the project card's data attributes
            const title = this.getAttribute('data-project-title');
            const description = this.getAttribute('data-project-description');

            // Populate the modal content
            modalTitle.textContent = title;
            modalDescription.textContent = description;
            
            // Display the modal
            modal.style.display = 'block';
        });
    });

    // Close Modal when the 'x' is clicked
    closeModalBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });

    // Close Modal when clicking outside of it
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
});

/**
 * Function to redirect the current page to the Tamrin Online Store.
 */
function openTamrinStore() {
    // Set the current window's location to the target file path
    window.location.href = 'tamrin_online_store.html';
}

// Example of how to use it:
// 1. Get the button element (assuming it has the ID 'view-project-btn')
const viewProjectButton = document.getElementById('view-project-btn');

// 2. Attach the function to the button's click event
if (viewProjectButton) {
    viewProjectButton.addEventListener('click', openTamrinStore);
}