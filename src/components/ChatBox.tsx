import React, { useState, useRef, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { MessagesSquare, Send } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { cn } from '@/lib/utils';

export const ChatBox = () => {
  const { state, sendChatMessage, myPlayerId } = useGame();
  const [message, setMessage] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('div');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [state.chatMessages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      sendChatMessage(message.trim());
      setMessage('');
    }
  };

  return (
    <div className="flex h-full flex-col">
      <h4 className="mb-2 flex items-center justify-center gap-2 text-center font-heading font-semibold">
        <MessagesSquare className="h-5 w-5" />
        Chat
      </h4>
      <ScrollArea
        className="mb-2 h-48 flex-grow rounded-md border bg-black/10 p-2"
        ref={scrollAreaRef}
      >
        {state.chatMessages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              'mb-2 text-sm',
              msg.senderId === myPlayerId ? 'text-right' : 'text-left'
            )}
          >
            <div
              className={cn(
                'inline-block max-w-[80%] rounded-lg p-2',
                msg.senderId === myPlayerId
                  ? 'bg-primary/80 text-primary-foreground'
                  : 'bg-secondary'
              )}
            >
              <p className="text-xs font-bold">{msg.senderName}</p>
              <p className="break-words">{msg.message}</p>
            </div>
          </div>
        ))}
        {state.chatMessages.length === 0 && (
          <p className="p-4 text-center text-sm text-muted-foreground">
            No messages yet.
          </p>
        )}
      </ScrollArea>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          placeholder="Say something..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          autoComplete="off"
        />
        <Button type="submit" size="icon">
          <Send />
        </Button>
      </form>
    </div>
  );
};
