import { getDatabase, push, ref, onChildAdded, set, get } from '@firebase/database'
import { FirebaseError } from '@firebase/util'
import { getAuth } from 'firebase/auth';
import { FormEvent, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import './Timeline.css'

interface Message {
  content: string;
  author: {
    authorId: string;
    name: string;
    icon: string;
  };
  timestamp: string;
  parentId?: string;
}

const OriginalMessagePreview = ({ parentId, scrollToMessage }: { parentId: string, scrollToMessage: (id: string) => void }) => {
  const { eventId } = useParams();
  const [originalMessage, setOriginalMessage] = useState<Message | null>(null);

  useEffect(() => {
    const fetchOriginalMessage = async () => {
      const db = getDatabase();
      const originalMessageRef = ref(db, `events/${eventId}/messages/${parentId}`);
      const snapshot = await get(originalMessageRef);
      if (snapshot.exists()) {
        setOriginalMessage(snapshot.val());
      }
    };

    if (parentId) {
      fetchOriginalMessage();
    }
  }, [eventId, parentId]);

  if (!originalMessage) return null;

  return (
    <div 
      className="originalMessagePreview" 
      onClick={() => scrollToMessage(parentId)}
      style={{ opacity: 0.5 }}
    >
      {originalMessage.author.name}: {originalMessage.content}
    </div>
  );
};

const Timeline = () => {
  const { eventId } = useParams()
  const [message, setMessage] = useState<string>("")
  const [messages, setMessages] = useState<{ [key: string]: Message }>({})
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState<string>("");
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);

  const messageRefs = useRef<{ [key: string]: HTMLDivElement }>({});
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const auth = getAuth();
  const user = auth.currentUser

  const scrollToMessage = (id: string) => {
    setHighlightedMessageId(id);
    messageRefs.current[id]?.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => setHighlightedMessageId(null), 3000);
  };

  useEffect(() => {
    const db = getDatabase();
    const messagesRef = ref(db, `events/${eventId}/messages`);

    const unsubscribe = onChildAdded(messagesRef, (snapshot) => {
      const key = snapshot.key;
      const value = snapshot.val();
      setMessages((prev) => {
        const updateMessages = { ...prev, [key!]: value };
        if (endOfMessagesRef.current) {
          endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' });
        }
        return updateMessages;
      });
    });

    return () => unsubscribe();
  }, [eventId]);

  const handleSendMessage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      const db = getDatabase();
      const messagesRef = ref(db, `events/${eventId}/messages`);
      const currentUser = { authorId: user?.uid!, name: user?.displayName!, icon: user?.photoURL! };
      const newMessage: Message = {
        content: message,
        author: currentUser,
        timestamp: new Date().toISOString(),
      };

      await push(messagesRef, newMessage);
      setMessage('');
      if (inputRef.current) {
        inputRef.current.focus();
      }
    } catch (e) {
      if (e instanceof FirebaseError) {
        console.error(e);
      }
    }
  };

  const handleReply = async (messageId: string) => {
    if (!replyContent.trim()) return;
  
    try {
      const db = getDatabase();
      const newReplyRef = push(ref(db, `events/${eventId}/messages`));
      await set(newReplyRef, {
        content: replyContent,
        author: {
          authorId: user?.uid!,
          name: user?.displayName!,
          icon: user?.photoURL!,
        },
        timestamp: new Date().toISOString(),
        parentId: messageId,
      });
  
      setReplyContent('');
      setReplyingTo(null); 
    } catch (e) {
      if (e instanceof FirebaseError) {
        console.error(e);
      }
    }
  };

  return (
    <div>
      <h1>Timeline for Event {eventId}</h1>
      <div className="messageList">
        {Object.entries(messages)
          .map(([key, message]) => (
            <div key={key} ref={(el) => { if (el) messageRefs.current[key] = el; }} className={`message ${highlightedMessageId === key ? 'highlight' : ''}`}>
              {message.parentId && (
                <OriginalMessagePreview parentId={message.parentId} scrollToMessage={scrollToMessage} />
              )}
              <div className="messageHeader">
                <img src={message.author.icon} alt={message.author.name} className="messageIcon" />
                <div>
                  <div className="messageAuthor">{message.author.name}</div>
                  <div className="messageContent">{message.content}</div>
                </div>
                <div className="messageTimestamp">{message.timestamp}</div>
              </div>
              <button onClick={() => setReplyingTo(key)}>Reply</button>
              {replyingTo === key && (
                <form onSubmit={(e) => { e.preventDefault(); handleReply(key); }}>
                  <input
                    type="text"
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Write a reply..."
                  />
                  <button type="submit">Send Reply</button>
                </form>
              )}
            </div>
          ))}
      </div>
      <div ref={endOfMessagesRef} />
      <form onSubmit={handleSendMessage} className='sendMessageForm'>
        <input
          ref={inputRef}
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write a message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  )
}

export default Timeline