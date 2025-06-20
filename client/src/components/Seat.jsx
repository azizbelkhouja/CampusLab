import { CheckIcon } from '@heroicons/react/24/outline'
import { ComputerDesktopIcon } from '@heroicons/react/24/solid'
import { memo, useState } from 'react'

const Seat = ({ seat, setSelectedSeats, selectable, isAvailable }) => {

	const [isSelected, setIsSelected] = useState(false) // Track if this seat is selected / Tiene traccia se il posto è selezionato

	return !isAvailable ? (

		// Se il posto non è disponibile (già riservato)
		<button
			title={`${seat.row}${seat.number}`}
			className="flex h-8 w-8 cursor-not-allowed items-center justify-center"
		>
			<div className="h-6 w-6"><ComputerDesktopIcon className='text-gray-400' /></div>
		</button>
	) : isSelected ? (

		// Se il posto è stato selezionato dall'utente
		<button
			title={`${seat.row}${seat.number}`}
			className="flex h-8 w-8 items-center justify-center"
			onClick={() => {
				setIsSelected(false)
				setSelectedSeats((prev) => prev.filter((e) => e !== `${seat.row}${seat.number}`))
			}}
		>
			<div className="flex h-6 w-6 items-center justify-center">
				<ComputerDesktopIcon className='text-blue-900' />
			</div>
		</button>
	) : (

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
			<div className="h-6 w-6"><ComputerDesktopIcon /></div>
		</button>
	)
}

// memo evita il rendering inutile dei componenti Seat già renderizzati
export default memo(Seat)
