'use client';

import { useEcommerceStore } from '@/zustand/ecommerce-store-zustand';
import { motion } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { ShoppingCart } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import ShoppingCartNav from './ShoppingCartNav';

export default function SidebarEcommerce() {
  const { cartLength } = useEcommerceStore();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const { height } = useDimensions(containerRef);

  return (
  
      <motion.nav
        initial={false}
        animate={isOpen ? 'open' : 'closed'}
        custom={height}
        ref={containerRef}
        style={nav}
        
      >
        {/* Animated blue background */}
        <motion.div
          style={{...background, pointerEvents: isOpen ? 'auto' : 'none', zIndex: 55}}
          variants={sidebarVariants}
          className="flex items-center justify-center"
        >
            <ShoppingCartNav />
        </motion.div>

        {/* Toggle button */}
        <MenuToggle toggle={() => setIsOpen(!isOpen)} badge={cartLength} />
      </motion.nav>
  
  );
}

/* ================== Animation Variants ================== */
const sidebarVariants = {
  open: (height = 1000) => ({
    clipPath: `circle(${height * 2 + 200}px at calc(100% - 40px) 43px)`,
    transition: {
      type: 'spring',
      stiffness: 20,
      restDelta: 2,
    },
  }),
  closed: {
    clipPath: 'circle(30px at calc(100% - 40px) 43px)',
    transition: {
      delay: 0.2,
      type: 'spring',
      stiffness: 400,
      damping: 40,
    },
  },
};

const Path = (props) => (
  <motion.path
    fill="transparent"
    strokeWidth="3"
    stroke="hsl(0, 0%, 18%)"
    strokeLinecap="round"
    {...props}
  />
);

const MenuToggle = ({ toggle, badge }) => (
  <button style={toggleContainer} onClick={toggle}>
    <motion.div
      className="relative"
      variants={{
        closed: { rotate: 0, scale: 1, opacity: 1 },
        open: { scale: 1.05, opacity: 1 },
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <ShoppingCart className="h-6 w-6 text-white" />
      <span className="absolute -top-2 right-2 z-50 size-5 rounded-full bg-red-500">
        <p className="text-xs text-white">{badge}</p>
      </span>
    </motion.div>
  </button>
);

/* ================== Styles ================== */

const nav = {
  width: 400,
  position: 'fixed', // ✅ fix to the screen
  top: 0,
  right: 0,
  height: '100vh',
  zIndex: 50,
  overflow: 'hidden',
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'flex-start',
  background: 'transparent',
  pointerEvents: 'none', // allow clicks to pass through by default
};

const background = {
  backgroundColor: 'black',
  position: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  width: 400,
  height: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const toggleContainer = {
  outline: 'none',
  border: 'none',
  WebkitUserSelect: 'none',
  MozUserSelect: 'none',
  cursor: 'pointer',
  position: 'absolute',
  top: 18,
  right: 15, // ✅ button on right side
  width: 50,
  height: 50,
  borderRadius: '50%',
  background: 'transparent',
  zIndex: 60,
  pointerEvents: 'auto', // always clickable
};

/* ================== Utils ================== */

const useDimensions = (ref) => {
  const dimensions = useRef({ width: 0, height: 0 });

  useEffect(() => {
    if (ref.current) {
      dimensions.current.width = ref.current.offsetWidth;
      dimensions.current.height = ref.current.offsetHeight;
    }
  }, [ref]);

  return dimensions.current;
};
