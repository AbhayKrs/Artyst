import React, { useState } from 'react';

import LightMode from '../assets/icons/LightMode.svg';
import DarkMode from '../assets/icons/DarkMode.svg';

const ThemeToggle = ({ value, toggle }) => {

    const toggleFn = () => {
        const toggleBtn = document.querySelector('#toggle');

        toggle();
        if (value === "dark") {
            toggleBtn.classList.remove('bg-black');
            toggleBtn.classList.add('bg-white');
        } else {
            toggleBtn.classList.remove('bg-white');
            toggleBtn.classList.add('bg-black');
        }
    }

    return (
        <div className='relative self-center hover:cursor-pointer w-5 h-5' onClick={toggleFn}>
            <img className={`absolute inset-0 h-5 w-5 transition-all duration-500 ${value === "light" ? 'opacity-100' : 'opacity-0'}`} loading='lazy' src={LightMode} />
            <img className={`absolute inset-0 h-5 w-5 transition-all duration-500 ${value === "dark" ? 'opacity-100' : 'opacity-0'}`} loading='lazy' src={DarkMode} />
        </div>
    )
};

export default ThemeToggle;