import { ArrowsRightLeftIcon, ArrowsUpDownIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline'
import axios from 'axios'
import { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../context/AuthContext'
import Loading from './Loading'
import Showtimes from './Showtimes'

const AulaShort = ({ aulaId, seminari, selectedDate, filterSeminario, rounded = false }) => {

	const { auth } = useContext(AuthContext)
	const [aula, setAula] = useState({})
	const [isFetchingAulaDone, setIsFetchingAulaDone] = useState(false)

	const fetchAula = async () => {
		try {
			setIsFetchingAulaDone(false)

			let response
			if (auth.role === 'admin') {
				response = await axios.get(`/aula/unreleased/${aulaId}`, {
					headers: {
						Authorization: `Bearer ${auth.token}`
					}
				})
			} else {
				response = await axios.get(`/aula/${aulaId}`)
			}
			setAula(response.data.data)
		} catch (error) {
			console.error(error)
		} finally {
			setIsFetchingAulaDone(true)
		}
	}

	useEffect(() => {
		fetchAula()
	}, [aulaId])

	function rowToNumber(column) {
		let result = 0
		for (let i = 0; i < column.length; i++) {
			const charCode = column.charCodeAt(i) - 64
			result = result * 26 + charCode
		}
		return result
	}

	if (!isFetchingAulaDone) {
		return <Loading />
	}

	return (
		<div className="flex flex-col sm:flex-row">
			<div className="flex flex-col sm:flex-row">
				<div
					className="flex min-w-[120px] flex-row items-center border-r border-black justify-center gap-x-2 bg-gray-200 px-4 text-2xl font-bold text-black sm:flex-col"
				>
					<p className="text-sm">Aula</p>
					<p className="text-3xl leading-8">{aula.number}</p>
				</div>

				{auth.role === 'admin' && (
					<div
						className="flex w-full min-w-[160px] flex-row justify-center gap-x-4 px-4 text-sm font-bold sm:w-fit sm:flex-col"
					>
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
							<ComputerDesktopIcon className="h-5 w-5" />
							{(rowToNumber(aula.seatPlan.row) * aula.seatPlan.column).toLocaleString('en-US')}{' '}
							Posti
						</div>
					</div>
				)}
			</div>

			<div className="mx-4 flex items-center">
				<Showtimes
					showtimes={aula.showtimes}
					seminari={seminari}
					selectedDate={selectedDate}
					filterSeminario={filterSeminario}
					showSeminarioDetail={false}
				/>
			</div>
		</div>
	)
}

export default AulaShort
