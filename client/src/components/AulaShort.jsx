// Importing icon components from Heroicons
// Importa componenti di icone da Heroicons
import { ArrowsRightLeftIcon, ArrowsUpDownIcon, UserIcon } from '@heroicons/react/24/outline'

// Importing axios for HTTP requests
// Importa axios per le richieste HTTP
import axios from 'axios'

// Importing React hooks
// Importa gli hook di React
import { useContext, useEffect, useState } from 'react'

// Importing authentication context
// Importa il contesto di autenticazione
import { AuthContext } from '../context/AuthContext'

// Importing components
// Importa i componenti
import Loading from './Loading'
import Showtimes from './Showtimes'

// Component that shows a compact classroom (Aula) card with its info and showtimes
// Componente che mostra una card compatta dell'aula con info e orari
const AulaShort = ({ aulaId, seminari, selectedDate, filterSeminario, rounded = false }) => {
	const { auth } = useContext(AuthContext) // Get authentication info from context
	// Ottieni le informazioni di autenticazione dal contesto

	const [aula, setAula] = useState({}) // Aula data
	// Dati dell’aula

	const [isFetchingAulaDone, setIsFetchingAulaDone] = useState(false) // Loading flag
	// Stato per indicare il completamento del caricamento

	// Function to fetch aula data
	// Funzione per recuperare i dati dell’aula
	const fetchAula = async () => {
		try {
			setIsFetchingAulaDone(false) // Set loading to false before fetching
			// Imposta il caricamento a false prima della richiesta

			let response
			if (auth.role === 'admin') {
				// Admins can access unreleased aule
				// Gli admin possono accedere alle aule non pubblicate
				response = await axios.get(`/aula/unreleased/${aulaId}`, {
					headers: {
						Authorization: `Bearer ${auth.token}` // Auth header for protected route
						// Header di autorizzazione per route protetta
					}
				})
			} else {
				// Normal users fetch only released aule
				// Gli utenti normali accedono solo alle aule pubblicate
				response = await axios.get(`/aula/${aulaId}`)
			}

			// Set aula state
			// Imposta lo stato dell’aula
			setAula(response.data.data)
		} catch (error) {
			// Handle error
			// Gestione degli errori
			console.error(error)
		} finally {
			// Set loading done
			// Indica che il caricamento è terminato
			setIsFetchingAulaDone(true)
		}
	}

	// Fetch aula data when aulaId changes
	// Recupera i dati dell’aula quando cambia l’ID
	useEffect(() => {
		fetchAula()
	}, [aulaId])

	// Converts row label (e.g. "A", "B", ..., "AA") to a numeric value
	// Converte l’etichetta della riga (es. "A", "B", ..., "AA") in un valore numerico
	function rowToNumber(column) {
		let result = 0
		for (let i = 0; i < column.length; i++) {
			const charCode = column.charCodeAt(i) - 64 // ASCII code to 1-based index (A = 1)
			// Converte il carattere ASCII in indice partendo da 1 (A = 1)
			result = result * 26 + charCode
		}
		return result
	}

	// Show loading component until aula data is fetched
	// Mostra il componente di caricamento finché i dati non sono disponibili
	if (!isFetchingAulaDone) {
		return <Loading />
	}

	// Render the aula information
	// Rende visibili le informazioni dell’aula
	return (
		<div className={`flex flex-col sm:flex-row border border-black`}>
			{/* Left section: Aula label and (if admin) seat plan details */}
			{/* Sezione sinistra: etichetta aula e (se admin) dettagli piano posti */}
			<div className="flex flex-col sm:flex-row">
				<div
					className={`flex min-w-[120px] flex-row items-center justify-center gap-x-2 bg-black px-4 text-2xl font-bold text-white sm:flex-col ${
						rounded && '' // Optional rounded style
					}`}
				>
					<p className="text-sm">Aula</p>
					<p className="text-3xl leading-8">{aula.number}</p>
				</div>

				{/* Only admins see seat plan info */}
				{/* Solo gli admin vedono i dettagli del piano posti */}
				{auth.role === 'admin' && (
					<div
						className={`flex w-full min-w-[160px] flex-row justify-center gap-x-4 px-4 text-sm font-bold sm:w-fit sm:flex-col`}
					>
						{/* Row information */}
						{/* Informazioni sulla riga */}
						<div className="flex items-center gap-2">
							<ArrowsUpDownIcon className="h-5 w-5" />
							{aula?.seatPlan?.row === 'A' ? (
								<h4>Riga : A</h4>
							) : (
								<h4>Riga : A - {aula?.seatPlan?.row}</h4>
							)}
						</div>

						{/* Column information */}
						{/* Informazioni sulla colonna */}
						<div className="flex items-center gap-2">
							<ArrowsRightLeftIcon className="h-5 w-5" />
							{aula?.seatPlan?.column === 1 ? (
								<h4>Colonna : 1</h4>
							) : (
								<h4>Colonna : 1 - {aula?.seatPlan?.column}</h4>
							)}
						</div>

						{/* Total seat capacity */}
						{/* Capacità totale dei posti */}
						<div className="flex items-center gap-2">
							<UserIcon className="h-5 w-5" />
							{(rowToNumber(aula.seatPlan.row) * aula.seatPlan.column).toLocaleString('en-US')}{' '}
							Posti
						</div>
					</div>
				)}
			</div>

			{/* Right section: showtimes table */}
			{/* Sezione destra: tabella orari */}
			<div className="mx-4 flex items-center">
				<Showtimes
					showtimes={aula.showtimes} // Aula’s available showtimes
					seminari={seminari} // All seminars
					selectedDate={selectedDate} // Selected date filter
					filterSeminario={filterSeminario} // Function to filter seminars
					showSeminarioDetail={false} // Don’t show seminar details inline
				/>
			</div>
		</div>
	)
}

export default AulaShort
