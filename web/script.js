/**
 * SkillForge Landing Page JavaScript
 */

// Typewriter effect for CLI demo
const typewriterText = 'skillforge "Monitor Hacker News for AI tool launches and email me daily summaries"';
let charIndex = 0;
const typewriterEl = document.getElementById('typewriter');
const cliOutput = document.getElementById('cli-output');

function typeWriter() {
  if (charIndex < typewriterText.length) {
    typewriterEl.textContent += typewriterText.charAt(charIndex);
    charIndex++;
    setTimeout(typeWriter, 40 + Math.random() * 30);
  } else {
    // Show cursor blinking
    setTimeout(() => {
      typewriterEl.textContent = typewriterText;
      // Show output after a delay
      setTimeout(() => {
        cliOutput.style.display = 'block';
        cliOutput.style.opacity = '0';
        cliOutput.style.transition = 'opacity 0.3s';
        setTimeout(() => {
          cliOutput.style.opacity = '1';
        }, 50);
      }, 500);
    }, 800);
  }
}

// Start typewriter when page loads
window.addEventListener('load', () => {
  setTimeout(typeWriter, 1000);
});

// Copy code functionality
function copyCode(button) {
  const codeBlock = button.closest('.code-block');
  const code = codeBlock.querySelector('code').textContent;
  
  navigator.clipboard.writeText(code).then(() => {
    const originalText = button.textContent;
    button.textContent = 'Copied!';
    button.style.background = 'var(--success)';
    button.style.borderColor = 'var(--success)';
    button.style.color = 'white';
    
    setTimeout(() => {
      button.textContent = originalText;
      button.style.background = '';
      button.style.borderColor = '';
      button.style.color = '';
    }, 2000);
  });
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// Navbar background on scroll
const nav = document.querySelector('.nav');
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    nav.style.background = 'rgba(10, 10, 15, 0.95)';
  } else {
    nav.style.background = 'rgba(10, 10, 15, 0.8)';
  }
});

// Intersection Observer for fade-in animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

// Apply to sections
document.querySelectorAll('section:not(.hero)').forEach(section => {
  section.style.opacity = '0';
  section.style.transform = 'translateY(20px)';
  section.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
  observer.observe(section);
});

// Pricing card hover effect
document.querySelectorAll('.pricing-card').forEach(card => {
  card.addEventListener('mouseenter', () => {
    document.querySelectorAll('.pricing-card').forEach(c => {
      if (c !== card) {
        c.style.opacity = '0.7';
      }
    });
  });
  
  card.addEventListener('mouseleave', () => {
    document.querySelectorAll('.pricing-card').forEach(c => {
      c.style.opacity = '1';
    });
  });
});
