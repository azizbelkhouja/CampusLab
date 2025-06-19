import { ArrowsRightLeftIcon, ArrowsUpDownIcon, EyeSlashIcon, UserIcon } from '@heroicons/react/24/outline'
import { useContext, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDraggable } from 'react-use-draggable-scroll'
import { AuthContext } from '../context/AuthContext'

const ScheduleTable = ({ dip, selectedDate }) => {

	const ref = useRef(null) // Reference to scrollable div / Riferimento al contenitore scrollabile

	const { auth } = useContext(AuthContext) // Get authenticated user / Ottieni l'utente autenticato

	const { events } = useDraggable(ref) // Enable drag to scroll / Abilita il trascinamento per scroll

	const navigate = useNavigate() // Used to navigate to showtime page / Usato per navigare alla pagina del seminario

	// Convert showtime to grid row number (5-minute steps)
  	// Converte l'orario in numero di riga nella griglia (passi di 5 minuti)
	const getRowStart = (showtime) => {
		showtime = new Date(showtime)
		const hour = showtime.getHours()
		const min = showtime.getMinutes()
		console.log(hour, min, Math.round((60 * hour + min) / 5))
		return Math.round((60 * hour + min) / 5)
	}

	// Calculate how many rows a seminar spans
  	// Calcola quante righe occupa un seminario
	const getRowSpan = (length) => {
		return Math.round(length / 5)
	}

	// Get earliest and latest showtimes on the selected day
  	// Ottieni gli orari di inizio e fine per il giorno selezionato
	const getRowStartRange = () => {
		let firstRowStart = 100000
		let lastRowEnd = 0
		let count = 0
		dip.aulas.forEach((aula, index) => {
			aula.showtimes.forEach((showtime, index) => {
				if (
					new Date(showtime.showtime).getDate() === selectedDate.getDate() &&
					new Date(showtime.showtime).getMonth() === selectedDate.getMonth() &&
					new Date(showtime.showtime).getYear() === selectedDate.getYear()
				) {
					const rowStart = getRowStart(showtime.showtime)
					if (rowStart < firstRowStart) {
						firstRowStart = rowStart
					}
					if (rowStart + getRowSpan(showtime.seminario.length) > lastRowEnd) {
						lastRowEnd = rowStart + getRowSpan(showtime.seminario.length)
					}
					count++
				}
			})
		})
		return [firstRowStart, lastRowEnd, count]
	}

	// Filter only today's showtimes for an aula
  	// Filtra solo i seminari di oggi per un'aula
	const getTodayShowtimes = (aula) => {
		return aula.showtimes?.filter((showtime, index) => {
			return (
				new Date(showtime.showtime).getDate() === selectedDate.getDate() &&
				new Date(showtime.showtime).getMonth() === selectedDate.getMonth() &&
				new Date(showtime.showtime).getYear() === selectedDate.getYear()
			)
		})
	}

	// Convert row label (e.g., A, B, C) to number
  	// Converte l'etichetta della riga (es. A, B, C) in un numero
	function rowToNumber(column) {
		let result = 0
		for (let i = 0; i < column.length; i++) {
			const charCode = column.charCodeAt(i) - 64
			result = result * 26 + charCode
		}
		return result
	}

	const firstRowStart = getRowStartRange()[0]
	const gridRows = Math.max(1, getRowStartRange()[1] - getRowStartRange()[0])
	const showtimeCount = getRowStartRange()[2]
	const shiftStart = 3 // spacing from top / spazio dall'alto
	const shiftEnd = 2 // spacing from bottom / spazio dal basso

	// Check if a seminario is in the past / Controlla se un seminario è nel passato
	const isPast = (date) => {
		return date < new Date()
	}

	return (
		<>
			<div
				className={`grid min-h-[50vh] max-h-screen overflow-x-auto grid-cols-${dip.aulas?.length.toString()} grid-rows-${
					gridRows + shiftEnd
				}  border border-black`}
				{...events}
				ref={ref}
			>
				{/* Render showtime blocks / Mostra i blocchi dei seminari */}
				{dip.aulas?.map((aula, index) => {
					{
						return getTodayShowtimes(aula)?.map((showtime, index) => {
							return (
								<button
									title={`${showtime.seminario.name}\n${new Date(showtime.showtime)
										.getHours()
										.toString()
										.padStart(2, '0')} : ${new Date(showtime.showtime)
										.getMinutes()
										.toString()
										.padStart(2, '0')} - ${new Date(
										new Date(showtime.showtime).getTime() + showtime.seminario.length * 60000
									)
										.getHours()
										.toString()
										.padStart(2, '0')} : ${new Date(
										new Date(showtime.showtime).getTime() + showtime.seminario.length * 60000
									)
										.getMinutes()
										.toString()
										.padStart(2, '0')}
												`}
									key={index}
									className={`flex flex-col items-center overflow-y-scroll row-span-${getRowSpan(
										showtime.seminario.length
									)} row-start-${
										getRowStart(showtime.showtime) - firstRowStart + shiftStart
									} col-start-${aula.number} mx-1 border rounded p-1 text-center drop-shadow-md ${
										!isPast(new Date(showtime.showtime))
											? 'bg-white hover:bg-gray-100'
											: `bg-gray-200  ${
													auth.role === 'admin' ? 'hover:bg-gray-300' : 'cursor-not-allowed'
											  }`
									} ${!showtime.isRelease && 'opacity-50'}`}
									onClick={() => {
										if (!isPast(new Date(showtime.showtime)) || auth.role === 'admin')
											return navigate(`/showtime/${showtime._id}`)
									}}
								>
									{!showtime.isRelease && (
										<EyeSlashIcon
											className="mx-auto h-5 w-5 stroke-2"
											title="Unreleased showtime"
										/>
									)}
									<p className="text-sm font-bold">{showtime.seminario.name}</p>
									<p className="text-sm leading-3">{`${new Date(showtime.showtime)
										.getHours()
										.toString()
										.padStart(2, '0')} : ${new Date(showtime.showtime)
										.getMinutes()
										.toString()
										.padStart(2, '0')} - ${new Date(
										new Date(showtime.showtime).getTime() + showtime.seminario.length * 60000
									)
										.getHours()
										.toString()
										.padStart(2, '0')} : ${new Date(
										new Date(showtime.showtime).getTime() + showtime.seminario.length * 60000
									)
										.getMinutes()
										.toString()
										.padStart(2, '0')}`}</p>
								</button>
							)
						})
					}
				})}

				{showtimeCount === 0 && (
					<div className="col-span-full row-start-3 flex items-center justify-center text-xl font-semibold text-gray-700">
						Nessun seminario previsto per oggi
					</div>
				)}

				{dip.aulas.map((aula, index) => (
					<div
						key={index}
						className="sticky top-0 border border-black border-t-0 border-r-0 row-span-1 row-start-1 flex flex-col items-center justify-center text-black"
					>
						<p className="text-2xl font-semibold leading-7 pt-3">{index + 1}</p>
						{auth.role === 'admin' && (
							<>
								<div className="flex gap-1 text-xs">
									<p className="flex items-center gap-1">
										<ArrowsUpDownIcon className="h-3 w-3" />
										{aula.seatPlan.row === 'A'
											? aula.seatPlan.row
											: `A - ${aula.seatPlan.row}`}
									</p>
									<p className="flex items-center gap-1">
										<ArrowsRightLeftIcon className="h-3 w-3" />
										{aula.seatPlan.column === 1
											? aula.seatPlan.column
											: `1 - ${aula.seatPlan.column}`}
									</p>
								</div>
								<p className="flex items-center gap-1 text-sm">
									<UserIcon className="h-4 w-4" />
									{(rowToNumber(aula.seatPlan.row) * aula.seatPlan.column).toLocaleString(
										'en-US'
									)}{' '}
									Posti
								</p>
							</>
						)}
					</div>
				))}
			</div>
		</>
	)
}

export default ScheduleTable
