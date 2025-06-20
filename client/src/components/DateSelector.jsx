import { ArrowPathIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { AuthContext } from '../context/AuthContext'

const DateSelector = ({ selectedDate, setSelectedDate }) => {

	const { auth } = useContext(AuthContext)
	const wrapperRef = useRef(null)
	const [isEditing, SetIsEditing] = useState(false)

	const handlePrevDay = () => {
		const prevDay = new Date(selectedDate)
		prevDay.setDate(prevDay.getDate() - 1)
		setSelectedDate(prevDay)
		sessionStorage.setItem('selectedDate', prevDay)
	}

	const handleNextDay = () => {
		const nextDay = new Date(selectedDate)
		nextDay.setDate(nextDay.getDate() + 1)
		setSelectedDate(nextDay)
		sessionStorage.setItem('selectedDate', nextDay)
	}

	const handleToday = () => {
		const today = new Date()
		setSelectedDate(today)
		sessionStorage.setItem('selectedDate', today)
	}

	const formatDate = (date) => {
		const weekday = date.toLocaleString('it-IT', { weekday: 'long' })
		const day = date.getDate()
		const month = date.toLocaleString('it-IT', { month: 'long' })
		const year = date.getFullYear()
		return `${weekday} ${day} ${month} ${year}`
	}

	const DateShort = ({ date, selectedDate }) => {
		const day = date.getDate()
		const weekday = date.toLocaleString('it-IT', { weekday: 'short' })

		const isThisDate =
			selectedDate.getDate() === date.getDate() &&
			selectedDate.getMonth() === date.getMonth() &&
			selectedDate.getFullYear() === date.getFullYear()

		const isToday = new Date(date).setHours(0, 0, 0, 0) === new Date().setHours(0, 0, 0, 0)

		return (
			<button
				title={formatDate(date)}
				className={`flex min-w-[48px] flex-col items-center justify-center p-1 font-semibold ${
					isThisDate
						? 'bg-black text-white'
						: isToday
						? 'bg-[#203E72] text-white'
						: isPast(date)
						? 'bg-gray-300 text-black opacity-40 hover:bg-gray-400'
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

	const isPast = (date) => {
		return new Date(date).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0)
	}

	const handleChange = (event) => {
		setSelectedDate(new Date(event.target.value))
	}

	function generateDateRange(startDate, endDate) {
		const dates = []
		const currentDate = new Date(startDate)

		while (currentDate <= endDate) {
			dates.push(new Date(currentDate.getTime()))
			currentDate.setDate(currentDate.getDate() + 1)
		}

		return dates
	}
	
	function getPastAndNextDateRange() {
		const today = new Date()
		const pastDays = new Date(today)
		if (auth.role === 'admin') {
			pastDays.setDate(today.getDate() - 7)
		}

		const nextDays = new Date(today)
		nextDays.setDate(today.getDate() + 17)

		return generateDateRange(pastDays, nextDays)
	}

	useEffect(() => {
		document.addEventListener('click', handleClickOutside, false)
		return () => {
			document.removeEventListener('click', handleClickOutside, false)
		}
	}, [])

	const handleClickOutside = (event) => {
		if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
			SetIsEditing(false)
		}
	}

	return (
		<div className="flex flex-col gap-2">
			<div className="relative flex items-stretch justify-between gap-2 bg-white py-2 font-semibold text-black">
				{auth.role === 'admin' || !isPast(new Date().setDate(selectedDate.getDate() - 1)) ? (
					<button
						title="Ieri"
						onClick={handlePrevDay}
					>
						<ChevronLeftIcon className="h-10 w-10 text-black" />
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
							className={`w-full border-white bg-black py-2 text-white text-center text-xl sm:text-3xl`}
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
						<ChevronRightIcon className="h-10 w-10 text-black" />
					</button>
					<button
						title="Oggi"
						onClick={handleToday}
					>
						<ArrowPathIcon className="h-10 w-10 text-black" />
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
