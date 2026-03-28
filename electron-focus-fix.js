// Focus fix for browser-based Electron app
console.log('Applying Electron focus fixes for browser-based app');

// Override any aggressive focus behavior
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, applying focus fixes');
    
    // Prevent focus-related field locking
    let focusTimeout;
    
    document.addEventListener('focus', function(e) {
        if (e.target.tagName === 'INPUT') {
            console.log('Input focused, preventing lock');
            clearTimeout(focusTimeout);
            
            // Gentle focus without aggressive behavior
            focusTimeout = setTimeout(() => {
                try {
                    if (e.target.select && e.target.value) {
                        e.target.select();
                    }
                } catch (err) {
                    console.log('Selection failed, but focus works');
                }
            }, 100);
        }
    }, true);
    
    // Prevent modal-like behavior
    document.addEventListener('click', function(e) {
        // Clear any problematic focus states
        setTimeout(() => {
            const activeElement = document.activeElement;
            if (activeElement && activeElement.tagName === 'INPUT') {
                const input = activeElement;
                if (input.disabled || input.readOnly) {
                    console.log('Detected locked input, releasing');
                    input.blur();
                    setTimeout(() => input.focus(), 50);
                }
            }
        }, 10);
    }, true);
});

// Prevent field locking on row selection
window.addEventListener('load', function() {
    console.log('Window loaded, applying global focus fixes');
    
    // Override any problematic focus methods
    const originalFocus = HTMLElement.prototype.focus;
    HTMLElement.prototype.focus = function() {
        try {
            return originalFocus.apply(this, arguments);
        } catch (e) {
            console.log('Focus prevented to avoid locking');
        }
    };
});
