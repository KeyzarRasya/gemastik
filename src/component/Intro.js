import React from 'react';
import '../App.css';
import { Button } from './Button';
import './intro.css';

function Intro() {
  return (
    <div className='hero-container'>
      <img src='./Image/lativa.jpg' alt="Company logo"/ >
      <h1>MARIO DANDI</h1>
      <p>jangan sampai mario dandi terulang</p>
      <div className='hero-btns'>
        <Button
          buttonStyle='btn--outline'
          buttonSize='btn--large'
          href='/get-started' // Adjust the href as needed
        >
          <span>PERIKSA</span>
        </Button>
      </div>
    </div>
  );
}

export default Intro;
