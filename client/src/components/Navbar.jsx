import {
	ClockIcon,
	AcademicCapIcon,
	HomeModernIcon,
	FunnelIcon,
	TicketIcon,
	UsersIcon,
	VideoCameraIcon
} from '@heroicons/react/24/outline'
import { Bars3Icon } from '@heroicons/react/24/solid'
import axios from 'axios'
import { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { AuthContext } from '../context/AuthContext'

const Navbar = () => {
	const { auth, setAuth } = useContext(AuthContext)
	const [menuOpen, setMenuOpen] = useState(false)
	const [isLoggingOut, SetLoggingOut] = useState(false)

	const toggleMenu = () => {
		setMenuOpen(!menuOpen)
	}

	const navigate = useNavigate()

	const onLogout = async () => {
		try {
			SetLoggingOut(true)
			const response = await axios.get('/auth/logout')
			// console.log(response)
			setAuth({ username: null, email: null, role: null, token: null })
			sessionStorage.clear()
			navigate('/')
			toast.success('Disconnessione riuscita!', {
				position: 'top-center',
				autoClose: 2000,
				pauseOnHover: false
			})
		} catch (error) {
			console.error(error)
			toast.error('Errore durante la disconnessione', {
				position: 'top-center',
				autoClose: 2000,
				pauseOnHover: false
			})
		} finally {
			SetLoggingOut(false)
		}
	}

	const menuLists = () => {
		return (
			<>
				<div className="flex flex-col gap-2 lg:flex-row">
					<Link
						to={'/dip'}
						className={`flex items-center justify-center gap-2 px-2 py-1 ${
							window.location.pathname === '/dip'
								? 'border-b-2 border-black'
								: 'text-black'
						}`}
					>
						<HomeModernIcon className="h-6 w-6" />
						<p>Dipartimenti</p>
					</Link>
					<Link
						to={'/schedule'}
						className={`flex items-center justify-center gap-2 px-2 py-1 ${
							window.location.pathname === '/schedule'
								? 'border-b-2 border-black'
								: 'text-black '
						}`}
					>
						<ClockIcon className="h-6 w-6" />
						<p>Programma</p>
					</Link>
					{!auth.role === 'admin' && (
						<Link
							to={'/ticket'}
							className={`flex items-center justify-center gap-2 px-2 py-1 ${
								window.location.pathname === '/ticket'
									? 'border-b-2 border-black'
									: 'text-black '
							}`}
						>
							<TicketIcon className="h-6 w-6" />
							<p>Passo</p>
						</Link>
					)}
					{auth.role === 'admin' && (
						<>
							<Link
								to={'/seminario'}
								className={`flex items-center justify-center gap-2 px-2 py-1 ${
									window.location.pathname === '/seminario'
										? 'border-b-2 border-black'
										: 'text-black '
								}`}
							>
								<VideoCameraIcon className="h-6 w-6" />
								<p>Seminari</p>
							</Link>
							<Link
								to={'/search'}
								className={`flex items-center justify-center gap-2 px-2 py-1 ${
									window.location.pathname === '/search'
										? 'border-b-2 border-black'
										: 'text-black '
								}`}
							>
								<FunnelIcon className="h-6 w-6" />
								<p>Cerca</p>
							</Link>
							<Link
								to={'/user'}
								className={`flex items-center justify-center gap-2 px-2 py-1 ${
									window.location.pathname === '/user'
										? 'border-b-2 border-black'
										: 'text-black '
								}`}
							>
								<UsersIcon className="h-6 w-6" />
								<p>Utente</p>
							</Link>
						</>
					)}
				</div>
				<div className="flex grow items-center justify-center gap-3 lg:justify-end">
					{auth.username && (
						<p className="text-xl font-bold text-black">Welcome, {auth.username} !</p>
					)}
					{auth.token ? (
						<button
							className="bg-black px-5 py-2 text-white disabled:slate-500"
							onClick={() => onLogout()}
							disabled={isLoggingOut}
						>
							{isLoggingOut ? 'Elaborazione...' : 'Esci'}
						</button>
					) : (
						<button className="bg-black py-1 text-white px-3">
							<Link to={'/login'}>Login</Link>
						</button>
					)}
				</div>
			</>
		)
	}

	return (
		<nav className="flex flex-col items-center justify-between gap-2 bg-white border-b-[1px] border-[#213D72] px-4 py-3 lg:flex-row lg:justify-start sm:px-8">
			<div className="flex w-full flex-row justify-between lg:w-fit">
				<button className="flex flex-row items-center gap-2" onClick={() => navigate('/')}>
					<AcademicCapIcon className="h-8 w-8 text-black" />
					<h1 className="mr-4 text-xl text-black">CampusLab</h1>
				</button>
				<button
					className="flex h-8 w-8 items-center justify-center hover:bg-gray-700 lg:hidden"
					onClick={() => toggleMenu()}
				>
					<Bars3Icon className="h-6 w-6 text-black" />
				</button>
			</div>
			<div className="hidden grow justify-between gap-2 lg:flex">{menuLists()}</div>
			{menuOpen && <div className="flex w-full grow flex-col gap-2 lg:hidden">{menuLists()}</div>}
		</nav>
	)
}

export default Navbar
