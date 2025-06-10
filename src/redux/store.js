import { configureStore, combineReducers } from '@reduxjs/toolkit';
import documentReducer from './slices/DocumentSlice';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage
import { persistReducer, persistStore } from 'redux-persist';

// Persist config
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['document'], // only persist this slice
};

// Combine reducers (in case you add more later)
const rootReducer = combineReducers({
  document: documentReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

// Create store
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // required for redux-persist
    }),
});

export const persistor = persistStore(store);
export default store;
