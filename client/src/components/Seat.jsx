import { CheckIcon } from '@heroicons/react/24/outline'
import { memo, useState } from 'react'

const Seat = ({ seat, setSelectedSeats, selectable, isAvailable }) => {

	const [isSelected, setIsSelected] = useState(false) // Track if this seat is selected / Tiene traccia se il posto è selezionato

	return !isAvailable ? (
		// If the seat is not available (already reserved)
		// Se il posto non è disponibile (già riservato)
		<button
			title={`${seat.row}${seat.number}`}
			className="flex h-8 w-8 cursor-not-allowed items-center justify-center"
		>
			<div className="h-6 w-6 rounded bg-gray-500 drop-shadow-md"></div>
		</button>
	) : isSelected ? (
		// If the seat is selected by the user
		// Se il posto è stato selezionato dall'utente
		<button
			title={`${seat.row}${seat.number}`}
			className="flex h-8 w-8 items-center justify-center"
			onClick={() => {
				setIsSelected(false)
				setSelectedSeats((prev) => prev.filter((e) => e !== `${seat.row}${seat.number}`))
			}}
		>
			<div className="flex h-6 w-6 items-center justify-center rounded bg-blue-500 drop-shadow-md">
				<CheckIcon className="h-5 w-5 stroke-[3] text-white" />
			</div>
		</button>
	) : (
		// If seat is available and not selected
		// Se il posto è disponibile e non selezionato
		<button
			title={`${seat.row}${seat.number}`}
			className={`flex h-8 w-8 items-center justify-center ${!selectable && 'cursor-not-allowed'}`}
			onClick={() => {
				if (selectable) {
					setIsSelected(true)
					setSelectedSeats((prev) => [...prev, `${seat.row}${seat.number}`])
				}
			}}
		>
			<div className="h-6 w-6 rounded bg-white drop-shadow-md"></div>
		</button>
	)
}

// memo prevents unnecessary re-renders of seats
// memo evita il rendering inutile dei componenti Seat già renderizzati
export default memo(Seat)
