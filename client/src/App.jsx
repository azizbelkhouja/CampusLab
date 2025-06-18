import axios from 'axios'
import { Route, Routes } from 'react-router'
import { ToastContainer } from 'react-toastify'
import AdminRoute from './AdminRoute'
import Dip from './pages/Dip'
import Home from './pages/Home'
import Login from './pages/Login'
import Seminario from './pages/Seminario'
import Purchase from './pages/Purchase'
import Register from './pages/Register'
import Schedule from './pages/Schedule'
import Search from './pages/Search'
import Showtime from './pages/Showtime'
import Tickets from './pages/Tickets'
import User from './pages/User'

axios.defaults.baseURL = import.meta.env.VITE_SERVER_URL || 'http://localhost:8080'
axios.defaults.withCredentials = true

function App() {
	return (
		<>
			<ToastContainer />
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/login" element={<Login />} />
				<Route path="/register" element={<Register />} />
				<Route path="/dip" element={<Dip />} />
				<Route
					path="/seminario"
					element={
						<AdminRoute>
							<Seminario />
						</AdminRoute>
					}
				/>
				<Route
					path="/search"
					element={
						<AdminRoute>
							<Search />
						</AdminRoute>
					}
				/>
				<Route path="/showtime/:id" element={<Showtime />} />
				<Route path="/purchase/:id" element={<Purchase />} />
				<Route path="/ticket" element={<Tickets />} />
				<Route path="/schedule" element={<Schedule />} />
				<Route
					path="/user"
					element={
						<AdminRoute>
							<User />
						</AdminRoute>
					}
				/>
			</Routes>
		</>
	)
}

export default App
