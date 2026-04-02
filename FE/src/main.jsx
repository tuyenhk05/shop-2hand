/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
import { createRoot } from 'react-dom/client';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import allReducers from './reducers/index';
import './index.css';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import App from './App.jsx'

const store = createStore(allReducers);

createRoot(document.getElementById('root')).render(
    <Provider store={store}>
        <BrowserRouter>
             <App />
        </BrowserRouter>
  </Provider>
)
