// Aula component for viewing a classroom and adding seminar showtimes
// Componente Aula per visualizzare un'aula e aggiungere orari per i seminari

import { ArrowsRightLeftIcon, ArrowsUpDownIcon, InformationCircleIcon, UserIcon } from '@heroicons/react/24/outline'
// Import Heroicons for use in UI
// Importa Heroicons da usare nell'interfaccia utente

import axios from 'axios'
// Import Axios for HTTP requests
// Importa Axios per le richieste HTTP

import { useContext, useEffect, useState } from 'react'
// Import React hooks: useContext, useEffect, useState
// Importa gli hook di React: useContext, useEffect, useState

import { useForm } from 'react-hook-form'
// Import useForm for form handling
// Importa useForm per la gestione dei moduli

import Select from 'react-tailwindcss-select'
// Import custom Tailwind dropdown
// Importa il componente Select compatibile con Tailwind

import { toast } from 'react-toastify'
// Import toast for notifications
// Importa toast per le notifiche

import { AuthContext } from '../context/AuthContext'
// Import AuthContext to access logged-in user info
// Importa AuthContext per accedere alle informazioni dell'utente autenticato

import Loading from './Loading'
// Import loading spinner component
// Importa il componente spinner di caricamento

import Showtimes from './Showtimes'
// Import Showtimes component to display scheduled times
// Importa il componente Showtimes per mostrare gli orari programmati

const Aula = ({ aulaId, seminari, selectedDate, filterSeminario, setSelectedDate }) => {

	// Get form methods from useForm
  	// Ottiene i metodi del modulo da useForm
	const {
		register,
		handleSubmit,
		setValue,
		watch,
	} = useForm()

	// Get auth data from context
  	// Ottiene i dati di autenticazione dal contesto
	const { auth } = useContext(AuthContext)

	// State for aula (classroom) data
  	// Stato per i dati dell'aula
	const [aula, setAula] = useState({})

	// Track if aula fetching is done
  	// Tiene traccia se il caricamento dell'aula è completato
	const [isFetchingAulaDone, setIsFetchingAulaDone] = useState(false)

	// Track if a showtime is being added
  	// Tiene traccia se un orario di seminario sta venendo aggiunto
	const [isAddingShowtime, setIsAddingShowtime] = useState(false)

	// State for selected seminar in dropdown
  	// Stato per il seminario selezionato nel menu a tendina
	const [selectedSeminario, setSelectedSeminario] = useState(null)

	// Fetch aula data from API
  	// Recupera i dati dell'aula dall'API
	const fetchAula = async (data) => {
		try {
			setIsFetchingAulaDone(false)
			let response
			if (auth.role === 'admin') {
				// If admin, get unreleased aula
        		// Se admin, recupera l'aula non pubblicata
				response = await axios.get(`/aula/unreleased/${aulaId}`, {
					headers: {
						Authorization: `Bearer ${auth.token}`
					}
				})
			} else {
				// Otherwise get public aula
        		// Altrimenti, recupera l'aula pubblica
				response = await axios.get(`/aula/${aulaId}`)
			}

			// Save aula data to state
      		// Salva i dati dell'aula nello stato
			setAula(response.data.data)
		} catch (error) {
			console.error(error)
		} finally {
			setIsFetchingAulaDone(true)
		}
	}

	// Fetch aula on component mount or when aulaId changes
  	// Recupera i dati dell'aula al caricamento del componente o quando cambia aulaId
	useEffect(() => {
		fetchAula()
	}, [aulaId])

	// Set default form values on first load
  // Imposta i valori di default del modulo al primo caricamento
	useEffect(() => {
		setValue('autoIncrease', true)
		setValue('rounding5', true)
		setValue('gap', '00:10')
	}, [])

	// Submit handler for adding a new showtime
  	// Gestore per l'invio del modulo per aggiungere un nuovo orario
	const onAddShowtime = async (data) => {
		try {
			setIsAddingShowtime(true)
			if (!data.seminario) {
				// Mostra errore se nessun seminario è stato selezionato
				toast.error('Seleziona un seminario', {
					position: 'top-center',
					autoClose: 2000,
					pauseOnHover: false
				})
				return
			}

			// Combine selected date and time into a Date object
			// Combina la data selezionata e l'orario in un oggetto Date
			let showtime = new Date(selectedDate)
			const [hours, minutes] = data.showtime.split(':')
			showtime.setHours(hours, minutes, 0)

			// Send POST request to add the showtime
      		// Invia richiesta POST per aggiungere l'orario
			const response = await axios.post(
				'/showtime',
				{ seminario: data.seminario, showtime, aula: aula._id, repeat: data.repeat, isRelease: data.isRelease },
				{
					headers: {
						Authorization: `Bearer ${auth.token}`
					}
				}
			)

			// Refresh aula data after adding
      		// Aggiorna i dati dell'aula dopo l'aggiunta
			fetchAula()

			// Auto-increase showtime for next entry
      		// Aumento automatico dell'orario per la prossima voce
			if (data.autoIncrease) {
				const seminarioLength = seminari.find((seminario) => seminario._id === data.seminario).length
				const [GapHours, GapMinutes] = data.gap.split(':').map(Number)
				const nextShowtime = new Date(showtime.getTime() + (seminarioLength + GapHours * 60 + GapMinutes) * 60000)

				// Round minutes if selected
        		// Arrotonda i minuti se selezionato
				if (data.rounding5 || data.rounding10) {
					const totalMinutes = nextShowtime.getHours() * 60 + nextShowtime.getMinutes()
					const roundedMinutes = data.rounding5
						? Math.ceil(totalMinutes / 5) * 5
						: Math.ceil(totalMinutes / 10) * 10
					let roundedHours = Math.floor(roundedMinutes / 60)
					const remainderMinutes = roundedMinutes % 60
					if (roundedHours === 24) {
						nextShowtime.setDate(nextShowtime.getDate() + 1)
						roundedHours = 0
					}

					// Set the new rounded time
        			// Imposta il nuovo orario arrotondato
					setValue(
						'showtime',
						`${String(roundedHours).padStart(2, '0')}:${String(remainderMinutes).padStart(2, '0')}`
					)
				} else {
					setValue(
						'showtime',
						`${String(nextShowtime.getHours()).padStart(2, '0')}:${String(
							nextShowtime.getMinutes()
						).padStart(2, '0')}`
					)
				}

				// Optionally increase the selected date too
        		// Facoltativamente aumenta anche la data selezionata
				if (data.autoIncreaseDate) {
					setSelectedDate(nextShowtime)
					sessionStorage.setItem('selectedDate', nextShowtime)
				}
			}
			toast.success('Aggiunta seminario riuscita!', {
				position: 'top-center',
				autoClose: 2000,
				pauseOnHover: false
			})
		} catch (error) {
			console.error(error)
			toast.error('Errore durante l\'aggiunta del seminario', {
				position: 'top-center',
				autoClose: 2000,
				pauseOnHover: false
			})
		} finally {
			setIsAddingShowtime(false)
		}
	}

	// Convert seat row letter (like AA) to a number
  	// Converte la lettera della fila (es. AA) in un numero
	function rowToNumber(column) {
		let result = 0
		for (let i = 0; i < column.length; i++) {
			const charCode = column.charCodeAt(i) - 64 // Convert character to ASCII and adjust to 1-based index
			result = result * 26 + charCode
		}
		return result
	}

	// Show loading spinner while fetching
  	// Mostra il caricamento mentre i dati vengono recuperati
	if (!isFetchingAulaDone) {
		return <Loading />
	}

	return (
		<div className="flex flex-col">
			<div className="flex md:justify-between">
				<h3
					className={`flex w-fit items-center border-b-0 bg-black px-6 py-0.5 text-2xl font-bold text-white md:px-8 ${
						auth.role !== 'admin' && 'rounded-t-2xl'
					}`}
				>
					{aula.number}
				</h3>
				{auth.role === 'admin' && (
					<div className="flex w-fit flex-col gap-x-3 border-[2px] px-4 py-0.5 font-semibold border-b-0 text-black md:flex-row md:gap-x-6 md:text-lg md:font-bold">
						<div className="flex items-center gap-2">
							<ArrowsUpDownIcon className="h-5 w-5" />
							{aula?.seatPlan?.row === 'A' ? (
								<h4>Riga : A</h4>
							) : (
								<h4>Riga : A - {aula?.seatPlan?.row}</h4>
							)}
						</div>
						<div className="flex items-center gap-2">
							<ArrowsRightLeftIcon className="h-5 w-5" />
							{aula?.seatPlan?.column === 1 ? (
								<h4>Colonna : 1</h4>
							) : (
								<h4>Colonna : 1 - {aula?.seatPlan?.column}</h4>
							)}
						</div>
						<div className="flex items-center gap-2">
							<UserIcon className="h-5 w-5" />
							{(rowToNumber(aula.seatPlan.row) * aula.seatPlan.column).toLocaleString('it-IT')}{' '}
							Posti
						</div>
					</div>
				)}
			</div>
			<div className="flex flex-col gap-4 border-[2px] py-4">
				{auth.role === 'admin' && (
					<>
						<form
							className="mx-4 flex flex-col gap-x-4 gap-y-2 lg:flex-row"
							onSubmit={handleSubmit(onAddShowtime)}
						>
							<div className="flex grow flex-col gap-2">
								<div className="flex flex-col gap-2 lg:flex-row lg:items-stretch">
									<div className="flex grow-[2] items-center gap-x-2 gap-y-1 lg:flex-col lg:items-start">
										<label className="whitespace-nowrap text-lg font-semibold leading-5">
											Seminario:
										</label>
										<Select
											value={selectedSeminario}
											options={seminari?.map((seminario) => ({
												value: seminario._id,
												label: seminario.name
											}))}
											onChange={(value) => {
												setValue('seminario', value.value)
												setSelectedSeminario(value)
											}}
											isSearchable={true}
											primaryColor="indigo"
											classNames={{
												menuButton: (value) =>
													'flex font-semibold text-sm border'
											}}
										/>
									</div>
									<div className="flex items-center gap-x-2 gap-y-1 lg:flex-col lg:items-start">
										<label className="whitespace-nowrap text-lg font-semibold leading-5">
											Orario:
										</label>
										<input
											type="time"
											className="h-9 w-full bg-white px-2 py-1 font-semibold text-gray-900 border"
											required
											{...register('showtime', { required: true })}
										/>
									</div>
								</div>
								<div className="flex flex-col gap-10 lg:flex-row lg:items-stretch">
									<div className="flex items-center gap-x-2 gap-y-1 lg:flex-col lg:items-start">
										<label className="whitespace-nowrap font-semibold leading-5">
											Ripeti (Giorni):
										</label>
										<input
											type="number"
											min={1}
											defaultValue={1}
											max={31}
											className="h-9 w-full border px-2 py-1 text-gray-900 drop-shadow-sm"
											required
											{...register('repeat', { required: true })}
										/>
									</div>
									<label className="flex items-center gap-x-2 gap-y-1 whitespace-nowrap font-semibold leading-5 lg:flex-col lg:items-start">
										Pubblica ora:
										<input
											type="checkbox"
											className="h-6 w-6 lg:h-9 lg:w-9"
											{...register('isRelease')}
										/>
									</label>
									<div className="flex flex-col items-start gap-2 lg:flex-row lg:items-end">
										<p className="text-right underline">Aumento automatico</p>
										<label
											className="flex items-center gap-x-2 gap-y-1 whitespace-nowrap font-semibold leading-5 lg:flex-col lg:items-start"
											title="Dopo l'aggiunta, aggiorna l'orario al termine del seminario"
										>
											Orario:
											<input
												type="checkbox"
												className="h-6 w-6 lg:h-9 lg:w-9"
												{...register('autoIncrease')}
											/>
										</label>
										<label
											className="flex items-center gap-x-2 gap-y-1 whitespace-nowrap font-semibold leading-5 lg:flex-col lg:items-start"
											title="Dopo l'aggiunta, aggiorna la data al termine del seminario"
										>
											Data:
											<input
												type="checkbox"
												className="h-6 w-6 lg:h-9 lg:w-9"
												disabled={!watch('autoIncrease')}
												{...register('autoIncreaseDate')}
											/>
										</label>
									</div>
									<div
										className="flex items-center gap-x-2 gap-y-1 lg:flex-col lg:items-start"
										title="Intervallo tra gli orari"
									>
										<label className="whitespace-nowrap font-semibold leading-5">Intervallo:</label>
										<input
											type="time"
											className="h-9 w-full border bg-white px-2 py-1 font-semibold text-gray-900 drop-shadow-sm disabled:bg-gray-300"
											disabled={!watch('autoIncrease')}
											{...register('gap')}
										/>
									</div>
									<div className="flex flex-col items-start gap-2 lg:flex-row lg:items-end">
										<p className="text-right underline">Arrotondamento</p>
										<label
											className="flex items-center gap-x-2 gap-y-1 whitespace-nowrap font-semibold leading-5 lg:flex-col lg:items-start"
											title="Arrotonda ai cinque minuti successivi"
										>
											5-min:
											<input
												type="checkbox"
												className="h-6 w-6 lg:h-9 lg:w-9"
												disabled={!watch('autoIncrease')}
												{...register('rounding5', {
													onChange: () => setValue('rounding10', false)
												})}
											/>
										</label>
										<label
											className="flex items-center gap-x-2 gap-y-1 whitespace-nowrap font-semibold leading-5 lg:flex-col lg:items-start"
											title="Arrotonda ai dieci minuti successivi"
										>
											10-min:
											<input
												type="checkbox"
												className="h-6 w-6 lg:h-9 lg:w-9"
												disabled={!watch('autoIncrease')}
												{...register('rounding10', {
													onChange: () => setValue('rounding5', false)
												})}
											/>
										</label>
									</div>
								</div>
							</div>
							<button
								title="Aggiungi orario"
								disabled={isAddingShowtime}
								className="whitespace-nowrap bg-black px-2 py-1 font-medium text-white disabled:from-slate-500 disabled:to-slate-400"
								type="submit"
							>
								AGGIUNGI +
							</button>
						</form>
						{filterSeminario?.name && (
							<div className="mx-4 flex gap-2 rounded-md bg-gradient-to-r from-indigo-600 to-blue-500 p-2 text-white">
								<InformationCircleIcon className="h-6 w-6" />
								{`Stai visualizzando gli orari di "${filterSeminario?.name}"`}
							</div>
						)}
					</>
				)}
				<Showtimes
					showtimes={aula.showtimes}
					seminari={seminari}
					selectedDate={selectedDate}
					filterSeminario={filterSeminario}
				/>
			</div>
		</div>
	)
}
export default Aula
