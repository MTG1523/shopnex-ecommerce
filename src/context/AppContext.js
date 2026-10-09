'use client';
import { createContext, useContext, useReducer, useEffect } from 'react';

const AppContext = createContext(null);

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'LOGOUT':
      return { ...state, user: null, cart: [] };
    case 'ADD_TO_CART': {
      const existing = state.cart.find(i => i.productId === action.payload.productId);
      if (existing) {
        return {
          ...state,
          cart: state.cart.map(i =>
            i.productId === action.payload.productId
              ? { ...i, quantity: i.quantity + 1 }
              : i
          ),
        };
      }
      return { ...state, cart: [...state.cart, { ...action.payload, quantity: 1 }] };
    }
    case 'REMOVE_FROM_CART':
      return { ...state, cart: state.cart.filter(i => i.productId !== action.payload) };
    case 'UPDATE_QTY':
      if (action.payload.qty <= 0) {
        return { ...state, cart: state.cart.filter(i => i.productId !== action.payload.productId) };
      }
      return {
        ...state,
        cart: state.cart.map(i =>
          i.productId === action.payload.productId ? { ...i, quantity: action.payload.qty } : i
        ),
      };
    case 'CLEAR_CART':
      return { ...state, cart: [] };
    case 'TOGGLE_CART':
      return { ...state, cartOpen: !state.cartOpen };
    case 'CLOSE_CART':
      return { ...state, cartOpen: false };
    case 'ADD_TOAST':
      return { ...state, toasts: [...state.toasts, { id: Date.now(), ...action.payload }] };
    case 'REMOVE_TOAST':
      return { ...state, toasts: state.toasts.filter(t => t.id !== action.payload) };
    default:
      return state;
  }
}

const initialState = {
  user: null,
  cart: [],
  cartOpen: false,
  toasts: [],
};

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState, (init) => {
    if (typeof window === 'undefined') return init;
    try {
      const savedUser = localStorage.getItem('shopnex_user');
      const savedCart = localStorage.getItem('shopnex_cart');
      return {
        ...init,
        user: savedUser ? JSON.parse(savedUser) : null,
        cart: savedCart ? JSON.parse(savedCart) : [],
      };
    } catch { return init; }
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('shopnex_user', JSON.stringify(state.user));
  }, [state.user]);

  useEffect(() => {
    localStorage.setItem('shopnex_cart', JSON.stringify(state.cart));
  }, [state.cart]);

  // Auto dismiss toasts
  useEffect(() => {
    if (state.toasts.length > 0) {
      const timer = setTimeout(() => {
        dispatch({ type: 'REMOVE_TOAST', payload: state.toasts[0].id });
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [state.toasts]);

  const actions = {
    login: (user, token) => {
      localStorage.setItem('shopnex_token', token);
      dispatch({ type: 'SET_USER', payload: user });
    },
    logout: () => {
      localStorage.removeItem('shopnex_token');
      dispatch({ type: 'LOGOUT' });
    },
    addToCart: (product) => {
      dispatch({
        type: 'ADD_TO_CART',
        payload: {
          productId: product._id,
          name: product.name,
          price: product.price,
          category: product.category,
        },
      });
      dispatch({ type: 'ADD_TOAST', payload: { message: `${product.name} added to cart!`, type: 'success' } });
    },
    removeFromCart: (productId) => dispatch({ type: 'REMOVE_FROM_CART', payload: productId }),
    updateQty: (productId, qty) => dispatch({ type: 'UPDATE_QTY', payload: { productId, qty } }),
    clearCart: () => dispatch({ type: 'CLEAR_CART' }),
    toggleCart: () => dispatch({ type: 'TOGGLE_CART' }),
    closeCart: () => dispatch({ type: 'CLOSE_CART' }),
    toast: (message, type = 'info') => dispatch({ type: 'ADD_TOAST', payload: { message, type } }),
    apiRequest: async (url, options = {}) => {
      const token = localStorage.getItem('shopnex_token');
      return fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(options.headers || {}),
        },
      });
    },
  };

  return (
    <AppContext.Provider value={{ state, ...actions }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
