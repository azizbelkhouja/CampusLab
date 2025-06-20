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
	const [isLoggingOut, setLoggingOut] = useState(false)

	const toggleMenu = () => {
		setMenuOpen(!menuOpen)
	}

	const navigate = useNavigate()
	const onLogout = async () => {
		try {
			setLoggingOut(true)
			const response = await axios.get('/auth/logout')
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
			setLoggingOut(false)
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
								? 'border-b-2 border-white text-white'
								: 'text-white'
						}`}
					>
						<HomeModernIcon className="h-6 w-6" />
						<p>Dipartimenti</p>
					</Link>
					<Link
						to={'/schedule'}
						className={`flex items-center justify-center gap-2 px-2 py-1 ${
							window.location.pathname === '/schedule'
								? 'border-b-2 border-white text-white'
								: 'text-white '
						}`}
					>
						<ClockIcon className="h-6 w-6" />
						<p>Programma</p>
					</Link>

					{
						auth.token && (
							<Link
								to={'/tickets'}
								className={`flex items-center justify-center gap-2 px-2 py-1 ${
									window.location.pathname === '/tickets'
										? 'border-b-2 border-white text-white'
										: 'text-white '
								}`}
							>
								<TicketIcon className="h-6 w-6" />
								<p>Passi</p>
							</Link>
						)
					}
					
					{auth.role === 'admin' && (
						<>
							<Link
								to={'/seminario'}
								className={`flex items-center justify-center gap-2 px-2 py-1 ${
									window.location.pathname === '/seminario'
										? 'border-b-2 border-white text-white'
										: 'text-white '
								}`}
							>
								<VideoCameraIcon className="h-6 w-6" />
								<p>Seminari</p>
							</Link>
							<Link
								to={'/user'}
								className={`flex items-center justify-center gap-2 px-2 py-1 ${
									window.location.pathname === '/user'
										? 'border-b-2 border-white text-white'
										: 'text-white '
								}`}
							>
								<UsersIcon className="h-6 w-6" />
								<p>Utenti</p>
							</Link>
						</>
					)}
				</div>
				<div className="flex grow items-center justify-center gap-3 lg:justify-end">
					{auth.username && (
						<p className="text-xl font-bold text-white"><span className='text-gray-400'>Welcome,</span> {auth.username} !</p>
					)}
					{auth.token ? (
						<button
							className="bg-white px-5 font-semibold rounded py-2 text-[#203E72] disabled:slate-500"
							onClick={() => onLogout()}
							disabled={isLoggingOut}
						>
							{isLoggingOut ? 'Elaborazione...' : 'Esci'}
						</button>
					) : (
						<button className="bg-white py-1 rounded font-semibold text-[#203E72] px-3">
							<Link to={'/login'}>Login</Link>
						</button>
					)}
				</div>
			</>
		)
	}

	return (
		<nav className="flex flex-col items-center justify-between gap-2 bg-[#203E72] border-b-[3px] border-black p-4 py-3 lg:flex-row lg:justify-start sm:px-8">
			<div className="flex w-full flex-row justify-between lg:w-fit">
				<button className="flex flex-row items-center gap-2" onClick={() => navigate('/')}>
					<AcademicCapIcon className="h-8 w-8 text-white" />
					<h1 className="mr-4 text-xl text-white border-r-2 pr-4">CampusLab</h1>
				</button>
				<button
					className="flex h-8 w-8 items-center justify-center hover:bg-gray-700 lg:hidden"
					onClick={() => toggleMenu()}
				>
					<Bars3Icon className="h-6 w-6 text-white" />
				</button>
			</div>
			<div className="hidden grow justify-between gap-2 lg:flex">{menuLists()}</div>
			{menuOpen && <div className="flex w-full grow flex-col gap-2 lg:hidden">{menuLists()}</div>}
		</nav>
	)
}

export default Navbar
