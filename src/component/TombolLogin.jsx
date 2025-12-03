import React, { useState } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import Button from 'react-bootstrap/Button';
import { NavLink } from 'react-router-dom';
import './componentStyle/LoginStyle.css';


function TombolLogin() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    
    const userData = {
        name: "Habibie",
        // Ganti dengan URL gambar profil yang nyata atau gunakan placeholder
        profilePicUrl: "/MovieTrack.png", 
    };

    const handleLogin = () => setIsLoggedIn(true);
    const handleLogout = () => setIsLoggedIn(false);

    if (isLoggedIn) {
        // --- KONDISI 1: SUDAH LOGIN (Tampilkan Gambar Profil & Dropdown) ---
        return (
            <Dropdown align="end"> 
                {/* Tombol Dropdown yang menampilkan Gambar Profil */}
                <Dropdown.Toggle as="div" id="dropdown-profile" className="p-0 border-0">
                    <img
                        src={userData.profilePicUrl}
                        alt="Profile"
                        className="profile-pic" 
                    />
                </Dropdown.Toggle>

                {/* Menu Dropdown */}
                <Dropdown.Menu>
                    <Dropdown.ItemText className="text-primary fw-bold">
                        Halo, {userData.name}!
                    </Dropdown.ItemText>
                    <Dropdown.Divider />
                    <Dropdown.Item as = {NavLink} to="/profile">Lihat Profil</Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={handleLogout} className="text-danger">
                        Logout
                    </Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>
        );
    } else {
        // --- KONDISI 2: BELUM LOGIN (Tampilkan Tombol Login Sederhana) ---
        return (
            <Button variant="primary" align="end" onClick={handleLogin}>
                Login
            </Button>
        );
    }
}

export default TombolLogin;