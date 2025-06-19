import { 
	// Import icons from Heroicons for UI elements like arrows, search, tickets, and trash bin
	// Importa icone da Heroicons per elementi UI come frecce, ricerca, biglietti e cestino
	ChevronDoubleDownIcon, 
	ChevronDoubleUpIcon,
	MagnifyingGlassIcon,
	TicketIcon,
	TrashIcon
} from '@heroicons/react/24/outline'
import axios from 'axios' // Library to perform HTTP requests (GET, PUT, DELETE)
                           // Libreria per effettuare richieste HTTP (GET, PUT, DELETE)
import { Fragment, useContext, useEffect, useState } from 'react' 
// React hooks and Fragment for component logic and JSX grouping without extra nodes
// Hook di React e Fragment per la logica del componente e raggruppare JSX senza nodi extra
import { useForm } from 'react-hook-form' 
// Hook to handle form data and validation easily
// Hook per gestire i dati del form e la validazione facilmente
import { toast } from 'react-toastify' 
// Toast notifications for user feedback on actions
// Notifiche toast per feedback all'utente sulle azioni
import Navbar from '../components/Navbar' 
// Navbar component for the top navigation bar
// Componente Navbar per la barra di navigazione superiore
import ShowtimeDetails from '../components/ShowtimeDetails' 
// Component to show details of a showtime
// Componente per mostrare i dettagli di uno spettacolo
import { AuthContext } from '../context/AuthContext' 
// Context to get authentication data like token and user info
// Context per ottenere dati di autenticazione come token e info utente

const User = () => {
	// Get auth context to access the user's token for protected requests
	// Ottieni il context di autenticazione per accedere al token utente per richieste protette
	const { auth } = useContext(AuthContext)

	// State to store the list of users fetched from backend
	// Stato per memorizzare la lista di utenti recuperati dal backend
	const [users, setUsers] = useState(null)

	// State to store the username of the user whose tickets are currently shown
	// Stato per memorizzare l'username dell'utente i cui biglietti sono mostrati
	const [ticketsUser, setTicketsUser] = useState(null)

	// State to store the tickets of the selected user
	// Stato per memorizzare i biglietti dell'utente selezionato
	const [tickets, setTickets] = useState([])

	// State to indicate if an update operation is in progress (to disable buttons)
	// Stato per indicare se è in corso un aggiornamento (per disabilitare i pulsanti)
	const [isUpdating, SetIsUpdating] = useState(false)

	// State to indicate if a delete operation is in progress (to disable buttons)
	// Stato per indicare se è in corso una cancellazione (per disabilitare i pulsanti)
	const [isDeleting, SetIsDeleting] = useState(false)

	// React Hook Form methods: register input, watch form values, get form errors
	// Metodi di React Hook Form: registra input, osserva valori del form, ottieni errori
	const {
		register,
		watch,
		formState: { errors }
	} = useForm()

	// Function to fetch all users from backend
	// Funzione per recuperare tutti gli utenti dal backend
	const fetchUsers = async () => {
		try {
			// Send GET request to '/auth/user' with Authorization header containing user token
			// Invia richiesta GET a '/auth/user' con header Authorization contenente il token utente
			const response = await axios.get('/auth/user', {
				headers: {
					Authorization: `Bearer ${auth.token}`
				}
			})
			// Save the fetched users into the state
			// Salva gli utenti recuperati nello stato
			setUsers(response.data.data)
		} catch (error) {
			// Log any error during fetch
			// Logga eventuali errori durante il recupero
			console.error(error)
		}
	}

	// useEffect hook runs once on component mount to fetch users immediately
	// useEffect viene eseguito una volta al montaggio del componente per recuperare utenti subito
	useEffect(() => {
		fetchUsers()
	}, [])

	// Function to update user's role (e.g. from user to admin or vice versa)
	// Funzione per aggiornare il ruolo dell'utente (es. da user ad admin o viceversa)
	const onUpdateUser = async (data) => {
		try {
			// Disable update buttons during request
			// Disabilita pulsanti aggiornamento durante la richiesta
			SetIsUpdating(true)
			// Send PUT request with new role data for the user
			// Invia richiesta PUT con i nuovi dati del ruolo per l'utente
			const response = await axios.put(`/auth/user/${data.id}`, data, {
				headers: {
					Authorization: `Bearer ${auth.token}`
				}
			})
			// Refresh users list after successful update
			// Aggiorna la lista utenti dopo aggiornamento riuscito
			fetchUsers()
			// Show success toast notification with username and new role
			// Mostra notifica di successo con username e nuovo ruolo
			toast.success(`Update ${response.data.data.username} to ${response.data.data.role} successful!`, {
				position: 'top-center',
				autoClose: 2000,
				pauseOnHover: false
			})
		} catch (error) {
			// Log error and show error toast notification
			// Logga errore e mostra notifica di errore
			console.error(error)
			toast.error('Error', {
				position: 'top-center',
				autoClose: 2000,
				pauseOnHover: false
			})
		} finally {
			// Re-enable update buttons
			// Riabilita pulsanti aggiornamento
			SetIsUpdating(false)
		}
	}

	// Function to confirm user deletion with a browser popup
	// Funzione per confermare la cancellazione utente con popup del browser
	const handleDelete = (data) => {
		// Show confirmation dialog to user before deleting
		// Mostra dialog di conferma prima di cancellare
		const confirmed = window.confirm(`Do you want to delete user ${data.username}?`)
		if (confirmed) {
			// Call delete function if confirmed
			// Chiama funzione di cancellazione se confermato
			onDeleteUser(data)
		}
	}

	// Function to delete user by ID from backend
	// Funzione per cancellare utente dal backend tramite ID
	const onDeleteUser = async (data) => {
		try {
			// Disable delete buttons during request
			// Disabilita pulsanti cancellazione durante la richiesta
			SetIsDeleting(true)
			// Send DELETE request with Authorization header
			// Invia richiesta DELETE con header di autorizzazione
			const response = await axios.delete(`/auth/user/${data.id}`, {
				headers: {
					Authorization: `Bearer ${auth.token}`
				}
			})
			// Refresh users list after successful deletion
			// Aggiorna la lista utenti dopo cancellazione riuscita
			fetchUsers()
			// Show success toast notification
			// Mostra notifica di successo
			toast.success(`Delete successful!`, {
				position: 'top-center',
				autoClose: 2000,
				pauseOnHover: false
			})
		} catch (error) {
			// Log error and show error toast notification
			// Logga errore e mostra notifica di errore
			console.error(error)
			toast.error('Error', {
				position: 'top-center',
				autoClose: 2000,
				pauseOnHover: false
			})
		} finally {
			// Re-enable delete buttons
			// Riabilita pulsanti cancellazione
			SetIsDeleting(false)
		}
	}

	// JSX returned by component - renders the UI
	// JSX restituito dal componente - rende l'interfaccia utente
	return (
		<div className="flex min-h-screen flex-col gap-4 pb-8 text-gray-900 sm:gap-8">
			{/* Navbar at the top of the page */}
			{/* Navbar in cima alla pagina */}
			<Navbar />
			<div className="mx-4 flex h-fit flex-col gap-2 p-4 sm:mx-8 sm:p-6">
				{/* Page title */}
				{/* Titolo della pagina */}
				<h2 className="text-3xl font-bold text-black">Users</h2>

				{/* Search input with magnifying glass icon */}
				{/* Input di ricerca con icona lente di ingrandimento */}
				<div className="relative">
					<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
						<MagnifyingGlassIcon className="h-5 w-5 stroke-2 text-gray-500" />
					</div>
					<input
						type="search"
						className="block w-full border border-gray-300 p-2 pl-10 text-gray-900"
						placeholder="Cerca un utente..." // Placeholder text in Italian
						{...register('search')} // Register input for react-hook-form to watch its value
					/>
				</div>

				{/* Users list grid with sticky headers */}
				{/* Griglia lista utenti con intestazioni sticky */}
				<div
					className={`mt-2 grid max-h-[60vh] overflow-auto`}
					style={{ gridTemplateColumns: 'repeat(3, minmax(max-content, 1fr)) max-content max-content' }}
				>
					{/* Headers for columns */}
					{/* Intestazioni delle colonne */}
					<p className="sticky top-0 px-2 py-1 text-center text-xl font-semibold text-black">
						Nome
					</p>
					<p className="sticky top-0 px-2 py-1 text-center text-xl font-semibold text-black">
						Email
					</p>
					<p className="sticky top-0 px-2 py-1 text-center text-xl font-semibold text-black">
						Ruolo
					</p>
					<p className="sticky top-0 px-2 py-1 text-center text-xl font-semibold text-black">
						Passi
					</p>
					<p className="sticky top-0 px-2 py-1 text-center text-xl font-semibold text-black">
						{/* Empty header for action buttons */}
					</p>

					{/* Map over filtered users to display user info rows */}
					{/* Cicla sugli utenti filtrati per mostrare le righe con info */}
					{users
						?.filter((user) => user.username.toLowerCase().includes(watch('search')?.toLowerCase() || ''))
						.map((user, index) => {
							return (
								<Fragment key={index}>
									{/* User's username */}
									{/* Username dell'utente */}
									<div className="border-t-2 px-2 py-1">{user.username}</div>
									{/* User's email */}
									{/* Email dell'utente */}
									<div className="border-t-2 px-2 py-1">{user.email}</div>
									{/* User's role */}
									{/* Ruolo dell'utente */}
									<div className="border-t-2 px-2 py-1">{user.role}</div>
									{/* Button to show tickets for the user */}
									{/* Pulsante per mostrare i biglietti dell'utente */}
									<div className="border-t-2 px-2 py-1">
										<button
											className={`flex items-center justify-center gap-1 bg-black py-1 pl-2 pr-1.5 text-sm font-medium text-white  disabled:from-slate-500 disabled:to-slate-400
										${
											ticketsUser === user.username
												? ''
												: 'bg-gray-400'
										}`}
											onClick={() => {
												// Set the tickets and username for showing details
												// Imposta i biglietti e username per mostrare dettagli
												setTickets(user.tickets)
												setTicketsUser(user.username)
											}}
										>
											Visualizza {user.tickets.length} Passi
											<TicketIcon className="h-6 w-6" />
										</button>
									</div>
									{/* Action buttons: set admin/user role and delete user */}
									{/* Pulsanti azione: imposta ruolo admin/user e elimina utente */}
									<div className="flex gap-2 border-t-2 border-indigo-200 px-2 py-1">
										{/* Show button to promote user to admin */}
										{/* Mostra pulsante per promuovere user ad admin */}
										{user.role === 'user' && (
											<button
												className="flex w-[115px] items-center justify-center gap-1 bg-blue-900 py-1 pl-2 pr-1.5 text-sm font-medium text-white disabled:from-slate-500 disabled:to-slate-400"
												onClick={() => onUpdateUser({ id: user._id, role: 'admin' })}
												disabled={isUpdating}
											>
												Set Admin
												<ChevronDoubleUpIcon className="h-5 w-5" />
											</button>
										)}
										{/* Show button to demote admin to user */}
										{/* Mostra pulsante per declassare admin a user */}
										{user.role === 'admin' && (
											<button
												className="flex w-[115px] items-center justify-center gap-1 bg-blue-900 py-1 pl-2 pr-1.5 text-sm font-medium text-white disabled:from-slate-500 disabled:to-slate-400"
												onClick={() => onUpdateUser({ id: user._id, role: 'user' })}
												disabled={isUpdating}
											>
												Set User
												<ChevronDoubleDownIcon className="h-5 w-5" />
											</button>
										)}
										{/* Button to delete user */}
										{/* Pulsante per cancellare l'utente */}
										<button
											className="flex w-[115px] items-center justify-center gap-1 rounded border border-red-800 py-1 pl-2 pr-1.5 text-sm font-medium text-red-900 disabled:border-slate-500 disabled:text-slate-500"
											onClick={() => handleDelete(user)}
											disabled={isDeleting}
										>
											Delete
											<TrashIcon className="h-5 w-5" />
										</button>
									</div>
								</Fragment>
							)
						})}
				</div>

				{/* Show ticket details if a user is selected */}
				{/* Mostra dettagli biglietti se un utente è selezionato */}
				{ticketsUser && (
					<div className="mt-4 flex flex-col items-center">
						<h3 className="mb-2 text-2xl font-bold">{ticketsUser} Tickets</h3>
						{/* Show tickets details using a dedicated component */}
						{/* Mostra dettagli biglietti con componente dedicato */}
						<ShowtimeDetails tickets={tickets} />
					</div>
				)}
			</div>
		</div>
	)
}

export default User
