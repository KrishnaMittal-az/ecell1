import { useRef, useState, useEffect } from "react"
import { Link } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import { useTaskManagement } from "../contexts/TaskManagementContext";

export const Navbar = () => {
    const ref = useRef(null);
    const { user, userProfile, signOut, notifications } = useTaskManagement()
    const [showDropdown, setShowDropdown] = useState(false)

    const handleNavbar = () => {
        ref.current.classList.toggle('active');
    };

    const handleSignOut = async () => {
        try {
            await signOut()
        } catch (error) {
            console.error('Error signing out:', error)
        }
    }

    const unreadCount = notifications.filter(n => !n.read).length

    return (
        <header id="header" className="fixed-top d-flex align-items-center">
            <div className="container d-flex align-items-center relative">
                <h1 className="logo me-auto"><img src="assets/images/E-Cell_New_Logo.png" alt="img" /></h1>
                {/* <!-- <a href="index.html" className="logo me-auto"><img src="assets/img/logo.png" alt=""></a>--> */}

                <nav id="navbar" ref={ref} className="navbar order-last order-lg-0 py-0">
                    <ul>
                        <li><HashLink to="/#hero" className="nav-link scrollto active">Home</HashLink></li>
                        <li><HashLink to="/#partners" className="nav-link scrollto">Partners</HashLink></li>
                        <li><HashLink to="/#about" className="nav-link scrollto">About</HashLink></li>
                        <li><HashLink to="/#genie" className="nav-link scrollto">Genie</HashLink></li>
                        <li><HashLink to="/#gallery" className="nav-link scrollto">Gallery</HashLink></li>
                        <li><HashLink to="/#testimonials" className="nav-link scrollto">StartUps</HashLink></li>
                        <li><HashLink to="/#team" className="nav-link scrollto">Team</HashLink></li>
                        <li><HashLink to="/#mentor" className="nav-link scrollto">Mentors</HashLink></li>
                        <li><HashLink to="/#contact" className="nav-link scrollto">Contact</HashLink></li>

                        {/* Task Management Navigation */}
                        {user && userProfile && (
                            <>
                                <li className="nav-item dropdown">
                                    <a 
                                        className="nav-link dropdown-toggle" 
                                        href="#" 
                                        role="button" 
                                        data-bs-toggle="dropdown"
                                        aria-expanded="false"
                                    >
                                        📋 Tasks
                                        {unreadCount > 0 && (
                                            <span className="badge bg-danger ms-1">{unreadCount}</span>
                                        )}
                                    </a>
                                    <ul className="dropdown-menu">
                                        <li><Link className="dropdown-item" to="/tasks/dashboard">📊 Dashboard</Link></li>
                                        <li><Link className="dropdown-item" to="/tasks">📋 All Tasks</Link></li>
                                        {(userProfile.year === '2nd' || userProfile.year === '3rd') && (
                                            <>
                                                <li><hr className="dropdown-divider" /></li>
                                                <li><Link className="dropdown-item" to="/tasks/create">➕ Create Task</Link></li>
                                                <li><Link className="dropdown-item" to="/tasks/reviews">👀 Review Queue</Link></li>
                                            </>
                                        )}
                                        {userProfile.year === '1st' && (
                                            <li><Link className="dropdown-item" to="/tasks/my-tasks">📝 My Tasks</Link></li>
                                        )}
                                        {userProfile.year === '3rd' && (
                                            <>
                                                <li><hr className="dropdown-divider" /></li>
                                                <li><Link className="dropdown-item" to="/tasks/analytics">📈 Analytics</Link></li>
                                            </>
                                        )}
                                    </ul>
                                </li>
                                
                                {/* User Profile Dropdown */}
                                <li className="nav-item dropdown">
                                    <a 
                                        className="nav-link dropdown-toggle" 
                                        href="#" 
                                        role="button" 
                                        data-bs-toggle="dropdown"
                                        aria-expanded="false"
                                    >
                                        👤 {userProfile.name}
                                        <small className="ms-1 text-muted">({userProfile.year})</small>
                                    </a>
                                    <ul className="dropdown-menu">
                                        <li><span className="dropdown-item-text">
                                            <small className="text-muted">{userProfile.email}</small>
                                        </span></li>
                                        <li><hr className="dropdown-divider" /></li>
                                        <li>
                                            <button 
                                                className="dropdown-item" 
                                                onClick={handleSignOut}
                                            >
                                                🚪 Sign Out
                                            </button>
                                        </li>
                                    </ul>
                                </li>
                            </>
                        )}

                        {!user && (
                            <li>
                                <Link to="/login" className="get-started-btn scrollto">
                                    🔑 Sign In
                                </Link>
                            </li>
                        )}
                        
                        <a href="https://tedxglau.com" target="_blank" rel="noopener noreferrer" style={{ backgroundColor: "#E62B1E", color: "black", fontWeight: "bold", padding: "5px 10px", borderRadius: "5px", textDecoration: "none", transition: "background-color 0.3s", marginLeft: "25px" }} onMouseEnter={(e) => e.target.style.backgroundColor = "#D9241A"} onMouseLeave={(e) => e.target.style.backgroundColor = "#E62B1E"}>TEDxGLAU</a>
                    </ul>
                </nav>
                <input onClick={handleNavbar} type="checkbox" role="button" aria-label="Display the menu" className="menu"></input>
            </div>
        </header>
    )
}