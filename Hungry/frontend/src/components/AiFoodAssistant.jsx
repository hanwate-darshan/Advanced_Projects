import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { serverUrl } from '../App';
import { useSelector, useDispatch } from 'react-redux';
import { addToCart } from '../redux/userSlice';
import VegBadge from './ui/VegBadge';
import {
  FaWandMagicSparkles,
  FaXmark,
  FaPaperPlane,
  FaRotateRight,
  FaPlus,
  FaCheck,
  FaUtensils,
  FaLocationDot
} from 'react-icons/fa6';

const QUICK_PROMPTS = [
  '⚡ Under ₹150 snacks',
  '🍕 Cheesy Pizza & Burgers',
  '🥗 Healthy Veg options',
  '🍰 Sweet Desserts',
  '🔥 Top Rated in my city'
];

export default function AiFoodAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: "Namaste foodie! 👋 I'm your Hungry AI Food Concierge. Ask me about your cravings, favorite cuisine, budget, or late-night bites!",
      items: []
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [addedItemMap, setAddedItemMap] = useState({});

  const { currentCity, userData } = useSelector(state => state.user);
  const dispatch = useDispatch();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-hungry-ai', handleOpen);
    return () => window.removeEventListener('open-hungry-ai', handleOpen);
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!userData || userData.role !== 'user') return null;

  const handleSend = async (customText = null) => {
    const query = (customText || input).trim();
    if (!query || loading) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      items: []
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = messages
        .filter(m => m.id !== 'welcome')
        .slice(-4)
        .map(m => ({ sender: m.sender, text: m.text }));

      const res = await axios.post(
        `${serverUrl}/api/recommendations/chat`,
        {
          message: query,
          city: currentCity || '',
          history
        },
        { withCredentials: true }
      );

      if (res.data?.success) {
        const botMsg = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: res.data.reply || "Here's what I found for you:",
          items: res.data.items || []
        };
        setMessages(prev => [...prev, botMsg]);
      } else {
        throw new Error('Failed to get recommendation');
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          sender: 'bot',
          text: "Oops, I had a little hiccup finding dishes! Could you try asking again?",
          items: []
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (item) => {
    dispatch(
      addToCart({
        id: item._id,
        name: item.name,
        price: item.price,
        image: item.image,
        shop: item.shop?._id || item.shop,
        quantity: 1,
        foodType: item.foodType
      })
    );

    setAddedItemMap(prev => ({ ...prev, [item._id]: true }));
    setTimeout(() => {
      setAddedItemMap(prev => ({ ...prev, [item._id]: false }));
    }, 2000);
  };

  return (
    <div className='fixed bottom-5 right-5 z-[9990] font-sans'>
      {/* Floating Trigger Button matching Hungry Brand */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className='btn bg-[linear-gradient(135deg,#F95B23,#F0410F_60%,#D53A0B)] !text-white !py-3 !px-4.5 !rounded-full shadow-glow hover:shadow-lift hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer flex items-center gap-2.5 border border-white/20'
          title='Ask Hungry AI Assistant'
        >
          <span className='relative flex h-2.5 w-2.5'>
            <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-blinkit-yellow opacity-85'></span>
            <span className='relative inline-flex rounded-full h-2.5 w-2.5 bg-blinkit-yellow'></span>
          </span>
          <FaWandMagicSparkles size={14} className='text-blinkit-yellow animate-pulse' />
          <span className='font-display font-extrabold text-xs tracking-wide hidden sm:inline'>
            Hungry AI
          </span>
          <span className='chip !py-0.5 !px-1.5 bg-white/20 text-white text-[10px] uppercase font-bold tracking-wider'>
            Assistant
          </span>
        </button>
      )}

      {/* Chat Window matching Hungry Design System */}
      {isOpen && (
        <div className='w-[92vw] sm:w-[380px] h-[530px] max-h-[85vh] bg-white rounded-[28px] border border-blinkit-border shadow-card flex flex-col overflow-hidden animate-fade-up'>
          {/* Header - Hungry Dark Brand Gradient */}
          <div className='p-4 bg-[linear-gradient(135deg,#2B120A_0%,#7A1F08_35%,#C13A0C_70%,#F0410F_100%)] text-white flex items-center justify-between relative overflow-hidden'>
            <div className='absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-xl' />

            <div className='flex items-center gap-3 relative z-10'>
              <div className='w-9 h-9 rounded-2xl bg-white/15 backdrop-blur border border-white/20 flex items-center justify-center text-blinkit-yellow shadow-inner'>
                <FaWandMagicSparkles size={16} />
              </div>
              <div>
                <h4 className='font-display font-extrabold text-sm tracking-tight flex items-center gap-1.5'>
                  <span>Hungry AI Assistant</span>
                  <span className='w-2 h-2 rounded-full bg-emerald-400' />
                </h4>
                <div className='flex items-center gap-1 text-[11px] text-white/80 mt-0.5'>
                  <FaLocationDot size={9} className='text-blinkit-yellow' />
                  <span>{currentCity ? `Delivering in ${currentCity}` : 'Your personal food guide'}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className='w-8 h-8 rounded-full hover:bg-white/20 text-white/90 hover:text-white flex items-center justify-center transition cursor-pointer relative z-10'
              title='Close Assistant'
            >
              <FaXmark size={15} />
            </button>
          </div>

          {/* Messages Stream - Light Warm Hungry Canvas */}
          <div className='flex-1 p-4 overflow-y-auto space-y-3.5 bg-blinkit-bg/60 text-xs'>
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-blinkit-green text-white font-medium rounded-tr-xs shadow-soft'
                      : 'bg-white border border-blinkit-border text-blinkit-text rounded-tl-xs shadow-soft'
                  }`}
                >
                  {msg.text}
                </div>

                {/* Suggested Dishes - Native Hungry Food Cards */}
                {msg.items && msg.items.length > 0 && (
                  <div className='w-full mt-2.5 space-y-2 pl-0.5'>
                    <span className='text-[10px] font-bold uppercase tracking-wider text-blinkit-text-muted flex items-center gap-1'>
                      <FaUtensils size={9} className='text-blinkit-green' />
                      <span>Recommended from your city:</span>
                    </span>
                    <div className='space-y-2'>
                      {msg.items.map(item => (
                        <div
                          key={item._id}
                          className='p-3 rounded-2xl bg-white border border-blinkit-border shadow-soft flex items-center justify-between gap-3 hover:border-blinkit-green/40 hover:shadow-card transition-all duration-200'
                        >
                          <div className='flex items-center gap-2.5 min-w-0'>
                            <div className='w-12 h-12 rounded-xl bg-blinkit-bg overflow-hidden shrink-0 border border-blinkit-border-light flex items-center justify-center'>
                              {item.image ? (
                                <img src={item.image} alt={item.name} className='w-full h-full object-cover' />
                              ) : (
                                <FaUtensils className='text-blinkit-text-muted text-xs' />
                              )}
                            </div>
                            <div className='min-w-0 flex-1'>
                              <div className='flex items-center gap-1.5'>
                                <VegBadge type={item.foodType} size='sm' />
                                <h5 className='font-bold text-blinkit-text text-xs truncate' title={item.name}>
                                  {item.name}
                                </h5>
                              </div>
                              <p className='text-[11px] text-blinkit-text-secondary truncate mt-0.5'>
                                {item.shop?.name || item.category || 'Restaurant'}
                              </p>
                              <span className='font-extrabold text-blinkit-green text-sm tracking-tight tabular-nums mt-0.5 block'>
                                ₹{item.price}
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => handleAddToCart(item)}
                            className={`btn !py-1.5 !px-3.5 !rounded-full text-xs font-bold transition shrink-0 ${
                              addedItemMap[item._id]
                                ? 'bg-emerald-600 text-white'
                                : 'btn-primary'
                            }`}
                          >
                            {addedItemMap[item._id] ? (
                              <>
                                <FaCheck size={10} />
                                <span>Added</span>
                              </>
                            ) : (
                              <>
                                <FaPlus size={10} />
                                <span>Add</span>
                              </>
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className='flex items-center gap-2 text-blinkit-text-secondary text-[11px] font-medium p-2.5 bg-white rounded-2xl border border-blinkit-border w-fit shadow-soft animate-pulse'>
                <FaRotateRight className='animate-spin text-blinkit-green text-xs' />
                <span>Hungry AI is finding delicious dishes for you...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Pills */}
          <div className='px-3.5 py-2 bg-white border-t border-blinkit-border-light flex gap-1.5 overflow-x-auto no-scrollbar'>
            {QUICK_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                type='button'
                onClick={() => handleSend(prompt)}
                disabled={loading}
                className='chip !text-[10px] whitespace-nowrap bg-blinkit-bg hover:bg-blinkit-green-soft hover:text-blinkit-green-dark border border-blinkit-border cursor-pointer transition disabled:opacity-50'
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSend();
            }}
            className='p-3 bg-white border-t border-blinkit-border flex items-center gap-2'
          >
            <input
              type='text'
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask Hungry AI (e.g. 'Spicy snacks under ₹150')..."
              className='input !rounded-xl !py-2.5 !text-xs !bg-blinkit-bg flex-1'
              disabled={loading}
            />
            <button
              type='submit'
              disabled={loading || !input.trim()}
              className='btn btn-primary !p-2.5 !rounded-xl !w-9 !h-9 flex items-center justify-center shrink-0 disabled:opacity-40 disabled:cursor-not-allowed'
              title='Send'
            >
              <FaPaperPlane size={11} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
