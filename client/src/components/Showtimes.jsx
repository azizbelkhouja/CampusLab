import { EyeSlashIcon } from '@heroicons/react/24/outline'
import { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

const Showtimes = ({ showtimes, seminari, selectedDate, filterSeminario, showSeminarioDetail = true }) => {

	// Get the current user's authentication data
	// Recupera i dati di autenticazione dell’utente attuale
	const { auth } = useContext(AuthContext)

	// Create navigation function to move between pages
	// Funzione di navigazione per cambiare pagina
	const navigate = useNavigate()

	// Group showtimes by seminar and filter by selected date
	// Raggruppa gli showtime per seminario e filtra per la data selezionata
	const sortedShowtimes = showtimes?.reduce((result, showtime) => {
		const { seminario, showtime: showDateTime, seats, _id, isRelease } = showtime

		// Skip this showtime if it doesn't match the filtered seminar
		// Salta questo showtime se non corrisponde al seminario filtrato
		if (filterSeminario && filterSeminario._id !== seminario) {
			return result
		}

		// Only include showtimes that match the selected date
		// Includi solo gli showtime che corrispondono alla data selezionata
		if (
			new Date(showDateTime).getDate() === selectedDate.getDate() &&
			new Date(showDateTime).getMonth() === selectedDate.getMonth() &&
			new Date(showDateTime).getFullYear() === selectedDate.getFullYear()
		) {
			if (!result[seminario]) {
				result[seminario] = []
			}

			// Add current showtime info to the seminar group
			// Aggiungi lo showtime corrente al gruppo del seminario
			result[seminario].push({ showtime: showDateTime, seats, _id, isRelease })
		}
		return result
	}, {})

	// Sort each group of showtimes in chronological order
	// Ordina ogni gruppo di showtime in ordine cronologico
	sortedShowtimes &&
		Object.values(sortedShowtimes).forEach((seminario) => {
			seminario.sort((a, b) => new Date(a.showtime) - new Date(b.showtime))
		})

	// Function that checks if a date is in the past
	// Funzione che verifica se una data è nel passato
	const isPast = (date) => {
		return date < new Date()
	}

	// If no showtimes available, display message
	// Se non ci sono showtime disponibili, mostra il messaggio
	if (Object.keys(sortedShowtimes).length === 0) {
		return <p className="text-center">Nessun seminario disponibile</p>
	}
	return (
		<>
			{seminari?.map((seminario, index) => {
				return (
					sortedShowtimes &&
					sortedShowtimes[seminario._id] && (
						<div key={index} className="flex items-center">
							{showSeminarioDetail && <img src={seminario.img} className="w-32 px-4 drop-shadow-md" />}
							<div className="mr-4 flex flex-col gap-2 pb-4 pt-2">
								{showSeminarioDetail && (
									<div>
										<h4 className="text-2xl font-semibold">{seminario.name}</h4>
										<p className="text-md font-medium">lunghezza : {seminario.length || '-'} min</p>
									</div>
								)}
								<div className="flex flex-wrap items-center gap-2 pt-1">
									{sortedShowtimes[seminario._id]?.map((showtime, index) => {
										return (
											<button
												key={index}
												title={`${new Date(showtime.showtime)
													.getHours()
													.toString()
													.padStart(2, '0')} : ${new Date(showtime.showtime)
													.getMinutes()
													.toString()
													.padStart(2, '0')} - ${new Date(
													new Date(showtime.showtime).getTime() + seminario.length * 60000
												)
													.getHours()
													.toString()
													.padStart(2, '0')} : ${new Date(
													new Date(showtime.showtime).getTime() + seminario.length * 60000
												)
													.getMinutes()
													.toString()
													.padStart(2, '0')}
														`}
												className={
													isPast(new Date(showtime.showtime))
														? `flex items-center gap-1 px-2 py-1 text-lg text-gray-900 ${
																auth.role !== 'admin' && 'cursor-not-allowed'
														  } ${
																auth.role === 'admin' &&
																'to-gray-100 hover:from-gray-200'
														  }`
														: new Date(showtime.showtime).getTime() ===
														  new Date(
																sortedShowtimes[seminario._id].find(
																	(s) => new Date(s.showtime) > new Date()
																).showtime
														  ).getTime()
														? 'flex items-center gap-1 bg-blue-900 px-2 py-1 text-lg text-white drop-shadow-sm'
														: 'flex items-center gap-1 bg-gray-400 px-2 py-1 text-lg text-white'
												}
												onClick={() => {
													if (!isPast(new Date(showtime.showtime)) || auth.role === 'admin')
														return navigate(`/showtime/${showtime._id}`)
												}}
											>
												{!showtime.isRelease && (
													<EyeSlashIcon className="h-6 w-6" title="Unreleased showtime" />
												)}
												{`${new Date(showtime.showtime)
													.getHours()
													.toString()
													.padStart(2, '0')} : ${new Date(showtime.showtime)
													.getMinutes()
													.toString()
													.padStart(2, '0')}`}
											</button>
										)
									})}
								</div>
							</div>
						</div>
					)
				)
			})}
		</>
	)
}

export default Showtimes
