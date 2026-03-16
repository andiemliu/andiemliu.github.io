// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function () {  
    // Get the container element
    const container = document.querySelector('body');
    
    container.addEventListener('mousemove', (event) => {
    // Get the mouse's X and Y coordinates
    const mouseX = event.clientX / window.innerWidth;
    const mouseY = event.clientY / window.innerHeight;

    // Calculate RGB values based on mouse coordinates
    const r = Math.floor(200 + mouseX * 10);
    const g = Math.floor(200 + mouseY * 35);
    const b = 230; // Adjust this value for the blue color

    // Update the background color with the calculated RGB values
    container.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
    });
  
    // add class navbarDark on navbar scroll
    const menu = document.querySelector('.menu-container');

    let lastScrollY = window.scrollY;
    let menuVisible = true;
    let hideTimeout = null;

    function hideMenu() {
        menu.classList.add('menu-hidden');
        menuVisible = false;
    }
    function showMenu() {
        menu.classList.remove('menu-hidden');
        menuVisible = true;
    }


    let menuWasHiddenByScroll = false;
    window.addEventListener('scroll', function() {
        var top = window.scrollY;
        // Only add background if menu is revealed by mouse after scrolling
        if (top >= 40) {
            menu.classList.remove('menu-container-dark');
        } else {
            menu.classList.remove('menu-container-dark');
        }

        // Hide menu when scrolling down, show when scrolling up to top
        if (window.scrollY > lastScrollY && window.scrollY > 60) {
            // Scrolling down
            if (menuVisible) hideMenu();
            menuWasHiddenByScroll = true;
        } else if (window.scrollY < lastScrollY || window.scrollY <= 10) {
            // Scrolling up or near top
            if (!menuVisible) showMenu();
            menuWasHiddenByScroll = false;
        }
        lastScrollY = window.scrollY;
    });

    // Show menu when mouse is near the top (within 60px)
    document.addEventListener('mousemove', function(e) {
        if (e.clientY < 60) {
            if (!menuVisible) showMenu();
            if (hideTimeout) clearTimeout(hideTimeout);
            // Only show background if menu was hidden by scroll
            if (window.scrollY > 60 && menuWasHiddenByScroll) {
                menu.classList.add('menu-container-dark');
            } else {
                menu.classList.remove('menu-container-dark');
            }
        } else if (menuVisible && window.scrollY > 60) {
            if (hideTimeout) clearTimeout(hideTimeout);
            hideTimeout = setTimeout(hideMenu, 400);
        }
    });

    // Show menu when mouse is near the top (within 60px)
    document.addEventListener('mousemove', function(e) {
        if (e.clientY < 60) {
            if (!menuVisible) showMenu();
            if (hideTimeout) clearTimeout(hideTimeout);
        } else if (menuVisible && window.scrollY > 60) {
            // Hide after a short delay if mouse leaves top
            if (hideTimeout) clearTimeout(hideTimeout);
            hideTimeout = setTimeout(hideMenu, 400);
        }
    });
    jokeElement = document.getElementById('joke');
    // Function to fetch a dad joke from the API
    async function fetchDadJoke() {
        try {
            const response = await fetch('https://icanhazdadjoke.com/', {
                headers: {
                    'User-Agent': 'My Library',
                    'Accept': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error('Failed to fetch joke');
            }
            const data = await response.json();
            console.log(data);
            return data.joke;
        } catch (error) {
            console.error('Error fetching joke:', error);
            return 'Failed to fetch joke. Please try again later.';
        }
    }
    // Function to update the joke element with a new joke
    async function updateJoke() {
        const joke = await fetchDadJoke();
        jokeElement.textContent = joke;
    }
    updateJoke();
    
    const leftContainer = document.querySelector('.left-container');
    const rightContainer = document.querySelector('.right-container');
    const wait = (time) => new Promise((resolve) => setTimeout(resolve, time));
    const responsePromise = wait(100);
    responsePromise.then(() => leftContainer.style.opacity = 1).then(() => wait(90))
    .then(() => rightContainer.style.opacity = 1).then(() => wait(90));
    responsePromise.then(() => menu.style.opacity = 1);

    // add class active on navbar link click
    const projLink = document.getElementById('proj-link');
    const expLink = document.getElementById('exp-link');

    projLink.addEventListener('click', (event) => {
        // Prevent the default behavior of the link (e.g., navigating to a different page)
        event.preventDefault();
        expLink.classList.remove('active');
        projLink.classList.add('active');

        // Get the target section element
        const targetSection = document.getElementById("projects");

        // Calculate the desired scroll position (adjust the value as needed)
        const offset = 20; // You can change this value to control how far past the section the scroll goes
        const scrollPosition = targetSection.offsetTop - offset;

        // Scroll to the target section with the desired position
        window.scrollTo({
            top: scrollPosition,
            behavior: 'smooth'
        });
    });

    expLink.addEventListener('click', (event) => {
        // Prevent the default behavior of the link (e.g., navigating to a different page)
        event.preventDefault();
        expLink.classList.add('active');
        projLink.classList.remove('active');

        // Get the target section element
        const targetSection = document.getElementById("experience");

        // Calculate the desired scroll position (adjust the value as needed)
        const offset = 20; // You can change this value to control how far past the section the scroll goes
        const scrollPosition = targetSection.offsetTop - offset;

        // Scroll to the target section with the desired position
        window.scrollTo({
            top: scrollPosition,
            behavior: 'smooth'
        });
    });
});
  