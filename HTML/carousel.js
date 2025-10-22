document.addEventListener('DOMContentLoaded', () => {
    const carouselTrack = document.querySelector('.carousel-track');
    const originalTestimonios = Array.from(carouselTrack.children).filter(child => child.classList.contains('testimonio__reseña'));

    const prevButton = document.querySelector('.carousel-button.prev');
    const nextButton = document.querySelector('.carousel-button.next');

    let itemsPerPage;
    let currentIndex = 0;
    let slideInterval;
    const autoScrollInterval = 3000; // 7 segundos

    const numClones = 3; // Number of items to clone for smooth looping

    // Function to clone testimonials for infinite loop effect
    const setupInfiniteLoop = () => {
        // Remove all current children from the track to re-add original and clones
        while (carouselTrack.firstChild) {
            carouselTrack.removeChild(carouselTrack.firstChild);
        }

        if (itemsPerPage > 1) { // Only for PC/tablet view where true looping is desired
            // Prepend clones of the end items to the track
            for (let i = 0; i < numClones && i < originalTestimonios.length; i++) {
                const clone = originalTestimonios[originalTestimonios.length - 1 - i].cloneNode(true);
                carouselTrack.appendChild(clone); // Temporarily add to end to reorder later
            }
            // Add original testimonials
            originalTestimonios.forEach(testimonio => {
                carouselTrack.appendChild(testimonio);
            });
            // Append clones of the beginning items to the track
            for (let i = 0; i < numClones && i < originalTestimonios.length; i++) {
                const clone = originalTestimonios[i].cloneNode(true);
                carouselTrack.appendChild(clone);
            }

            // Now, rearrange to have prepend clones first
            const allItems = Array.from(carouselTrack.children);
            const itemsToPrepend = allItems.slice(originalTestimonios.length, originalTestimonios.length + numClones);
            itemsToPrepend.reverse().forEach(item => carouselTrack.prepend(item));

            // Set initial index to start at the first original item
            currentIndex = numClones;

        } else { // Mobile view, no cloning, just add original items back
            originalTestimonios.forEach(testimonio => {
                carouselTrack.appendChild(testimonio);
            });
            currentIndex = 0; // Start from the first item
        }
    };


    const getTestimonialWidth = () => {
        const firstTestimonio = originalTestimonios[0]; // Always use original for width calculation
        if (firstTestimonio) {
            const style = window.getComputedStyle(firstTestimonio);
            const margin = parseFloat(style.marginLeft) + parseFloat(style.marginRight);
            return firstTestimonio.offsetWidth + margin;
        }
        return carouselTrack.offsetWidth / itemsPerPage; // Fallback
    };

    const updateItemsPerPage = () => {
        const oldItemsPerPage = itemsPerPage;

        if (window.innerWidth <= 768) {
            itemsPerPage = 1;
        } else if (window.innerWidth <= 1024) {
            itemsPerPage = 2;
        } else {
            itemsPerPage = 3;
        }

        // Only re-setup infinite loop if itemsPerPage changes between mobile/desktop modes
        if ((oldItemsPerPage === undefined) || (oldItemsPerPage === 1 && itemsPerPage !== 1) || (oldItemsPerPage !== 1 && itemsPerPage === 1)) {
            setupInfiniteLoop();
        }

        // Update carousel position based on current itemsPerPage and currentIndex
        updateCarousel();
    };

    const updateCarousel = () => {
        const currentTestimonialWidth = getTestimonialWidth();
        const totalItemsInTrack = carouselTrack.children.length; // Includes original and clones

        // Use setTimeout to ensure transition is applied correctly
        setTimeout(() => {
            carouselTrack.style.transition = 'transform 0.5s ease-in-out';
            carouselTrack.style.transform = `translateX(-${currentIndex * currentTestimonialWidth}px)`;
        }, 0); // Execute immediately but asynchronously

        if (itemsPerPage > 1) { // PC and tablet mode with cloning
            // If we've slid past the original items (into the appended clones)
            if (currentIndex >= originalTestimonios.length + numClones) {
                // After the transition, instantly jump back to the corresponding original item
                setTimeout(() => {
                    carouselTrack.style.transition = 'none'; // Disable transition for instant jump
                    currentIndex = numClones + (currentIndex - (originalTestimonios.length + numClones));
                    carouselTrack.style.transform = `translateX(-${currentIndex * currentTestimonialWidth}px)`;
                    carouselTrack.offsetHeight; // Force reflow
                    // Transition will be re-enabled by next slide
                }, 500); // Match CSS transition duration
            }
            // If we've slid before the original items (into the prepended clones)
            else if (currentIndex < numClones) {
                setTimeout(() => {
                    carouselTrack.style.transition = 'none'; // Disable transition
                    currentIndex = originalTestimonios.length + currentIndex;
                    carouselTrack.style.transform = `translateX(-${currentIndex * currentTestimonialWidth}px)`;
                    carouselTrack.offsetHeight; // Force reflow
                    // Transition will be re-enabled by next slide
                }, 500); // Match CSS transition duration
            }
        } else { // Mobile mode (simple loop without cloning)
            // Simple loop for mobile, no clones
            if (currentIndex >= originalTestimonios.length) {
                currentIndex = 0;
                setTimeout(() => {
                     carouselTrack.style.transition = 'none';
                     carouselTrack.style.transform = `translateX(0px)`;
                     carouselTrack.offsetHeight;
                }, 500); // Slight delay for smoothness if it's auto-looping
            } else if (currentIndex < 0) {
                currentIndex = originalTestimonios.length - 1;
                setTimeout(() => {
                    carouselTrack.style.transition = 'none';
                    carouselTrack.style.transform = `translateX(-${currentIndex * currentTestimonialWidth}px)`;
                    carouselTrack.offsetHeight;
                }, 500);
            }
        }

        // Show/hide buttons based on the itemsPerPage, always visible on mobile
        prevButton.style.display = 'block';
        nextButton.style.display = 'block';
    };

    const nextSlide = () => {
        currentIndex++;
        updateCarousel();
        resetAutoScroll();
    };

    const prevSlide = () => {
        currentIndex--;
        updateCarousel();
        resetAutoScroll();
    };

    const startAutoScroll = () => {
        clearInterval(slideInterval);
        slideInterval = setInterval(nextSlide, autoScrollInterval);
    };

    const resetAutoScroll = () => {
        clearInterval(slideInterval);
        startAutoScroll();
    };

    // Event listeners for buttons
    prevButton.addEventListener('click', prevSlide);
    nextButton.addEventListener('click', nextSlide);

    // Adjust carousel when window is resized
    window.addEventListener('resize', updateItemsPerPage);

    // Initial setup
    updateItemsPerPage(); // This will trigger setupInfiniteLoop and initial carousel position
    startAutoScroll();

    // Pause carousel on hover for the track and buttons
    const stopOnHoverElements = [carouselTrack, prevButton, nextButton];
    stopOnHoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => clearInterval(slideInterval));
        el.addEventListener('mouseleave', startAutoScroll);
    });
});