const API_KEY = 'AIzaSyDqNwMo5hbubYMcpiGJ3a5jMqwOWk9oTfs';

// From here, response will come
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

// Getting the chat-messages class from css file
const chatMessages = document.getElementById('chat-messages');

// Getting the user-input class from css file
const userInput = document.getElementById('user-input');

// Getting the send-button class from css file
const sendButton = document.getElementById('send-button');

// Defines an asynchronous function `generateResponse` that takes the user's input (prompt) and generates a response from the API.
async function generateResponse(prompt) {

    // Sends a POST request to the Gemini API endpoint with the API key appended to the URL.
    const response = await fetch(`${API_URL}?key=${API_KEY}`, {

        // Specifies the HTTP method (POST) to send data to the API.
        method: 'POST',

        // Sets the request headers to indicate that the content being sent is in JSON format.
        headers: {
            'Content-Type': 'application/json',
        },

        // The body of the request, converting the user's message into the format required by the API.
        body: JSON.stringify({
            contents: [
                {
                    parts: [
                        {
                            // The user's input (`prompt`) is inserted into the request payload.
                            text: prompt
                        }
                    ]
                }
            ]
        })
    });

    // Checks if the API request was unsuccessful (i.e., the response is not OK).
    if (!response.ok) {
        // If there's an error, an exception is thrown with an error message.
        throw new Error('Failed to generate response');
    }

    // Converts the API response to JSON format.
    const data = await response.json();

    // Returns the first generated response from the API (the text part of the response).
    return data.candidates[0].content.parts[0].text;
} 

// Defines a function `cleanMarkdown` to remove any Markdown formatting (like headers, bold text, etc.) from the response.
function cleanMarkdown(text) {
    
        return text
            // Removes any Markdown headers (e.g., #, ##, ###).
            .replace(/#{1,6}\s?/g, '')
            
            // Removes bold formatting (double asterisks **).
            .replace(/\*\*/g, '')
    
            // Limits excessive newlines to a maximum of two (replaces more than two newlines with two).
            .replace(/\n{3,}/g, '\n\n')
    
            // Removes any whitespace from the start and end of the string.
            .trim();
}


// Defines a function `addMessage` to add a new message to the chat display. It takes the `message` (text) and `isUser` (boolean indicating whether the message is from the user or the bot).
function addMessage(message, isUser) {
    // Creates a new `div` element for the message and adds the 'message' CSS class.
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    
    // Adds a class based on whether the message is from the user ('user-message') or the bot ('bot-message').
    messageElement.classList.add(isUser ? 'user-message' : 'bot-message');
    
    // Creates an image element for the profile picture (either the user or the bot) and adds the 'profile-image' CSS class.
    const profileImage = document.createElement('img');
    profileImage.classList.add('profile-image');
        
    // Sets the image source depending on whether it's a user or bot message ('user.jpg' or 'bot.jpg').
    profileImage.src = isUser ? 'user.jpg' : 'bot.jpg';
        
    // Sets the alternate text for the image (for accessibility), either 'User' or 'Bot'.
    profileImage.alt = isUser ? 'User' : 'Bot';
       
    // Creates a `div` element to hold the text content of the message and adds the 'message-content' CSS class.
    const messageContent = document.createElement('div');
    messageContent.classList.add('message-content');
        
    // Sets the text content of the message.
    messageContent.textContent = message;
        
    // Appends the profile image and message content to the message element.
    messageElement.appendChild(profileImage);
    messageElement.appendChild(messageContent);
       
    // Appends the complete message (with profile image and text) to the chat messages section.
    chatMessages.appendChild(messageElement);
        
    // Scrolls the chat to the bottom to ensure the latest message is visible.
    chatMessages.scrollTop = chatMessages.scrollHeight;
}


// Defines an asynchronous function `handleUserInput` to process and handle the user’s input.
async function handleUserInput() {
    
    // Retrieves the user input from the input field and trims any leading/trailing whitespace.
    const userMessage = userInput.value.trim();
        
    // If the user has entered a message (i.e., it's not empty):
    if (userMessage) {
        // Adds the user's message to the chat (as a user message).
        addMessage(userMessage, true);
        
        // Clears the input field.
        userInput.value = '';
        
        // Disables the send button and the input field to prevent multiple messages being sent while the bot responds.
        sendButton.disabled = true;
        userInput.disabled = true;
    
        try {
            // Calls the `generateResponse` function to get the bot's reply.
            const botMessage = await generateResponse(userMessage);
    
            // Adds the bot's cleaned response to the chat.
            addMessage(cleanMarkdown(botMessage), false);
        } catch (error) {
            // Logs any error that occurs during the bot response.
            console.error('Error:', error);
    
            // Displays an error message in the chat if something goes wrong.
            addMessage('Sorry, I encountered an error. Please try again.', false);
        } finally {
            // Re-enables the send button and the input field, and puts the focus back on the input for further user interaction.
            sendButton.disabled = false;
            userInput.disabled = false;
            userInput.focus();  
        }
    }
}
// Adds an event listener to the send button that calls `handleUserInput` when clicked.    
sendButton.addEventListener('click', handleUserInput);
    
 
// Adds an event listener for when a key is pressed in the input field.
userInput.addEventListener('keypress', (e) => {
    
    // Checks if the 'Enter' key is pressed and Shift is not held (to distinguish from Shift+Enter for newlines).
    if (e.key === 'Enter' && !e.shiftKey) {
    
    // Prevents the default behavior of adding a newline.
    e.preventDefault();
        
    
    // Calls `handleUserInput` to send the message.
    handleUserInput();
    }
});