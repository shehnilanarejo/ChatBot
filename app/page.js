'use client';

import { Box, Button, Stack, TextField } from '@mui/material';
import { useState, useRef, useEffect } from 'react';

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm the Headstarter support assistant. How can I help you today?",
    },
  ]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Define predefined questions and answers
  const predefinedResponses = {
    'hello': "Hello, how can I assist you?",
    'what is your name': "My name is ChatBot.",
    'what is headstarter': "HeadStarter is an IT company.",
    'how is your day': "My day is good.",
    'i am little bit feeling down today': "Don't feel down, do some reading and stuff.",
    'which book should i read': "Any comic, any genre you like."
  };

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;

    const newMessage = { role: 'user', content: message };
    setMessage('');
    setMessages((prevMessages) => [...prevMessages, newMessage, { role: 'assistant', content: '' }]);

    setIsLoading(true);

    // Convert message to lowercase for case-insensitive matching
    const responseText = predefinedResponses[message.trim().toLowerCase()] || "Sorry, I don't understand that question.";

    // Simulate streaming response
    const simulatedStream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          // Simulate delay for streaming
          await new Promise(resolve => setTimeout(resolve, 500));

          const text = encoder.encode(responseText);
          controller.enqueue(text);
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    const reader = simulatedStream.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        setMessages((prevMessages) => {
          const lastMessage = prevMessages.pop(); // Remove the placeholder
          return [...prevMessages, { ...lastMessage, content: lastMessage.content + text }];
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: 'assistant', content: "I'm sorry, but I encountered an error. Please try again later." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      sx={{ backgroundColor: '#f5f5f5', padding: 2 }}
    >
      <Stack
        direction="column"
        width="90%"
        maxWidth="500px"
        height="70%"
        border="1px solid #ddd"
        borderRadius={4}
        boxShadow={3}
        p={2}
        spacing={3}
        bgcolor="white"
      >
        <Stack direction="column" spacing={2} flexGrow={1} overflow="auto">
          {messages.map((message, index) => (
            <Box key={index} display="flex" justifyContent={message.role === 'assistant' ? 'flex-start' : 'flex-end'}>
              <Box
                bgcolor={message.role === 'assistant' ? 'primary.main' : 'secondary.main'}
                color="white"
                borderRadius={16}
                p={2}
                m={0.5}
                boxShadow={2}
                maxWidth="75%"
              >
                {message.content}
              </Box>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Stack>
        <Stack direction="row" spacing={2}>
          <TextField
            label="Message"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            variant="outlined"
          />
          <Button variant="contained" onClick={sendMessage} disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send'}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
