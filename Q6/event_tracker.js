
(function() {

    /**
     * Creates a descriptive string for a given HTML element.
     * @param {HTMLElement} element - The element to describe.
     * @returns {string} A description of the element (e.g., "BUTTON (id: submit-btn)").
     */
    function getElementDescription(element) {
        // Start with the element's tag name (e.g., DIV, BUTTON, A)
        let description = element.tagName;

        // Add the element's ID if it has one
        if (element.id) {
            description += ` (id: ${element.id})`;
        }
        // Add the element's class if it has one
        else if (element.className) {
            description += ` (class: ${element.className})`;
        }
        // Add some text content as a fallback for elements like <p> or <h1>
        else if (element.textContent) {
            // Trim whitespace and limit the text content to 20 characters
            const text = element.textContent.trim().substring(0, 20);
            description += ` (text: "${text}...")`;
        }

        return description;
    }

    /**
     * Formats and logs the event data to the console.
     * @param {string} type - The type of event ('view' or 'click').
     * @param {string} objectDescription - The description of the event object.
     */
    function logEvent(type, objectDescription) {
        // Get a standardized ISO 8601 timestamp
        const timestamp = new Date().toISOString();

        // Format the output string as per the assignment requirements
        const output = `${timestamp}, event_type: ${type}, event_object: ${objectDescription}`;
        
        // Print the final formatted string to the browser's console
        console.log(output);
    }

    /**
     * Sets up the event listeners to capture views and clicks.
     */
    function initialize() {
        // 1. CAPTURE PAGE VIEW
        // The 'DOMContentLoaded' event fires as soon as the page's HTML has been loaded.
        document.addEventListener('DOMContentLoaded', () => {
            // Log the page view event, using the document title as the object description
            logEvent('view', `Page - "${document.title}"`);
        });

        // 2. CAPTURE ALL CLICK EVENTS
        // Add a single click listener to the entire document. This uses "event bubbling"
        // to efficiently capture a click on any element on the page.
        document.addEventListener('click', (event) => {
            // 'event.target' is the specific element that was clicked
            const clickedElement = event.target;
            
            // Get a description of the clicked element
            const description = getElementDescription(clickedElement);

            // Log the click event
            logEvent('click', description);
        });
        
        console.log("Event tracker initialized.");
    }

    // Start the event tracker
    initialize();

})();