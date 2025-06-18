import { EyeSlashIcon } from '@heroicons/react/24/outline'
import { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

const Showtimes = ({ showtimes, seminari, selectedDate, filterSeminario, showSeminarioDetail = true }) => {
	const { auth } = useContext(AuthContext)

	const navigate = useNavigate()
	const sortedShowtimes = showtimes?.reduce((result, showtime) => {
		const { seminario, showtime: showDateTime, seats, _id, isRelease } = showtime

		if (filterSeminario && filterSeminario._id !== seminario) {
			return result // skip
		}

		if (
			new Date(showDateTime).getDate() === selectedDate.getDate() &&
			new Date(showDateTime).getMonth() === selectedDate.getMonth() &&
			new Date(showDateTime).getFullYear() === selectedDate.getFullYear()
		) {
			if (!result[seminario]) {
				result[seminario] = []
			}
			result[seminario].push({ showtime: showDateTime, seats, _id, isRelease })
		}
		return result
	}, {})

	sortedShowtimes &&
		Object.values(sortedShowtimes).forEach((seminario) => {
			seminario.sort((a, b) => new Date(a.showtime) - new Date(b.showtime))
		})

	const isPast = (date) => {
		return date < new Date()
	}

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
