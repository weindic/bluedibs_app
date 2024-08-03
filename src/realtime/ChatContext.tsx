import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import io from 'socket.io-client';

const SOCKET_SERVER_URL = 'ws://localhost:3000'; // Replace with your WebSocket server URL
const CHAT_ROOMS_API_URL = 'http://localhost:3000/vip-chat-box/chat-rooms';
const MESSAGES_API_URL = 'http://localhost:3000/vip-chat-box/getAllMessages';
const TIMER_API_URL = 'http://localhost:3000/vip-chat-box/update-timer'; // Replace with your Timer API URL

interface Message {
  id: string;
  message: string;
}

interface ChatRoom {
  id: string;
  userOne: string;
  userTwo: string;
  timer: number; // Added timer field
}

interface ChatState {
  messages: Message[];
  chatRooms: ChatRoom[];
  chatRoomID: string | null;
  setRoomId: (chatRoomID: string) => void; // Function to set roomId
  updateTimer: (chatRoomID: string, timerValue: number) => void; // Function to update timer
  getTimer: (chatRoomID: string) => Promise<number | undefined>; // Function to get timer
}

interface ChatStateProviderProps {
  children: ReactNode;
}

const ChatStateContext = createContext<ChatState | undefined>(undefined);

export const ChatStateProvider: React.FC<ChatStateProviderProps> = ({ children }: any) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [chatRoomID, setRoomIdInternal] = useState<string | null>(null);

  // Function to set roomId and fetch messages for the roomId
  const setRoomId = (chatRoomID: string) => {
    setRoomIdInternal(chatRoomID);
    fetchMessages(chatRoomID);
  };

  const fetchMessages = async (chatRoomID: string) => {
    try {
      const response = await fetch(`${MESSAGES_API_URL}/${chatRoomID}`);
      const messagesData = await response.json();
      console.log('Fetched messages:', messagesData);
      setMessages(messagesData);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const fetchChatRooms = async (userId: string) => {
    try {
      const response = await fetch(`${CHAT_ROOMS_API_URL}/${userId}`);
      const chatRoomsData = await response.json();
      console.log('Fetched chat rooms:', chatRoomsData);
      setChatRooms(chatRoomsData);
      if (chatRoomsData.length > 0) {
        setRoomIdInternal(chatRoomsData[0].id); // Set the first chat room as the active one
      }
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
    }
  };

  const updateTimer = async (chatRoomID: string, timerValue: string) => {
    const socket = io(SOCKET_SERVER_URL);
    try {
      await fetch(`${TIMER_API_URL}/${chatRoomID}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ timerValue }),
      });
      socket.emit('update-timer', { roomId: chatRoomID, timerValue });
    } catch (error) {
      console.error('Error updating timer:', error);
    }
  };

  const getTimer = async (chatRoomID: string): Promise<number | undefined> => {
    try {
      const response = await fetch(`${TIMER_API_URL}/${chatRoomID}`);
      const data = await response.json();
      return data.timer;
    } catch (error) {
      console.error('Error fetching timer:', error);
    }
  };

  useEffect(() => {
    const socket = io(SOCKET_SERVER_URL);

    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
      const localData: any = localStorage.getItem('bluedibs:user');
      const storedUserId = JSON.parse(localData)?.id;

      if (storedUserId) {
        socket.emit('register', { userId: storedUserId });
      }
    });

    socket.on('message', (newMessage: Message) => {
      console.log('Received new message:', newMessage);
      setMessages((prevMessages: Message[]) => [...prevMessages, newMessage]);
    });

    socket.on('update', () => {
      console.log('Received update');
      if (chatRoomID) {
        fetchMessages(chatRoomID);
      }
    });

    socket.on('timer-update', (data: { roomId: string; timerValue: number }) => {
      console.log('Received timer update:', data);
      setChatRooms((prevChatRooms) =>
        prevChatRooms.map((room) =>
          room.id === data.roomId ? { ...room, timer: data.timerValue } : room
        )
      );
    });

    socket.on('error', (error: any) => {
      console.error('WebSocket error:', error);
    });

    return () => {
      console.log('Disconnecting WebSocket...');
      socket.disconnect();
    };
  }, [chatRoomID]);

  useEffect(() => {
    const localData: any = localStorage.getItem('bluedibs:user');
    const storedUserId = JSON.parse(localData)?.id;

    if (storedUserId) {
      fetchChatRooms(storedUserId);
    }
  }, []);

  return (
    <ChatStateContext.Provider
      value={{ messages, chatRooms, chatRoomID, setRoomId, updateTimer, getTimer }}
    >
      {children}
    </ChatStateContext.Provider>
  );
};

export const useChatState = () => {
  const context = useContext(ChatStateContext);
  if (context === undefined) {
    throw new Error('useChatState must be used within a ChatStateProvider');
  }
  return context;
};
