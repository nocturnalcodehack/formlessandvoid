import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
//= Data
import appData from 'src/data/app-data.json';

function Navbar() {
  const navbarRef = useRef(null);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function handleScroll() {
    const bodyScroll = window.scrollY;
    const navbar = navbarRef.current;

    if (navbar) {
      if (bodyScroll > 300) navbar.classList.add("nav-scroll");
      else navbar.classList.remove("nav-scroll");
    }
  }

  function handleDropdownMouseMove(event) {
    const dropdownMenu = event.currentTarget.querySelector('.dropdown-menu');
    if (dropdownMenu) {
      dropdownMenu.classList.add('show');
    }
  }

  function handleDropdownMouseLeave(event) {
    const dropdownMenu = event.currentTarget.querySelector('.dropdown-menu');
    if (dropdownMenu) {
      dropdownMenu.classList.remove('show');
    }
  }

  function handleDropdownSideMouseMove(event) {
    const dropdownSide = event.currentTarget.querySelector('.dropdown-side');
    if (dropdownSide) {
      dropdownSide.classList.add('show');
    }
  }

  function handleDropdownSideMouseLeave(event) {
    const dropdownSide = event.currentTarget.querySelector('.dropdown-side');
    if (dropdownSide) {
      dropdownSide.classList.remove('show');
    }
  }

  function toggleNavbar() {
    const navbarCollapse = document.querySelector(".navbar .navbar-collapse");
    if (navbarCollapse) {
      navbarCollapse.classList.toggle("show");
    }
  }

  return (
    <nav ref={navbarRef} className="navbar navbar-expand-lg static">
      <div className="container">
        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation" onClick={toggleNavbar} >
          <span className="icon-bar"><i className="fas fa-bars"></i></span>
        </button>

        <div className="collapse navbar-collapse justify-content-center" id="navbarSupportedContent">
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link className="nav-link" href="/"><span className="rolling-text">Home</span></Link>
            </li>
            <li className="nav-item dropdown" onMouseMove={handleDropdownMouseMove} onMouseLeave={handleDropdownMouseLeave}>
              <a className="nav-link dropdown-toggle" data-toggle="dropdown" href="#" role="button" aria-haspopup="true" aria-expanded="false"><span className="rolling-text">Surveys</span></a>
              <div className="dropdown-menu">
                <Link key='urv1' className="dropdown-item" href='/'>placeholder</Link>
                {/* appData.surveys.map((survey, index) => (
                  <Link key={index} className="dropdown-item" href={survey.link}>{survey.name}</Link>
                )) */}
              </div>
            </li>
            <li className="nav-item">
              <Link className="nav-link" href="/dark/page-contact"><span className="rolling-text">Contact</span></Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  )
}

export default Navbar