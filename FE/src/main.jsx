/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
import { createRoot } from 'react-dom/client';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import allReducers from './reducers/index';
import './index.css';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import App from './App.jsx';

const store = createStore(allReducers);

const theme = {
    token: {
        colorPrimary: '#4c6545',
        borderRadius: 8,
        fontFamily: 'Manrope, sans-serif'
    }
};

createRoot(document.getElementById('root')).render(
    <Provider store={store}>
        <ConfigProvider theme={theme}>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </ConfigProvider>
    </Provider>
);
