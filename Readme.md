# CS6.302-Software System Development - Assignment 2

- **Name:** Chinnikrishna
- **Roll Number:** 2025201073

---

## Question 1: Personal Website Hosting

* **Description:** The personal website from the previous class activity has been hosted on GitHub Pages.
* **Execution:** The page is live and can be accessed directly at the following URL:
    * [https://chinnikrishna07.github.io/Q1/](https://chinnikrishna07.github.io/Q1/)
* **Assumptions:** The primary goal was the successful hosting and deployment of the website on a `github.io` page. The content was based on the previous class activity.

## Question 2: SSD Course Website Redesign

* **Description:** An "ugly" placeholder website was transformed using modern CSS for styling and JavaScript for a dark mode toggle, without losing any information.
* **Execution:** The transformed webpage, `newssd.html`, is hosted on GitHub Pages and can be accessed here:
    * [https://chinnikrishna07.github.io/Q2/newssd.html](https://chinnikrishna07.github.io/Q2/newssd.html)
* **Assumptions:** Since the original "ugly" site was not provided, a representative HTML structure was created to serve as the base for the visual transformation.

## Question 3: Jigsaw Puzzle Maker

* **Description:** A single-page application built with JavaScript that allows a user to upload an image, select a difficulty level (number of pieces), and solve the resulting jigsaw puzzle using drag-and-drop.
* **Execution:** The page is live and can be accessed directly at the following URL:
    * [https://chinnikrishna07.github.io/Q3/](https://chinnikrishna07.github.io/Q3/)
* **Assumptions:**
    * The puzzle board has a fixed width to maintain a consistent layout; the uploaded image is scaled to fit.
    * The grid dimensions (rows x columns) for each difficulty level were chosen to be as rectangular as possible for a better user experience.

## Question 4: Stoplight Game (Nash Equilibrium)

* **Description:** A two-player (Human vs. Computer) game that illustrates the concept of Nash Equilibrium. The computer's inputs are random to determine the outcomes.The JavaScript code is commented line-by-line as required.
* **Execution:** The page is live and can be accessed directly at the following URL:
    * [https://chinnikrishna07.github.io/Q4/](https://chinnikrishna07.github.io/Q4/)
* **Assumptions:** The payoff matrix used is the standard model for a traffic light intersection game. The computer's strategy is purely random (50/50 chance) to simulate the unpredictable nature of another driver's actions without a coordinating signal.

## Question 5: Data Dictionary Tool

* **Description:** A single-page tool that reads a database schema definition (in JSON format) and generates a visual table-to-table relationship diagram and a detailed glossary. [cite_start]The output can be exported as a PDF.
* **Execution:** The page is live and can be accessed directly at the following URL:
    * [https://chinnikrishna07.github.io/Q5/](https://chinnikrishna07.github.io/Q5/)
* **Assumptions:** JSON was chosen as the input format due to its simplicity and native support in JavaScript. The provided SQL queries for generating the JSON are generic examples and may require modification for specific database versions.

## Question 6: User Event Tracker

* **Description:** A reusable JavaScript script (`event-tracker.js`) that captures all page views and click events across all HTML implementations (Q1-Q7). [cite_start]The output is printed to the browser's console in the specified format. [cite: 27, 28, 29]
* **Execution:** This script is already included in all other HTML files. To see the output, open any project page (e.g., Q3, Q4) and open the browser's Developer Console (`F12` or `Ctrl+Shift+I`).
* **Assumptions:** A "page view" event is logged when the `DOMContentLoaded` event fires. A "click" event is captured via a single event listener on the `document` to efficiently track all user clicks.

## Question 7: Bowling Alley Game

* **Description:** A 3D bowling alley game built using Three.js and a physics engine. The game features a full UI with aiming and power controls, a detailed scorecard, and implements the official rules of bowling for scoring (including strikes and spares).
* **Execution:** The page is live and can be accessed directly at the following URL:
    * [https://chinnikrishna07.github.io/Q7/](https://chinnikrishna07.github.io/Q7/)
* **Assumptions:**
    * The provided code was an advanced React component. It was successfully adapted into a standard HTML, CSS, and JavaScript project to meet the assignment's submission structure.
    * The physics simulation is simplified for gameplay and does not account for complex variables like lane oil patterns or realistic ball spin physics.