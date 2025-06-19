// DateSelector Component
// This component allows users to select a date by navigating days, choosing from a date picker, or picking from a scrollable date range.
// It supports role-based date ranges (admin vs normal users) and stores the selected date in sessionStorage.
// Componente DateSelector
// Questo componente permette agli utenti di selezionare una data navigando tra i giorni, scegliendo da un calendario o da una lista scrollabile di date.
// Supporta intervalli di date basati sul ruolo (admin vs utenti normali) e salva la data selezionata in sessionStorage.


import { ArrowPathIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { AuthContext } from '../context/AuthContext'

const DateSelector = ({ selectedDate, setSelectedDate }) => {

	// Get auth context (user role info)
  	// Ottieni il contesto di autenticazione (info sul ruolo utente)
	const { auth } = useContext(AuthContext)

	// Reference to wrapper div for detecting clicks outside (to close edit mode)
  	// Riferimento al contenitore per rilevare clic esterni (per chiudere la modalità modifica)
	const wrapperRef = useRef(null)

	// Local state to toggle editing mode for date input
  	// Stato locale per attivare/disattivare la modalità modifica dell'input data
	const [isEditing, SetIsEditing] = useState(false)

	// Handler to go to the previous day
  	// Gestore per andare al giorno precedente
	const handlePrevDay = () => {
		const prevDay = new Date(selectedDate)
		prevDay.setDate(prevDay.getDate() - 1)
		setSelectedDate(prevDay)
		sessionStorage.setItem('selectedDate', prevDay)
	}

	// Handler to go to the next day
  	// Gestore per andare al giorno successivo
	const handleNextDay = () => {
		const nextDay = new Date(selectedDate)
		nextDay.setDate(nextDay.getDate() + 1)
		setSelectedDate(nextDay)
		sessionStorage.setItem('selectedDate', nextDay)
	}

	// Handler to reset date to today
  	// Gestore per resettare la data a oggi
	const handleToday = () => {
		const today = new Date()
		setSelectedDate(today) // Update selected date to today
		sessionStorage.setItem('selectedDate', today) // Save to session storage
	}

	// Format a Date object into a readable Italian string (e.g. "lunedì 19 giugno 2025")
  	// Format di una data in stringa leggibile in italiano (es. "lunedì 19 giugno 2025")
	const formatDate = (date) => {
		const weekday = date.toLocaleString('it-IT', { weekday: 'long' })
		const day = date.getDate()
		const month = date.toLocaleString('it-IT', { month: 'long' })
		const year = date.getFullYear()
		return `${weekday} ${day} ${month} ${year}`
	}

	// Small button component to display short date info in the scrollable date range
  	// Componente pulsante per mostrare info brevi sulla data nella lista scrollabile
	const DateShort = ({ date, selectedDate }) => {
		const day = date.getDate()
		const weekday = date.toLocaleString('it-IT', { weekday: 'short' })

		// Check if this date is currently selected
    	// Controlla se questa data è quella selezionata
		const isThisDate =
			selectedDate.getDate() === date.getDate() &&
			selectedDate.getMonth() === date.getMonth() &&
			selectedDate.getFullYear() === date.getFullYear()

		// Check if this date is today
    	// Controlla se questa data è oggi
		const isToday = new Date(date).setHours(0, 0, 0, 0) === new Date().setHours(0, 0, 0, 0)

		return (
			<button
				title={formatDate(date)}
				className={`flex min-w-[48px] flex-col items-center justify-center p-1 font-semibold ${
					isThisDate
						? 'bg-[#000000] text-white'
						: isToday
						? 'bg-blue-900 text-white'
						: isPast(date)
						? 'bg-gray-500 text-white hover:bg-gray-400'
						: 'bg-white border-[1px] hover:bg-slate-100'
				}`}
				onClick={() => {
					setSelectedDate(date)
					sessionStorage.setItem('selectedDate', date)
				}}
			>
				<p className="text-sm">{weekday}</p>
				<p className="text-xl">{day}</p>
			</button>
		)
	}

	// Check if given date is before today (past date)
  	// Controlla se la data passata è antecedente a oggi
	const isPast = (date) => {
		return new Date(date).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0)
	}

	// Handler when date input changes (from calendar picker)
  	// Gestore quando cambia la data dall'input calendario
	const handleChange = (event) => {
		setSelectedDate(new Date(event.target.value)) // Update selected date from input
	}

	// Generate an array of Dates between startDate and endDate (inclusive)
  	// Genera un array di date tra startDate e endDate (incluso)
	function generateDateRange(startDate, endDate) {
		const dates = []
		const currentDate = new Date(startDate)

		while (currentDate <= endDate) {
			dates.push(new Date(currentDate.getTime())) // Add copy of currentDate
			currentDate.setDate(currentDate.getDate() + 1) // Increment day
		}

		return dates
	}

	// Get date range around today depending on user role (admin gets past 7 days, others get today onwards)
 	// Ottieni intervallo di date intorno a oggi in base al ruolo (admin: ultimi 7 giorni, altri: da oggi in avanti)
	function getPastAndNextDateRange() {
		const today = new Date()
		const pastDays = new Date(today)
		if (auth.role === 'admin') {
			pastDays.setDate(today.getDate() - 7) // Admin can see 7 days in the past
		}

		const nextDays = new Date(today)
		nextDays.setDate(today.getDate() + 17) // Show 17 days in the future for all

		return generateDateRange(pastDays, nextDays)
	}

	// Effect to add event listener for clicks outside the editing area to close edit mode
  	// Effetto per aggiungere listener al click esterno per chiudere la modalità modifica
	useEffect(() => {
		document.addEventListener('click', handleClickOutside, false)
		return () => {
			document.removeEventListener('click', handleClickOutside, false)
		}
	}, [])

	// Handler to detect clicks outside of the date input wrapper and close edit mode
  	// Gestore per rilevare click esterni e chiudere la modalità modifica
	const handleClickOutside = (event) => {
		if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
			SetIsEditing(false)
		}
	}

	return (
		<div className="flex flex-col gap-2">
			<div className="relative flex items-stretch justify-between gap-2 bg-white py-2 font-semibold text-[#213D72]">
				{auth.role === 'admin' || !isPast(new Date().setDate(selectedDate.getDate() - 1)) ? (
					<button
						title="Ieri"
						onClick={handlePrevDay}
					>
						<ChevronLeftIcon className="h-10 w-10 text-[#213D72]" />
					</button>
				) : (
					<div className="h-10 w-10"></div>
				)}

				{isEditing ? (
					<div className="w-full" ref={wrapperRef}>
						<input
							title="Select date"
							type="Date"
							min={auth.role !== 'admin' ? new Date().toISOString().split('T')[0] : undefined}
							required
							autoFocus
							className={`w-full border-white bg-[#213D72] py-2 text-white text-center text-xl sm:text-3xl`}
							value={selectedDate.toISOString().split('T')[0]}
							onChange={handleChange}
						/>
					</div>
				) : (
					<div
						className="flex w-full items-center justify-center text-center text-xl sm:text-2xl cursor-pointer"
						onClick={() => {
							SetIsEditing(true)
						}}
					>
						{formatDate(selectedDate)}
					</div>
				)}

				<div className="flex items-center justify-between gap-2">
					<button
						title="Domani"
						onClick={handleNextDay}
					>
						<ChevronRightIcon className="h-10 w-10 text-[#213D72]" />
					</button>
					<button
						title="Oggi"
						onClick={handleToday}
					>
						<ArrowPathIcon className="h-10 w-10 text-[#213D72]" />
					</button>
				</div>
			</div>
			<div className="flex gap-2 overflow-auto">
				{getPastAndNextDateRange().map((date, index) => (
					<DateShort key={index} date={date} selectedDate={selectedDate} />
				))}
			</div>
		</div>
	)
}

export default DateSelector
