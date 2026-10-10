import React, { useEffect, useRef, useState } from 'react'
import Nav from './Nav'
import { categories } from '../category'
import CategoryCard from './CategoryCard'
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { FaStore, FaBurger, FaLocationDot, FaWandMagicSparkles } from "react-icons/fa6";
import { FaSearch } from "react-icons/fa";
import { useSelector } from 'react-redux';
import FoodCard from './FoodCard';
import { useNavigate } from 'react-router-dom';
import { CategoryRowSkeleton, FoodGridSkeleton } from './ui/Skeleton';
import { EmptyState } from './ui/Feedback';
import Footer from './ui/Footer';
import image4 from '../assets/image4.avif'
import image5 from '../assets/image5.jpg'
import image3 from '../assets/image3.jpg'
import image9 from '../assets/image9.jpg'

function ScrollButton({ show, dir, onClick }) {
  if (!show) return null
  return (
    <button
      className={`${dir === 'left' ? 'left-0' : 'right-0'} absolute top-1/2 -translate-y-1/2 w-10 h-10 grid place-items-center bg-white/90 backdrop-blur border border-blinkit-border text-blinkit-green rounded-full shadow-card z-20 cursor-pointer transition-all duration-200 hover:bg-white hover:scale-110`}
      onClick={onClick}
      aria-label={dir === 'left' ? 'Scroll left' : 'Scroll right'}
    >
      {dir === 'left' ? <FaChevronLeft size={16} /> : <FaChevronRight size={16} />}
    </button>
  )
}

function RowTitle({ icon: Icon, children, action }) {
  return (
    <div className='flex items-center justify-between w-full'>
      <h2 className='section-title flex items-center gap-2.5'>
        {Icon && <span className='w-9 h-9 grid place-items-center rounded-xl bg-blinkit-green-soft text-blinkit-green-dark'><Icon size={16} /></span>}
        {children}
      </h2>
      {action}
    </div>
  )
}

function Hero() {
  const { currentCity } = useSelector(state => state.user)
  const heroImages = [
    { src: image4, rotate: "-rotate-3", top: "top-6", left: "left-6" },
    { src: image5, rotate: "rotate-6", top: "top-24", left: "left-36" },
    { src: image3, rotate: "-rotate-6", top: "top-14", left: "left-64" },
    { src: image9, rotate: "rotate-3", top: "top-28", left: "left-8" },
  ]
  return (
    <section className='w-full max-w-6xl px-5 pt-4'>
      <div className='relative overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,#2B120A_0%,#7A1F08_35%,#C13A0C_70%,#F0410F_100%)] p-7 sm:p-10 md:p-14 text-white animate-fade-up'>
        <div className='absolute -top-20 -right-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-blob' />
        <div className='absolute -bottom-24 left-1/3 w-80 h-80 bg-blinkit-yellow/20 rounded-full blur-3xl animate-blob' style={{ animationDelay: '2s' }} />

        <div className='relative grid grid-cols-1 md:grid-cols-2 gap-10 items-center'>
          <div>
            <span className='chip bg-white/15 backdrop-blur ring-1 ring-white/20 mb-4'>
              <FaLocationDot size={12} className='text-blinkit-yellow' />
              Delivering to {currentCity || "your location"}
            </span>
            <h1 className='font-display text-4xl sm:text-[52px] font-extrabold leading-[1.04] tracking-tight max-w-xl'>
              Good food.<br />Great mood.
            </h1>
            <p className='text-white/80 mt-4 max-w-md sm:text-[15px] leading-relaxed'>
              Discover delicious meals from your favorite restaurants and get them delivered to your doorstep.
            </p>
            <div className='flex flex-wrap items-center gap-3 mt-7'>
              <button className='btn bg-white !text-blinkit-text !px-6 !py-3 text-sm font-bold shadow-card hover:shadow-lift' onClick={() => document.getElementById("popular-food")?.scrollIntoView({ behavior: "smooth" })}>
                <FaBurger size={15} className='text-blinkit-green' />
                Explore Food
              </button>
              <button className='btn bg-white/10 backdrop-blur ring-1 ring-white/25 !px-6 !py-3 text-sm font-semibold hover:bg-white/20' onClick={() => document.getElementById("popular-shops")?.scrollIntoView({ behavior: "smooth" })}>
                <FaStore size={15} />
                View Restaurants
              </button>
            </div>
          </div>

          <div className='relative h-[260px] sm:h-[300px] hidden md:block' aria-hidden="true">
            {heroImages.map((img, i) => (
              <img
                key={i}
                src={img.src}
                alt=""
                className={`absolute w-36 h-36 object-cover rounded-3xl shadow-lift ring-4 ring-white/20 ${img.rotate} ${img.top} ${img.left} transition-transform duration-700 hover:scale-105`}
                style={{ animationDelay: `${i * 0.4}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function UserDashboard() {
  const { currentCity, shopInMyCity, itemsInMyCity, searchItems, recommendedItems } = useSelector(state => state.user)
  const cateScrollRef = useRef()
  const shopScrollRef = useRef()
  const navigate = useNavigate()
  const [showLeftCateButton, setShowLeftCateButton] = useState(false)
  const [showRightCateButton, setShowRightCateButton] = useState(false)
  const [showLeftShopButton, setShowLeftShopButton] = useState(false)
  const [showRightShopButton, setShowRightShopButton] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [updatedItemsList, setUpdatedItemsList] = useState([])

  const handleFilterByCategory = (category) => {
    if (!category || category === "All" || selectedCategory === category) {
      setSelectedCategory("All")
      setUpdatedItemsList(itemsInMyCity || [])
      return
    }

    setSelectedCategory(category)
    const catLower = category.toLowerCase().trim()

    const filteredList = itemsInMyCity?.filter(item => {
      const itemCat = (item.category || "").toLowerCase().trim()
      const itemName = (item.name || "").toLowerCase().trim()

      // Exact match
      if (itemCat === catLower) return true

      // Singular / Plural match (e.g. Burgers / Burger, Desserts / Dessert)
      const catRoot = catLower.replace(/s$/, '')
      const itemRoot = itemCat.replace(/s$/, '')
      if (catRoot && itemRoot && catRoot === itemRoot) return true

      // Smart semantic matching for popular food categories:
      if (catLower.includes("burger") && (itemCat.includes("burger") || itemName.includes("burger"))) return true
      if (catLower.includes("pizza") && (itemCat.includes("pizza") || itemName.includes("pizza"))) return true
      if (catLower.includes("dessert") && (itemCat.includes("dessert") || itemName.includes("cake") || itemName.includes("ice cream") || itemName.includes("coffee") || itemName.includes("sundae") || itemName.includes("frappe") || itemName.includes("lava"))) return true
      if (catLower.includes("snack") && (itemCat.includes("snack") || itemName.includes("fries") || itemName.includes("breadstick") || itemName.includes("vada") || itemName.includes("samosa") || itemName.includes("samora"))) return true
      if (catLower.includes("main course") && (itemCat.includes("main course") || itemName.includes("biryani") || itemName.includes("meal") || itemName.includes("rice bowl") || itemName.includes("curry") || itemName.includes("thali"))) return true
      if (catLower.includes("fast food") && (itemCat.includes("fast food") || itemName.includes("wings") || itemName.includes("pasta") || itemName.includes("noodles") || itemName.includes("roll"))) return true
      if (catLower.includes("south indian") && (itemCat.includes("south indian") || itemName.includes("dosa") || itemName.includes("dhosa") || itemName.includes("idli") || itemName.includes("wada"))) return true
      if (catLower.includes("north indian") && (itemCat.includes("north indian") || itemName.includes("bhaji") || itemName.includes("paneer") || itemName.includes("roti") || itemName.includes("dal"))) return true
      if (catLower.includes("chinese") && (itemCat.includes("chinese") || itemName.includes("manchurian") || itemName.includes("noodles") || itemName.includes("fried rice"))) return true
      if (catLower.includes("sandwich") && (itemCat.includes("sandwich") || itemName.includes("sandwich") || itemName.includes("toast"))) return true

      return false
    })

    setUpdatedItemsList(filteredList || [])

    // Smoothly scroll down to food section so user immediately sees results
    setTimeout(() => {
      const foodSection = document.getElementById("popular-food")
      if (foodSection) {
        foodSection.scrollIntoView({ behavior: "smooth", block: "start" })
      }
    }, 60)
  }

  useEffect(() => {
    if (selectedCategory === "All") {
      setUpdatedItemsList(itemsInMyCity || [])
    } else {
      handleFilterByCategory(selectedCategory)
    }
  }, [itemsInMyCity])

  const updateButton = (ref, setLeftButton, setRightButton) => {
    const element = ref.current
    if (element) {
      setLeftButton(element.scrollLeft > 0)
      setRightButton(element.scrollLeft + element.clientWidth < element.scrollWidth)
    }
  }
  const scrollHandler = (ref, direction) => {
    if (ref.current) {
      ref.current.scrollBy({
        left: direction == "left" ? -200 : 200,
        behavior: "smooth"
      })
    }
  }

  useEffect(() => {
    const cateEl = cateScrollRef.current
    const shopEl = shopScrollRef.current

    const handleCate = () => updateButton(cateScrollRef, setShowLeftCateButton, setShowRightCateButton)
    const handleShop = () => updateButton(shopScrollRef, setShowLeftShopButton, setShowRightShopButton)

    if (cateEl) {
      cateEl.addEventListener('scroll', handleCate)
      updateButton(cateScrollRef, setShowLeftCateButton, setShowRightCateButton)
    }
    if (shopEl) {
      shopEl.addEventListener('scroll', handleShop)
      updateButton(shopScrollRef, setShowLeftShopButton, setShowRightShopButton)
    }

    return () => {
      if (cateEl) cateEl.removeEventListener('scroll', handleCate)
      if (shopEl) shopEl.removeEventListener('scroll', handleShop)
    }
  }, [shopInMyCity, itemsInMyCity])

  const shopsLoading = shopInMyCity === null
  const itemsLoading = itemsInMyCity === null

  return (
    <div className='w-full min-h-screen flex flex-col items-center bg-blinkit-bg'>
      <Nav />

      <div className='w-full max-w-6xl pt-[110px] flex flex-col gap-8 pb-8'>
        <Hero />

        {searchItems && searchItems.length > 0 && (
          <section className='w-full px-5'>
            <div className='card p-5 sm:p-6 animate-fade-up'>
              <RowTitle icon={FaSearch}>Search Results</RowTitle>
              <div className='w-full h-auto flex flex-wrap gap-5 justify-center mt-5'>
                {searchItems.map((item, index) => (
                  <FoodCard data={item} index={index} key={item._id} />
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="w-full flex flex-col gap-4 px-5 animate-fade-up" style={{ animationDelay: '.06s' }}>
          <RowTitle icon={FaBurger}>Inspiration for your first order</RowTitle>
          <div className='relative w-full'>
            <ScrollButton show={showLeftCateButton} dir="left" onClick={() => scrollHandler(cateScrollRef, "left")} />
            <div className='w-full flex overflow-x-auto gap-4 pb-2 no-scrollbar scroll-smooth' ref={cateScrollRef}>
              {categories.map((cate, index) => (
                <CategoryCard
                  name={cate.category}
                  image={cate.image}
                  index={index}
                  key={index}
                  onClick={() => handleFilterByCategory(cate.category)}
                  isActive={selectedCategory === cate.category}
                />
              ))}
            </div>
            <ScrollButton show={showRightCateButton} dir="right" onClick={() => scrollHandler(cateScrollRef, "right")} />
          </div>
        </section>

        {(recommendedItems === null || recommendedItems?.length > 0) && (
          <section className='w-full flex flex-col gap-4 px-5 animate-fade-up' style={{ animationDelay: '.09s' }}>
            <RowTitle icon={FaWandMagicSparkles}>Recommended for you</RowTitle>
            {recommendedItems === null ? (
              <FoodGridSkeleton count={3} />
            ) : (
              <div className='w-full h-auto flex flex-wrap gap-5 justify-center'>
                {recommendedItems.map((item, index) => (
                  <FoodCard key={item._id || index} data={item} index={index} reason={item.reason} />
                ))}
              </div>
            )}
          </section>
        )}

        <section id="popular-shops" className='w-full flex flex-col gap-4 px-5 animate-fade-up' style={{ animationDelay: '.12s' }}>
          <RowTitle icon={FaStore}>Best restaurants in {currentCity}</RowTitle>
          {shopsLoading ? (
            <CategoryRowSkeleton count={5} />
          ) : shopInMyCity?.length > 0 ? (
            <div className='relative w-full'>
              <ScrollButton show={showLeftShopButton} dir="left" onClick={() => scrollHandler(shopScrollRef, "left")} />
              <div className='w-full flex overflow-x-auto gap-4 pb-2 no-scrollbar scroll-smooth' ref={shopScrollRef}>
                {shopInMyCity.map((shop, index) => (
                  <CategoryCard name={shop.name} image={shop.image} index={index} key={shop._id || index} onClick={() => navigate(`/shop/${shop._id}`)} />
                ))}
              </div>
              <ScrollButton show={showRightShopButton} dir="right" onClick={() => scrollHandler(shopScrollRef, "right")} />
            </div>
          ) : (
            <div className='card py-10'>
              <EmptyState
                compact
                icon={FaStore}
                title="No restaurants nearby yet"
                text="Restaurants in your city will appear here once available."
              />
            </div>
          )}
        </section>

        <section id="popular-food" className='w-full flex flex-col gap-4 px-5 animate-fade-up' style={{ animationDelay: '.18s' }}>
          <RowTitle icon={FaBurger}>Popular Food</RowTitle>
          {itemsLoading ? (
            <FoodGridSkeleton count={6} />
          ) : updatedItemsList?.length > 0 ? (
            <div className='w-full h-auto flex flex-wrap gap-5 justify-center'>
              {updatedItemsList.map((item, index) => (
                <FoodCard key={item._id || index} data={item} index={index} />
              ))}
            </div>
          ) : (
            <div className='card py-10'>
              <EmptyState
                compact
                icon={FaBurger}
                title="No dishes found in this category yet"
                text="Try another category to discover something tasty."
              />
            </div>
          )}
        </section>
      </div>

      <Footer />
    </div>
  )
}

export default UserDashboard
