import React from 'react'
import { IoIosArrowRoundBack } from "react-icons/io";
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaBagShopping, FaArrowRight, FaUtensils } from "react-icons/fa6";
import CartItemCard from '../components/CartItemCard';
import Footer from '../components/ui/Footer';

function CartPage() {
    const navigate = useNavigate()
    const { cartItems, totalAmount } = useSelector(state => state.user)
    return (
        <div className='min-h-screen bg-blinkit-bg flex flex-col'>
            <button className='back-btn' onClick={() => navigate("/")}>
                <IoIosArrowRoundBack size={20} className="text-blinkit-green" />
                <span>Back</span>
            </button>
            <div className='w-full max-w-[800px] mx-auto px-4 sm:px-6 py-6 flex-1'>
                <div className='flex items-center gap-4 mb-8 mt-8 animate-fade-up'>
                    <div className='w-12 h-12 rounded-2xl bg-[linear-gradient(135deg,#F95B23,#D53A0B)] grid place-items-center text-white shadow-glow shrink-0'>
                        <FaBagShopping size={20} />
                    </div>
                    <div>
                        <h1 className='font-display text-2xl sm:text-3xl font-extrabold text-blinkit-text tracking-tight leading-none'>Your Cart</h1>
                        <p className='text-sm text-blinkit-text-secondary font-medium mt-1.5'>{cartItems.length} item{cartItems.length === 1 ? '' : 's'} · ready when you are</p>
                    </div>
                </div>
                {cartItems?.length == 0 ? (
                    <div className='card !rounded-3xl py-16 flex flex-col items-center text-center animate-fade-up' style={{ animationDelay: '.08s' }}>
                        <div className='w-20 h-20 rounded-3xl bg-blinkit-green-soft grid place-items-center mb-5 animate-bob'>
                            <FaBagShopping size={34} className='text-blinkit-green-dark' />
                        </div>
                        <h2 className='font-display text-xl font-bold text-blinkit-text mb-1.5'>Your cart is empty</h2>
                        <p className='text-blinkit-text-muted text-sm font-medium mb-6 max-w-xs'>Looks like your cart is waiting for something delicious.</p>
                        <button className='btn btn-primary !px-7' onClick={() => navigate("/")}>
                            <FaUtensils size={15} /> Explore Food
                        </button>
                    </div>
                ) : (<>
                    <div className='space-y-4'>
                        {cartItems?.map((item, index) => (
                            <CartItemCard data={item} index={index} key={index} />
                        ))}
                    </div>
                    <div className='mt-6 bg-white card !rounded-2xl p-5 sm:p-6 shadow-card animate-fade-up' style={{ animationDelay: '.1s' }}>
                        <div className='flex flex-wrap justify-between items-center gap-4'>
                            <div>
                                <h1 className='text-sm font-bold text-blinkit-text-muted uppercase tracking-wider'>Total Amount</h1>
                                <span className='text-2xl font-extrabold text-blinkit-green tracking-tight tabular-nums mt-0.5 inline-block'>₹{totalAmount}</span>
                                <p className='text-[11px] font-medium text-blinkit-text-muted mt-1.5'>Delivery fees calculated at checkout</p>
                            </div>
                            <button className='btn btn-primary !px-7 !py-3.5 text-[15px]' onClick={() => navigate("/checkout")}>
                                Proceed to Checkout
                                <FaArrowRight size={14} />
                            </button>
                        </div>
                    </div>
                </>
                )}
            </div>
            <Footer />
        </div>
    )
}

export default CartPage
