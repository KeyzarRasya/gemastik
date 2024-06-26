import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import './navigation.css'; // Import the CSS file
import '@fortawesome/fontawesome-free/css/all.min.css';

function Navigation() {
    const [click, setClick] = useState(false);
    const [button, setButton] = useState(true);
  
    const handleClick = () => setClick(!click);
    const closeMobileMenu = () => setClick(false);
  
    const showButton = () => {
      if (window.innerWidth <= 960) {
        setButton(false);
      } else {
        setButton(true);
      }
    };
  
    useEffect(() => {
      showButton();
      window.addEventListener('resize', showButton);
    return () => window.removeEventListener('resize', showButton);
  }, []);
  
  
    return (
      <>
        <nav className='navbar'>
          <div className='navbar-container'>
            <a href='/' className='navbar-logo' onClick={closeMobileMenu}>
              LATIVA
            </a>
            <div className='menu-icon' onClick={handleClick}>
              <i className={click ? 'fas fa-times' : 'fas fa-bars'} />
            </div>
            <ul className={click ? 'nav-menu active' : 'nav-menu'}>
              <li className='nav-item'>
                <a href='/' className='nav-links' onClick={closeMobileMenu}>
                  Home
                </a>
              </li>
              <li className='nav-item'>
                <a href='/services' className='nav-links' onClick={closeMobileMenu}>
                  Services
                </a>
              </li>
              <li className='nav-item'>
                <a href='/products' className='nav-links' onClick={closeMobileMenu}>
                  About
                </a>
              </li>
              <li className='nav-item'>
            {button && <Button buttonStyle='btn--outline'>LAPORKAN</Button>}
            </li>
            </ul>
          </div>
        </nav>
      </>
    );
  }
export default Navigation;
