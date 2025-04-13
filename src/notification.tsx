// src/components/Notifications.tsx
import React, { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';

interface Notification {
    type: 'ORDER_UPDATE' | 'INVENTORY_UPDATE' | 'SUPPLY_REQUEST_UPDATE';
    [key: string]: any;
}
const clientId = 'frontend-user-123'; // Generate a unique ID per user
const socket = io('ws://localhost:3333', {
    transports: ['websocket'], // Ensure only WebSocket transport
    query: { clientId: 'frontend-user-123' },
  });


const Notifications: React.FC<{ subdomain: string }> = ({ subdomain }) => {
    // const [socket, setSocket] = useState<Socket | null>(null);
    // const [notifications, setNotifications] = useState<Notification[]>([]);

    // useEffect(() => {
    //     const socketUrl = 'http://127.0.0.1:3333/notifications';
    //     console.log('Attempting to connect to:', socketUrl); // Debug endpoint
    //     const newSocket = io(socketUrl, {
    //         query: { subdomain },
    //         transports: ['websocket'],
    //     });

    //     setSocket(newSocket);

    //     newSocket.on('connect', () => {
    //         console.log('Connected to notifications');
    //         newSocket.emit('joinRestaurant', subdomain);
    //     });

    //     newSocket.on('notification', (message: Notification) => {
    //         console.log('Received notification:', message);
    //         setNotifications((prev) => [...prev, message]);
    //     });

    //     newSocket.on('joined', (data: { message: string }) => {
    //         console.log(data.message);
    //     });

    //     newSocket.on('connect_error', (err) => {
    //         console.error('Connection error:', err.message);
    //         console.error('Full error:', err);
    //     });

    //     return () => {
    //         newSocket.disconnect();
    //         console.log('Disconnected from notifications');
    //     };
    // }, [subdomain]);
    // console.log(socket, 'socket');
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        socket.on('connect', () => {
            console.log('WebSocket connected!');
          });
          
          socket.on('disconnect', () => {
            console.log('WebSocket disconnected!');
          });
    }, []);

    return (
        <div>
            <h2>Notifications for {subdomain}</h2>
            {notifications.length === 0 ? (
                <p>No notifications yet</p>
            ) : (
                <ul>
                </ul>
            )}
        </div>
    );
};

export default Notifications;