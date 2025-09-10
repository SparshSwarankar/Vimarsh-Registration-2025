// Navbar color change on scroll
window.addEventListener("scroll", function () {
    const navbar = document.querySelector(".navbar");
    navbar.classList.toggle("scrolled", window.scrollY > 50);
});

// ======================About=====================
document.addEventListener("DOMContentLoaded", () => {
    const aboutSection = document.querySelector(".about");

    const observer = new IntersectionObserver(
        entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    aboutSection.classList.add("in-view");
                } else {
                    // Add a small delay before removing class to prevent flicker on fast scroll
                    setTimeout(() => {
                        if (!entry.isIntersecting) {
                            aboutSection.classList.remove("in-view");
                        }
                    }, 200);
                }
            });
        },
        { threshold: 0.5 } // only trigger when 50% is visible
    );

    observer.observe(aboutSection);
});

// ===== Speakers slider: auto-scroll with bounce, pause on hover, flip on tap =====
document.addEventListener("DOMContentLoaded", () => {
    const viewport = document.getElementById("speakersSlider");
    if (!viewport) return;
    const track = viewport.querySelector(".speakers-track");
    const cards = Array.from(track.querySelectorAll(".speaker-card"));

    // ✅ Clone cards twice for smoother infinite loop
    const clones = cards.map(c => c.cloneNode(true));
    const clones2 = cards.map(c => c.cloneNode(true));
    track.append(...clones, ...clones2);

    // Dynamic speed helper
    function getSpeed() {
        if (window.innerWidth <= 480) return 30; // phones
        if (window.innerWidth <= 768) return 40;  // tablets
        return 35; // desktops
    }

    let animRunning = false;
    let rafId = null;
    let lastTs = null;
    let tx = 0;

    // original width (before clones)
    const setWidth = cards.reduce((sum, c) => sum + c.offsetWidth, 0);

    function step(ts) {
        if (!animRunning) { lastTs = null; return; }
        if (lastTs == null) lastTs = ts;
        const dt = (ts - lastTs) / 1000;
        lastTs = ts;

        // ✅ compute speed fresh each frame
        const SPEED_PX_PER_SEC = getSpeed();

        // move left
        tx -= SPEED_PX_PER_SEC * dt;

        // ✅ use modulo to prevent snapping
        tx = tx % setWidth;

        track.style.transform = `translate3d(${tx}px,0,0)`;
        rafId = requestAnimationFrame(step);
    }

    function play() {
        if (animRunning) return;
        animRunning = true;
        rafId = requestAnimationFrame(step);
    }

    function pause() {
        animRunning = false;
        if (rafId) { cancelAnimationFrame(rafId); rafId = null; lastTs = null; }
    }

    // Pause/resume on hover
    viewport.addEventListener("mouseenter", pause, { passive: true });
    viewport.addEventListener("mouseleave", () => setTimeout(play, 120), { passive: true });

    // Only run when visible
    const io = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) play();
            else pause();
        });
    }, { threshold: 0.35 });
    io.observe(viewport);

    // Flip animation (click/tap/keyboard)
    track.querySelectorAll(".speaker-card").forEach(card => {
        card.addEventListener("click", () => card.classList.toggle("is-flipped"));
        card.addEventListener("keydown", e => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                card.classList.toggle("is-flipped");
            }
        });
    });

    // start initially if visible
    setTimeout(() => {
        if (viewport.getBoundingClientRect().top < window.innerHeight) play();
    }, 200);
});



// ===== Speakers heading animation on scroll =====
document.addEventListener("DOMContentLoaded", () => {
    const heading = document.querySelector(".speakers h2");
    if (!heading) return;

    const io = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                heading.classList.add("is-visible");
            } else {
                heading.classList.remove("is-visible");
            }
        });
    }, { threshold: 0.3 }); // lower threshold = smoother trigger

    io.observe(heading);
});

// ===== Animate Heading on Scroll =====
document.addEventListener("DOMContentLoaded", () => {
    const heading = document.querySelector(".gallery h2");
    if (!heading) return;

    const io = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                heading.classList.add("is-visible");
            } else {
                heading.classList.remove("is-visible");
            }
        });
    }, { threshold: 0.3 }); // lower threshold = smoother trigger

    io.observe(heading);

    // ===== Duplicate Images for Infinite Loop =====
    const track = document.querySelector(".slider-track");
    track.innerHTML += track.innerHTML; // clone once for seamless loop
});

// 
// Animate heading + cards on scroll
// Animate heading + cards on scroll
document.addEventListener("DOMContentLoaded", () => {
    const archiveHeading = document.querySelector(".archives h2");
    const cards = document.querySelectorAll(".archive-card");

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
            }
        });
    }, { threshold: 0.2 });

    observer.observe(archiveHeading);
    cards.forEach(card => observer.observe(card));

    // Subtle tilt effect on hover
    cards.forEach(card => {
        card.addEventListener("mousemove", e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / 10) * -1;
            const rotateY = (x - centerX) / 10;
            card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });
        card.addEventListener("mouseleave", () => {
            card.style.transform = "rotateX(0) rotateY(0)";
        });
    });
});


// ===== LAZY IMAGE LOADING =====
function lazyLoadImages() {
    const images = document.querySelectorAll(".gallery-item img");

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                const src = img.dataset.src;
                if (src) {
                    img.src = src;
                    img.onload = () => {
                        img.classList.add("loaded"); // fade-in effect
                        img.dataset.loaded = "true";
                    };
                    img.removeAttribute("data-src");
                }
                obs.unobserve(img);
            }
        });
    }, { rootMargin: "100px" });

    images.forEach(img => observer.observe(img));
}

// ===== FILTER FUNCTIONALITY =====
const filterBtns = document.querySelectorAll(".filter-btn");
const galleryItems = document.querySelectorAll(".gallery-item");

filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelector(".filter-btn.active")?.classList.remove("active");
        btn.classList.add("active");

        const year = btn.dataset.filter;

        galleryItems.forEach(item => {
            if (year === "all" || item.dataset.year === year) {
                item.classList.remove("hide");
            } else {
                item.classList.add("hide");
            }
        });

        lazyLoadImages(); // ensure visible items load
    });
});

// Initial lazy load
lazyLoadImages();

// ===== LIGHTBOX FUNCTIONALITY =====
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.querySelector(".lightbox-content");
const closeBtn = document.querySelector("#lightbox .close");
const prevArrow = document.querySelector(".lightbox-arrow.left");
const nextArrow = document.querySelector(".lightbox-arrow.right");

let currentIndex = -1;

function getVisibleImages() {
    return [...document.querySelectorAll(".gallery-item:not(.hide) img.loaded")];
}

function showLightbox(index) {
    const visibleImages = getVisibleImages();
    if (!visibleImages.length) return;
    currentIndex = index;
    lightbox.style.display = "flex";
    lightboxImg.src = visibleImages[currentIndex].src;
}

// Open lightbox on click (only for loaded images)
document.addEventListener("click", e => {
    if (e.target.matches(".gallery-item img.loaded")) {
        const visibleImages = getVisibleImages();
        const index = visibleImages.indexOf(e.target);
        if (index !== -1) showLightbox(index);
    }
});

// Close lightbox
closeBtn.addEventListener("click", () => lightbox.style.display = "none");
lightbox.addEventListener("click", e => {
    if (e.target === lightbox) lightbox.style.display = "none";
});

// Navigate
prevArrow.addEventListener("click", () => {
    const visibleImages = getVisibleImages();
    if (!visibleImages.length) return;
    currentIndex = (currentIndex - 1 + visibleImages.length) % visibleImages.length;
    lightboxImg.src = visibleImages[currentIndex].src;
});

nextArrow.addEventListener("click", () => {
    const visibleImages = getVisibleImages();
    if (!visibleImages.length) return;
    currentIndex = (currentIndex + 1) % visibleImages.length;
    lightboxImg.src = visibleImages[currentIndex].src;
});

// Keyboard support
document.addEventListener("keydown", e => {
    if (lightbox.style.display === "flex") {
        if (e.key === "Escape") lightbox.style.display = "none";
        if (e.key === "ArrowLeft") prevArrow.click();
        if (e.key === "ArrowRight") nextArrow.click();
    }
});


// know more page sidebar









