// Gallery Filtering Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Furniture filtering
    const furnitureButtons = document.querySelectorAll('.furniture-btn');
    const furnitureItems = document.querySelectorAll('.furniture-item');
    
    // Add click event to each filter button
    furnitureButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            furnitureButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Get filter value
            const filterValue = button.getAttribute('data-furniture');
            
            // Show all items first for smoother transitions
            furnitureItems.forEach(item => {
                // Reset all items to visible but with transition
                item.style.transition = 'opacity 0.3s ease';
                item.style.display = 'block';
                
                // Apply filtering with opacity instead of display
                if (filterValue === 'all') {
                    item.style.opacity = '1';
                } else if (item.getAttribute('data-furniture') === filterValue) {
                    item.style.opacity = '1';
                } else {
                    // Fade out non-matching items
                    item.style.opacity = '0.2';
                    // Only hide completely after transition
                    setTimeout(() => {
                        if (item.style.opacity === '0.2') {
                            item.style.display = 'none';
                        }
                    }, 300);
                }
            });
        });
    });
    
    // Initialize with "all" filter active
    document.querySelector('.furniture-btn[data-furniture="all"]').click();
});